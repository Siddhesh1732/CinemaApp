import api from './axiosInstance'
export const getAllGenres = ()         => api.get('/genres')
export const createGenre = (data)     => api.post('/genres', data)
export const updateGenre = (id, data) => api.put(`/genres/${id}`, data)
export const deleteGenre = (id)       => api.delete(`/genres/${id}`)
