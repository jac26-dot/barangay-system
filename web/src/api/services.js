import api from './api';

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: ()     => api.get('/auth/me'),
};

// Dashboard
export const dashboardAPI = {
  getStats:   () => api.get('/dashboard/stats'),
  getMonthly: () => api.get('/dashboard/monthly'),
};

// Residents
export const residentAPI = {
  getAll:  (params)   => api.get('/residents', { params }),
  getOne:  (id)       => api.get(`/residents/${id}`),
  create:  (data)     => api.post('/residents', data),
  update:  (id, data) => api.put(`/residents/${id}`, data),
  remove:  (id)       => api.delete(`/residents/${id}`),
};

// Documents
export const documentAPI = {
  getAll:  (params)   => api.get('/documents', { params }),
  getOne:  (id)       => api.get(`/documents/${id}`),
  create:  (data)     => api.post('/documents', data),
  update:  (id, data) => api.put(`/documents/${id}`, data),
  remove:  (id)       => api.delete(`/documents/${id}`),
};

// Blotter
export const blotterAPI = {
  getAll:  (params)   => api.get('/blotter', { params }),
  getOne:  (id)       => api.get(`/blotter/${id}`),
  create:  (data)     => api.post('/blotter', data),
  update:  (id, data) => api.put(`/blotter/${id}`, data),
  remove:  (id)       => api.delete(`/blotter/${id}`),
};

// Officials
export const officialAPI = {
  getAll:  ()         => api.get('/officials'),
  getOne:  (id)       => api.get(`/officials/${id}`),
  create:  (data)     => api.post('/officials', data),
  update:  (id, data) => api.put(`/officials/${id}`, data),
  remove:  (id)       => api.delete(`/officials/${id}`),
};

// Users
export const userAPI = {
  getAll:  ()         => api.get('/users'),
  create:  (data)     => api.post('/users', data),
  update:  (id, data) => api.put(`/users/${id}`, data),
  remove:  (id)       => api.delete(`/users/${id}`),
};
