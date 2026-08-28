import api from './api';

const chatService = {
  async getConversations() { const { data } = await api.get('/chat/conversations'); return data; },
  async getMessages(conversationId) { const { data } = await api.get(`/chat/conversations/${conversationId}/messages`); return data; },
  async sendMessage(conversationId, text) {
    const { data } = await api.post(`/chat/conversations/${conversationId}/messages`, { text });
    return data;
  },
};

export default chatService;
