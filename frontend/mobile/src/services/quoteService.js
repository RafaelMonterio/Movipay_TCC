import api from './api';

const quoteService = {
  async getAll()                { const { data } = await api.get('/quotes');                    return data; },
  async getById(id)             { const { data } = await api.get(`/quotes/${id}`);               return data; },
  async create(payload)         { const { data } = await api.post('/quotes', payload);           return data; },
  async accept(id)              { const { data } = await api.patch(`/quotes/${id}/accept`);       return data; },
  async decline(id)             { const { data } = await api.patch(`/quotes/${id}/decline`);      return data; },
};

export default quoteService;
