import api from './api';

const pointsService = {
  async getBalance() { const { data } = await api.get('/points/balance'); return data.balance; },
  async getHistory() { const { data } = await api.get('/points/history'); return data.transactions; },
};

export default pointsService;
