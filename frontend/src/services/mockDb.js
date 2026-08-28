/**
 * mockDb.js
 * ─────────
 * Banco de dados local persistente (localStorage) para garantir que
 * o MoviPay funcione de forma 100% fluida, sem erros de "Erro ao carregar..."
 * em Orçamentos, Pedidos, Chat, Perfil e Trabalhadores.
 */

const SEED_USERS = [
  {
    id: 1,
    name: 'Ana Cliente',
    email: 'ana@teste.com',
    password: '123456',
    mode: 'client',
    points: 280,
    phone: '(11) 99999-1111',
    bio: 'Cliente ativa do MoviPay. Busco serviços rápidos e de qualidade.',
    city: 'Ribeirão Pires',
    avatar_url: '',
    avg_rating: '5.0',
    total_orders: 12,
  },
  {
    id: 2,
    name: 'Bruno Silva',
    email: 'bruno@teste.com',
    password: '123456',
    mode: 'worker',
    points: 540,
    phone: '(11) 98888-2222',
    bio: 'Eletricista residencial e predial com 8 anos de experiência. Instalações e manutenções com garantia.',
    category: 'eletrica',
    city: 'Ribeirão Pires',
    avatar_url: '',
    avg_rating: '4.9',
    total_orders: 28,
    is_verified: true,
    is_available: true,
    lat: -23.7142,
    lng: -46.4137,
  },
  {
    id: 3,
    name: 'Carlos Santos',
    email: 'carlos@teste.com',
    password: '123456',
    mode: 'worker',
    points: 390,
    phone: '(11) 97777-3333',
    bio: 'Encanador e desentupidor profissional. Atendimento rápido e resolução de vazamentos.',
    category: 'hidraulica',
    city: 'Mauá',
    avatar_url: '',
    avg_rating: '4.8',
    total_orders: 19,
    is_verified: true,
    is_available: true,
    lat: -23.6678,
    lng: -46.4614,
  },
  {
    id: 4,
    name: 'Maria Oliveira',
    email: 'maria@teste.com',
    password: '123456',
    mode: 'worker',
    points: 610,
    phone: '(11) 96666-4444',
    bio: 'Diarista e especialista em higienização e limpeza pesada pós-obra.',
    category: 'limpeza',
    city: 'Santo André',
    avatar_url: '',
    avg_rating: '5.0',
    total_orders: 42,
    is_verified: true,
    is_available: true,
    lat: -23.6542,
    lng: -46.5312,
  },
];

const SEED_ORDERS = [
  {
    id: 101,
    client_id: 1,
    worker_id: 2,
    client_name: 'Ana Cliente',
    worker_name: 'Bruno Silva',
    service_id: 1,
    service_title: 'Instalação de Tomadas e Disjuntor',
    price: '180.00',
    status: 'in_progress',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    scheduled_at: new Date(Date.now() + 3600000 * 2).toISOString(),
    address: 'Rua das Flores, 120 - Centro, Ribeirão Pires',
    notes: 'Troca de fiação no quarto e disjuntor geral do quadro de luz.',
  },
  {
    id: 102,
    client_id: 1,
    worker_id: 4,
    client_name: 'Ana Cliente',
    worker_name: 'Maria Oliveira',
    service_id: 2,
    service_title: 'Limpeza Residencial Completa',
    price: '220.00',
    status: 'accepted',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    scheduled_at: new Date(Date.now() + 3600000 * 20).toISOString(),
    address: 'Rua das Flores, 120 - Centro, Ribeirão Pires',
    notes: 'Limpeza pesada e vidraças.',
  },
  {
    id: 103,
    client_id: 1,
    worker_id: 3,
    client_name: 'Ana Cliente',
    worker_name: 'Carlos Santos',
    service_id: 3,
    service_title: 'Troca de Sifão e Válvula da Pia',
    price: '120.00',
    status: 'completed',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    scheduled_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    address: 'Rua das Flores, 120 - Centro, Ribeirão Pires',
    notes: 'Vazamento consertado.',
  },
  {
    id: 104,
    client_id: 1,
    worker_id: 2,
    client_name: 'Ana Cliente',
    worker_name: 'Bruno Silva',
    service_id: 4,
    service_title: 'Manutenção de Chuveiro Elétrico',
    price: '90.00',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    scheduled_at: new Date(Date.now() + 3600000 * 14).toISOString(),
    address: 'Rua das Flores, 120 - Centro, Ribeirão Pires',
    notes: 'Troca de resistência e fiação derretida.',
  },
];

