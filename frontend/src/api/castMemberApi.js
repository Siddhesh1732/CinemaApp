import api from './axiosInstance'
export const getAllCastMembers  = (page=0,size=50) => api.get(`/cast-members?page=${page}&size=${size}`)
export const searchCastMembers = (q)               => api.get(`/cast-members/search?q=${q}`)
export const createCastMember  = (data)            => api.post('/cast-members', data)
export const updateCastMember  = (id, data)        => api.put(`/cast-members/${id}`, data)
export const deleteCastMember  = (id)              => api.delete(`/cast-members/${id}`)
