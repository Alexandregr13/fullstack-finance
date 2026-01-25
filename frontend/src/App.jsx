import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Header from './components/Header'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import Home from './views/Home'
import AdviceDetail from './views/AdviceDetail'
import MyAdvices from './views/MyAdvices'
import CreateAdvice from './views/CreateAdvice'
import Search from './views/Search'
import AdminPanel from './views/AdminPanel'
import './App.css'

// Route protégée
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/" />
  }

  return children
}

// Page d'authentification
function AuthPage() {
  const [showRegister, setShowRegister] = useState(false)
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/" />
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {showRegister ? (
          <>
            <RegisterForm onSuccess={() => setShowRegister(false)} />
            <p className="auth-switch">
              Déjà un compte ?{' '}
              <button onClick={() => setShowRegister(false)} className="link-button">
                Se connecter
              </button>
            </p>
          </>
        ) : (
          <>
            <LoginForm />
            <p className="auth-switch">
              Pas encore de compte ?{' '}
              <button onClick={() => setShowRegister(true)} className="link-button">
                S'inscrire
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function AppContent() {
  return (
    <HashRouter>
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/advice/:id" element={<AdviceDetail />} />
          <Route path="/search" element={<Search />} />
          <Route
            path="/my-advices"
            element={
              <ProtectedRoute>
                <MyAdvices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-advice"
            element={
              <ProtectedRoute>
                <CreateAdvice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </HashRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