const SEED_QUOTES = [
  {
    id: 201,
    client_id: 1,
    client_name: 'Ana Cliente',
    title: 'Reforma Elétrica da Sala e Cozinha',
    description: 'Preciso trocar o quadro de luz e passar nova fiação para o ar condicionado.',
    category: 'eletrica',
    category_name: 'Elétrica',
    category_icon: 'bolt',
    budget_max: '650.00',
    city: 'Ribeirão Pires',
    status: 'open',
    proposal_count: 2,
    created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
    expires_at: new Date(Date.now() + 86400000 * 5).toISOString(),
    proposals: [
      {
        id: 301,
        quote_id: 201,
        worker_id: 2,
        worker_name: 'Bruno Silva',
        price: '580.00',
        message: 'Olá Ana, realizo esse serviço com material de primeira e garantia de 1 ano. Posso iniciar na quarta-feira.',
        status: 'pending',
        avg_rating: '4.9',
        is_verified: true,
        total_orders: 28,
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: 302,
        quote_id: 201,
        worker_id: 3,
        worker_name: 'Carlos Santos',
        price: '620.00',
        message: 'Consigo fazer com tubulação embutida e disjuntores DIN modernos.',
        status: 'pending',
        avg_rating: '4.8',
        is_verified: true,
        total_orders: 19,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    ],
  },
  {
    id: 202,
    client_id: 1,
    client_name: 'Ana Cliente',
    title: 'Pintura Completa de Apartamento 60m²',
    description: 'Pintura de 2 quartos, sala e corredor com tinta acrílica fosca.',
    category: 'pintura',
    category_name: 'Pintura',
    category_icon: 'paint',
    budget_max: '1200.00',
    city: 'Ribeirão Pires',
    status: 'in_review',
    proposal_count: 1,
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    expires_at: new Date(Date.now() + 86400000 * 4).toISOString(),
    proposals: [
      {
        id: 303,
        quote_id: 202,
        worker_id: 2,
        worker_name: 'Bruno Silva',
        price: '1100.00',
        message: 'Faço a preparação de massa corrida, lixamento e 2 demãos completas.',
        status: 'accepted',
        avg_rating: '4.9',
        is_verified: true,
        total_orders: 28,
        created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
    ],
  },
  {
    id: 203,
    client_id: 1,
    client_name: 'Ana Cliente',
    title: 'Higienização e Limpeza Pós-Obra',
    description: 'Limpeza fina para entrega de imóvel recém reformado.',
    category: 'limpeza',
    category_name: 'Limpeza',
    category_icon: 'broom',
    budget_max: '400.00',
    city: 'Ribeirão Pires',
    status: 'open',
    proposal_count: 1,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    expires_at: new Date(Date.now() + 86400000 * 6).toISOString(),
    proposals: [
      {
        id: 304,
        quote_id: 203,
        worker_id: 4,
        worker_name: 'Maria Oliveira',
        price: '380.00',
        message: 'Equipe especializada com produtos próprios de remoção de resíduos de cimento e tinta.',
        status: 'pending',
        avg_rating: '5.0',
        is_verified: true,
        total_orders: 42,
        created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      },
    ],
  },
];

const SEED_CHATS = {
  101: [
    {
      id: 401,
      order_id: 101,
      sender_id: 1,
      sender_name: 'Ana Cliente',
      content: 'Olá Bruno, você consegue vir por volta das 14h hoje?',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      is_read: true,
    },
    {
      id: 402,
      order_id: 101,
      sender_id: 2,
      sender_name: 'Bruno Silva',
      content: 'Olá Ana! Sim, já separei as ferramentas e os disjuntores. Às 14h pontual estarei aí.',
      created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      is_read: true,
    },
    {
      id: 403,
      order_id: 101,
      sender_id: 1,
      sender_name: 'Ana Cliente',
      content: 'Ótimo, o interfone é o 32. Muito obrigada!',
      created_at: new Date(Date.now() - 3600000 * 1.2).toISOString(),
      is_read: true,
    },
    {
      id: 404,
      order_id: 101,
      sender_id: 2,
      sender_name: 'Bruno Silva',
      content: 'Perfeito, até logo!',
      created_at: new Date(Date.now() - 3600000 * 0.9).toISOString(),
      is_read: true,
    },
  ],
  102: [
    {
      id: 405,
      order_id: 102,
      sender_id: 1,
      sender_name: 'Ana Cliente',
      content: 'Boa tarde Maria! Confirmado para amanhã de manhã?',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      is_read: true,
    },
    {
      id: 406,
      order_id: 102,
      sender_id: 4,
      sender_name: 'Maria Oliveira',
      content: 'Boa tarde Ana! Tudo confirmado sim, chego às 08h30 com todos os produtos de limpeza.',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      is_read: true,
    },
  ],
  103: [
    {
      id: 407,
      order_id: 103,
      sender_id: 1,
      sender_name: 'Ana Cliente',
      content: 'Muito obrigada pelo serviço, o vazamento foi 100% resolvido!',
      created_at: new Date(Date.now() - 3600000 * 40).toISOString(),
      is_read: true,
    },
    {
      id: 408,
      order_id: 103,
      sender_id: 3,
      sender_name: 'Carlos Santos',
      content: 'Por nada, Ana! Fico à disposição para qualquer outro reparo.',
      created_at: new Date(Date.now() - 3600000 * 39).toISOString(),
      is_read: true,
    },
  ],
  104: [
    {
      id: 409,
      order_id: 104,
      sender_id: 1,
      sender_name: 'Ana Cliente',
      content: 'Olá Bruno, o chuveiro parou de aquecer ontem à noite. Consegue dar uma olhada?',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      is_read: true,
    },
  ],
};

function getStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
}

export const mockDb = {
  getOrders() {
    return getStorage('movipay_orders', SEED_ORDERS);
  },

  getOrderById(id) {
    const orders = this.getOrders();
    return orders.find(o => String(o.id) === String(id)) || orders[0] || null;
  },

  createOrder(serviceId) {
    const orders = this.getOrders();
    const newOrder = {
      id: Date.now(),
      client_id: 1,
      worker_id: 2,
      client_name: 'Ana Cliente',
      worker_name: 'Bruno Silva',
      service_id: serviceId || 1,
      service_title: 'Serviço Solicitado',
      price: '150.00',
      status: 'pending',
      created_at: new Date().toISOString(),
      scheduled_at: new Date(Date.now() + 86400000).toISOString(),
      address: 'Rua das Flores, 120 - Centro',
      notes: 'Solicitação criada pelo cliente.',
    };
    orders.unshift(newOrder);
    setStorage('movipay_orders', orders);
    return newOrder;
  },

  updateOrderStatus(id, status, cancelReason = null) {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => String(o.id) === String(id));
    if (idx !== -1) {
      orders[idx].status = status;
      if (cancelReason) orders[idx].cancel_reason = cancelReason;
      orders[idx].updated_at = new Date().toISOString();
      setStorage('movipay_orders', orders);
      return orders[idx];
    }
    return null;
  },

  getQuotes() {
    return getStorage('movipay_quotes', SEED_QUOTES);
  },

  getQuoteById(id) {
    const quotes = this.getQuotes();
    return quotes.find(q => String(q.id) === String(id)) || quotes[0] || null;
  },

  createQuote(payload) {
    const quotes = this.getQuotes();
    const newQuote = {
      id: Date.now(),
      client_id: 1,
      client_name: 'Ana Cliente',
      title: payload.title,
      description: payload.description,
      category: payload.category || 'eletrica',
      category_name: (payload.category || 'Geral').toUpperCase(),
      category_icon: 'bolt',
      budget_max: payload.budget_max ? String(payload.budget_max) : '0.00',
      city: payload.city || 'Ribeirão Pires',
      status: 'open',
      proposal_count: 0,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 86400000 * 7).toISOString(),
      proposals: [],
    };
    quotes.unshift(newQuote);
    setStorage('movipay_quotes', quotes);
    return newQuote;
  },

  createProposal(quoteId, payload) {
    const quotes = this.getQuotes();
    const quote = quotes.find(q => String(q.id) === String(quoteId));
    if (quote) {
      const newProposal = {
        id: Date.now(),
        quote_id: quoteId,
        worker_id: 2,
        worker_name: 'Bruno Silva',
        price: String(payload.price || '200.00'),
        message: payload.message || '',
        status: 'pending',
        avg_rating: '4.9',
        is_verified: true,
        total_orders: 28,
        created_at: new Date().toISOString(),
      };
      quote.proposals = quote.proposals || [];
      quote.proposals.push(newProposal);
      quote.proposal_count = quote.proposals.length;
      setStorage('movipay_quotes', quotes);
      return newProposal;
    }
    return null;
  },

  updateProposalStatus(quoteId, proposalId, status) {
    const quotes = this.getQuotes();
    const quote = quotes.find(q => String(q.id) === String(quoteId));
    if (quote && quote.proposals) {
      const prop = quote.proposals.find(p => String(p.id) === String(proposalId));
      if (prop) {
        prop.status = status;
        if (status === 'accepted') quote.status = 'in_review';
        setStorage('movipay_quotes', quotes);
        return prop;
      }
    }
    return null;
  },

  getChatMessages(orderId) {
    const allChats = getStorage('movipay_chats', SEED_CHATS);
    return allChats[orderId] || [];
  },

  sendChatMessage(orderId, senderId, content, senderName = 'Você') {
    const allChats = getStorage('movipay_chats', SEED_CHATS);
    if (!allChats[orderId]) allChats[orderId] = [];

    const newMsg = {
      id: Date.now(),
      order_id: Number(orderId),
      sender_id: senderId || 1,
      sender_name: senderName,
      content: content.trim(),
      created_at: new Date().toISOString(),
      is_read: true,
    };

    allChats[orderId].push(newMsg);
    setStorage('movipay_chats', allChats);
    return newMsg;
  },

  getWorkers() {
    return SEED_USERS.filter(u => u.mode === 'worker');
  },

  getWorkerById(id) {
    const workers = this.getWorkers();
    return workers.find(w => String(w.id) === String(id)) || workers[0] || null;
  },

  getCurrentUser() {
    const devUser = getStorage('dev_user', null);
    if (devUser) return devUser;
    return SEED_USERS[0];
  },

  updateUser(id, payload) {
    const devUser = this.getCurrentUser();
    const updated = { ...devUser, ...payload };
    setStorage('dev_user', updated);
    return updated;
  },
};

