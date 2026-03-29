import api from './axiosInstance'
export const getAllMovies     = (page=0,size=12,sort='releaseYear,desc') => api.get(`/movies?page=${page}&size=${size}&sort=${sort}`)
export const getMovieById    = (id)       => api.get(`/movies/${id}`)
export const searchMovies    = (q)        => api.get(`/movies/search?q=${q}`)
export const createMovie     = (data)     => api.post('/movies', data)
export const updateMovie     = (id, data) => api.put(`/movies/${id}`, data)
export const deleteMovie     = (id)       => api.delete(`/movies/${id}`)
export const getMovieReviews = (id)       => api.get(`/movies/${id}/reviews`)
