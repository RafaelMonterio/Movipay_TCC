import api from './api';

const orderService = {
  async getAll()              { const { data } = await api.get('/orders');                            return data; },
  async getById(id)           { const { data } = await api.get(`/orders/${id}`);                      return data; },
  async create(service_id)    { const { data } = await api.post('/orders', { service_id });            return data; },
  async updateStatus(id, status) { const { data } = await api.patch(`/orders/${id}/status`, { status }); return data; },
};

export default orderService;
