import api from './axiosInstance'

export const sendRequest      = (addresseeId)            => api.post(`/friendships/request/${addresseeId}`)
export const acceptRequest    = (requesterId)            => api.put(`/friendships/accept/${requesterId}`)
export const rejectRequest    = (requesterId)            => api.put(`/friendships/reject/${requesterId}`)
export const blockUser        = (userId)                 => api.put(`/friendships/block/${userId}`)
export const unfriend         = (userId)                 => api.delete(`/friendships/${userId}`)
export const getMyFriends     = ()                       => api.get('/friendships/me')
export const getPendingRequests = ()                     => api.get('/friendships/pending')
export const getFriendList    = (userId, listType)       => api.get(`/friendships/${userId}/lists/${listType}`)
