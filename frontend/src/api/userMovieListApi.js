import api from './axiosInstance'
export const addToList      = (movieId, listType)       => api.post('/user-movies', { movieId, listType })
export const removeFromList = (movieId, listType)       => api.delete(`/user-movies/${movieId}/${listType}`)
export const getAllMyLists  = ()                        => api.get('/user-movies/me/all')
export const rateMovie      = (movieId, rating, review) => api.put(`/user-movies/${movieId}/rate`, { rating, review })
