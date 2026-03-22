import api from './axiosInstance'

export const getMyProfile      = ()           => api.get('/users/me')
export const updateMyProfile   = (data)       => api.put('/users/me', data)
export const getUserByUsername = (username)   => api.get(`/users/${username}`)
export const searchUsers       = (query)      => api.get(`/users/search?q=${query}`)
