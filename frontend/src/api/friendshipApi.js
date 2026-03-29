import api from './axiosInstance'
export const sendRequest        = (id)              => api.post(`/friendships/request/${id}`)
export const acceptRequest      = (id)              => api.put(`/friendships/accept/${id}`)
export const rejectRequest      = (id)              => api.put(`/friendships/reject/${id}`)
export const unfriend           = (id)              => api.delete(`/friendships/${id}`)
export const getMyFriends       = ()                => api.get('/friendships/me')
export const getPendingRequests = ()                => api.get('/friendships/pending')
export const getFriendList      = (userId, listType)=> api.get(`/friendships/${userId}/lists/${listType}`)
