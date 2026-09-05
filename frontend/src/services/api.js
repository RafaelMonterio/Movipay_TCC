import axios from 'axios';
import { mockDb } from './mockDb';

/**
 * Roteador de mock local para responder requisições imediatamente
 * sem poluir o terminal com erros 404 e garantindo funcionamento 100% offline.
 */
function handleMockRoute(config) {
  const rawUrl = (config.url || '').replace(/^https?:\/\/[^/]+/, '');
  const url = rawUrl.replace(/^\/api\/v1/, '').split('?')[0];
  const method = (config.method || 'get').toLowerCase();
  const data = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});

  // /orders
  if (url === '/orders' || url === '/orders/' || url === '') {
    if (method === 'get') {
      const orders = mockDb.getOrders();
      return { orders, total: orders.length };
    }
    if (method === 'post') {
      return mockDb.createOrder(data.service_id);
    }
  }

  // /orders/:id/status
  const orderStatusMatch = url.match(/^\/orders\/([^/]+)\/status$/);
  if (orderStatusMatch && method === 'patch') {
    const id = orderStatusMatch[1];
    return mockDb.updateOrderStatus(id, data.status, data.cancel_reason);
  }

  // /orders/:id
  const orderDetailMatch = url.match(/^\/orders\/([^/]+)$/);
  if (orderDetailMatch && method === 'get') {
    const id = orderDetailMatch[1];
    return mockDb.getOrderById(id);
  }

  // /quotes
  if (url === '/quotes' || url === '/quotes/') {
    if (method === 'get') {
      const quotes = mockDb.getQuotes();
      return { quotes, total: quotes.length };
    }
    if (method === 'post') {
      return mockDb.createQuote(data);
    }
  }

  // /quotes/:id/proposals/:pid
  const quoteProposalStatusMatch = url.match(/^\/quotes\/([^/]+)\/proposals\/([^/]+)$/);
  if (quoteProposalStatusMatch && method === 'patch') {
    const [, qid, pid] = quoteProposalStatusMatch;
    return mockDb.updateProposalStatus(qid, pid, data.status);
  }

  // /quotes/:id/proposals
  const quoteProposalMatch = url.match(/^\/quotes\/([^/]+)\/proposals$/);
  if (quoteProposalMatch && method === 'post') {
    const qid = quoteProposalMatch[1];
    return mockDb.createProposal(qid, data);
  }

  // /quotes/:id
  const quoteDetailMatch = url.match(/^\/quotes\/([^/]+)$/);
  if (quoteDetailMatch && method === 'get') {
    const id = quoteDetailMatch[1];
    return mockDb.getQuoteById(id);
  }

  // /chat/:orderId
  const chatMatch = url.match(/^\/chat\/([^/]+)$/);
  if (chatMatch) {
    const orderId = chatMatch[1];
    if (method === 'get') {
      const messages = mockDb.getChatMessages(orderId);
      return { messages, total: messages.length };
    }
    if (method === 'post') {
      const user = mockDb.getCurrentUser();
      return mockDb.sendChatMessage(orderId, user?.id, data.content, user?.name);
    }
  }

  // /auth/me
  if (url === '/auth/me' || url === '/users/profile') {
    if (method === 'get') return mockDb.getCurrentUser();
  }

  // /users/:id
  const userMatch = url.match(/^\/users\/([^/]+)$/);
  if (userMatch && method === 'patch') {
    return mockDb.updateUser(userMatch[1], data);
  }

  // /workers
  if (url === '/workers' || url === '/workers/') {
    if (method === 'get') {
      const workers = mockDb.getWorkers();
      return { workers, total: workers.length };
    }
  }

  // /workers/:id
  const workerDetailMatch = url.match(/^\/workers\/([^/]+)$/);
  if (workerDetailMatch && method === 'get') {
    return mockDb.getWorkerById(workerDetailMatch[1]);
  }

  // /workers/:id/availability
  if (url.match(/^\/workers\/[^/]+\/availability$/) && method === 'patch') {
    return { is_available: data.is_available };
  }

  // /workers/:id/portfolio
  if (url.match(/^\/workers\/[^/]+\/portfolio$/) && method === 'post') {
    return { id: Date.now(), url: data.url || '' };
  }

  if (url.match(/^\/workers\/[^/]+\/portfolio\/[^/]+$/) && method === 'delete') {
    return { success: true };
  }

  // /points/balance & /points/history
  if (url === '/points/balance') {
    return { balance: mockDb.getCurrentUser().points || 280 };
  }
  if (url === '/points/history') {
    return {
      transactions: [
        { id: 1, type: 'order_completed', points: 100, description: 'Serviço concluído', created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
        { id: 2, type: 'review_given', points: 30, description: 'Avaliação 5 estrelas enviada', created_at: new Date(Date.now() - 3600000 * 48).toISOString() },
        { id: 3, type: 'first_login', points: 150, description: 'Bônus de boas-vindas MoviPay', created_at: new Date(Date.now() - 3600000 * 96).toISOString() },
      ],
    };
  }

  // /payments/wallet
  if (url === '/payments/wallet') {
    return {
      balance: 1450.00,
      pending: 380.00,
      history: [
        { id: 1, amount: 180.00, description: 'Instalação Elétrica', created_at: new Date().toISOString() },
        { id: 2, amount: 220.00, description: 'Limpeza Residencial', created_at: new Date().toISOString() },
      ],
    };
  }

  // /calendar/events
  if (url === '/calendar/events') {
    return { events: [] };
  }

  // /services
  if (url === '/services' || url === '/services/') {
    if (method === 'get') {
      return {
        services: [
          { id: 1, title: 'Instalação Elétrica', price: 150.00, category: 'eletrica' },
          { id: 2, title: 'Limpeza Residencial', price: 220.00, category: 'limpeza' },
          { id: 3, title: 'Conserto Hidráulico', price: 120.00, category: 'hidraulica' },
        ],
      };
    }
    if (method === 'post') {
      return { id: Date.now(), ...data };
    }
  }

  // /reviews
  if (url === '/reviews' && method === 'post') {
    return { id: Date.now(), ...data };
  }

  return { success: true };
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  timeout: 3500,
  headers: { 'Content-Type': 'application/json' },
  adapter: async (config) => {
    // Se estiver no browser e usando token dev ou sem backend dedicado, responde diretamente sem gerar 404 no servidor
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      const isDevToken = !token || token === 'dev-token';
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const isLocalhost3000 = !apiUrl || apiUrl.includes('localhost:3000');

      if (isDevToken || isLocalhost3000) {
        try {
          const data = handleMockRoute(config);
          return {
            data,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
            request: {},
          };
        } catch (e) {
          console.warn('Mock route error:', e);
        }
      }
    }

    // Caso haja um backend externo configurado
    const defaultAdapter = axios.defaults.adapter;
    if (typeof defaultAdapter === 'function') {
      try {
        return await defaultAdapter(config);
      } catch (err) {
        if (typeof window !== 'undefined') {
          const data = handleMockRoute(config);
          return {
            data,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
            request: {},
          };
        }
        throw err;
      }
    }

    const data = handleMockRoute(config);
    return {
      data,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      request: {},
    };
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token && token !== 'dev-token') {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
