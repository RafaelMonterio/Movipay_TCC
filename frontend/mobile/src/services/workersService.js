import api from './api';

const workersService = {
  async getAll() { const { data } = await api.get('/workers'); return data.workers || []; },
};

export default workersService;
