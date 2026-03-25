import api from './axiosInstance'

export const getRecommendations = () => api.get('/recommendations/me')
