import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, Pressable, TextInput, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import chatService from '../../services/chatService';
import { useTheme } from '../../context/ThemeContext';

function ConversationList({ onOpen }) {
  const theme = useTheme();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await chatService.getConversations();
      setConversations(data.conversations || data || []);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={theme.primary} />;

  return (
    <FlatList
      data={conversations}
      keyExtractor={i => String(i.id)}
      onRefresh={load}
      refreshing={loading}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={[styles.empty, { color: theme.textSecondary }]}>Nenhuma conversa ainda.</Text>
          <Text style={[styles.emptySub, { color: theme.textDisabled }]}>
            Suas conversas com clientes e profissionais aparecem aqui.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onOpen(item)}
          style={[styles.convoCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>{(item.name || item.worker_name || item.client_name || '?')[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.convoName, { color: theme.text }]} numberOfLines={1}>
              {item.name || item.worker_name || item.client_name || 'Conversa'}
            </Text>
            <Text style={[styles.convoLast, { color: theme.textSecondary }]} numberOfLines={1}>
              {item.last_message || 'Toque para abrir a conversa'}
            </Text>
          </View>
        </Pressable>
      )}
    />
  );
}

function ConversationThread({ conversation, onBack }) {
  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await chatService.getMessages(conversation.id);
      setMessages(data.messages || data || []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [conversation.id]);

  useEffect(() => { load(); }, [load]);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText('');
    try {
      const msg = await chatService.sendMessage(conversation.id, trimmed);
      setMessages(prev => [...prev, msg]);
    } catch {
      // Keep the typed text so the user doesn't lose their message if
      // sending failed (e.g. offline / backend unreachable).
      setText(trimmed);
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.threadHeader, { borderColor: theme.border, backgroundColor: theme.card }]}>
        <Pressable onPress={onBack} hitSlop={10}>
          <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 15 }}>‹ Voltar</Text>
        </Pressable>
        <Text style={[styles.threadName, { color: theme.text }]} numberOfLines={1}>
          {conversation.name || conversation.worker_name || conversation.client_name || 'Conversa'}
        </Text>
        <View style={{ width: 56 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={theme.primary} />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(i, idx) => String(i.id ?? idx)}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 40, color: theme.textSecondary }}>
              Diga oi para começar a conversa 👋
            </Text>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.mine
                  ? { alignSelf: 'flex-end', backgroundColor: theme.primary }
                  : { alignSelf: 'flex-start', backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 },
              ]}
            >
              <Text style={{ color: item.mine ? '#fff' : theme.text, fontSize: 14 }}>{item.text}</Text>
            </View>
          )}
        />
      )}

      <View style={[styles.inputRow, { borderColor: theme.border, backgroundColor: theme.card }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Escreva uma mensagem..."
          placeholderTextColor={theme.textDisabled}
          style={[styles.input, { color: theme.text }]}
          multiline
        />
        <Pressable onPress={handleSend} style={[styles.sendBtn, { backgroundColor: theme.primary, opacity: text.trim() ? 1 : 0.5 }]}>
          <Text style={styles.sendText}>➤</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

export default function ChatScreen() {
  const theme = useTheme();
  const [active, setActive] = useState(null);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {active ? (
        <ConversationThread conversation={active} onBack={() => setActive(null)} />
      ) : (
        <ConversationList onOpen={setActive} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  convoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, borderWidth: 1.5, padding: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  convoName: { fontSize: 15, fontWeight: '700' },
  convoLast: { fontSize: 13, marginTop: 2 },
  emptyBox: { alignItems: 'center', marginTop: 60, gap: 6, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 38, marginBottom: 6 },
  empty: { textAlign: 'center', fontWeight: '700', fontSize: 15 },
  emptySub: { textAlign: 'center', fontSize: 13 },
  threadHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  threadName: { fontSize: 15, fontWeight: '700', flex: 1, textAlign: 'center' },
  bubble: { maxWidth: '78%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 10, borderTopWidth: 1 },
  input: { flex: 1, maxHeight: 100, fontSize: 14, paddingHorizontal: 12, paddingVertical: 8 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  sendText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
