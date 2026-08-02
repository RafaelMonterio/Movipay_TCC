import api from './api';

const orderService = {
  getAll:         ()         => api.get('/orders').then(r => r.data),
  create:         (sid)      => api.post('/orders', { service_id: sid }).then(r => r.data),
  updateStatus:   (id, s)    => api.patch(`/orders/${id}/status`, { status: s }).then(r => r.data),
};

export default orderService;
