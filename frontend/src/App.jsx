import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import LandingPage        from './pages/LandingPage'
import LoginPage          from './pages/LoginPage'
import RegisterPage       from './pages/RegisterPage'
import HomePage           from './pages/HomePage'
import MovieDetailPage    from './pages/MovieDetailPage'
import MyProfilePage      from './pages/MyProfilePage'
import FriendProfilePage  from './pages/FriendProfilePage'
import FriendsPage        from './pages/FriendsPage'
import SearchUsersPage    from './pages/SearchUsersPage'
import AdminPanel         from './pages/admin/AdminPanel'
import AdminMovies        from './pages/admin/AdminMovies'
import AdminGenres        from './pages/admin/AdminGenres'
import AdminCastMembers   from './pages/admin/AdminCastMembers'
import ProtectedRoute     from './components/ProtectedRoute'
import AdminRoute         from './components/AdminRoute'
import Navbar             from './components/Navbar'

function Layout({ children }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--void)' }}>
      <Navbar />
      <main className="pt-20">{children}</main>
    </div>
  )
}

export default function App() {
  const { user } = useAuth()
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/"         element={<LandingPage />} />
          <Route path="/login"    element={user ? <Navigate to="/home" /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/home" /> : <RegisterPage />} />

          <Route path="/home"     element={<ProtectedRoute><Layout><HomePage /></Layout></ProtectedRoute>} />
          <Route path="/movies/:id" element={<ProtectedRoute><Layout><MovieDetailPage /></Layout></ProtectedRoute>} />
          <Route path="/profile"  element={<ProtectedRoute><Layout><MyProfilePage /></Layout></ProtectedRoute>} />
          <Route path="/users/:username" element={<ProtectedRoute><Layout><FriendProfilePage /></Layout></ProtectedRoute>} />
          <Route path="/friends"  element={<ProtectedRoute><Layout><FriendsPage /></Layout></ProtectedRoute>} />
          <Route path="/search"   element={<ProtectedRoute><Layout><SearchUsersPage /></Layout></ProtectedRoute>} />

          <Route path="/admin"              element={<AdminRoute><Layout><AdminPanel /></Layout></AdminRoute>} />
          <Route path="/admin/movies"       element={<AdminRoute><Layout><AdminMovies /></Layout></AdminRoute>} />
          <Route path="/admin/genres"       element={<AdminRoute><Layout><AdminGenres /></Layout></AdminRoute>} />
          <Route path="/admin/cast-members" element={<AdminRoute><Layout><AdminCastMembers /></Layout></AdminRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}
