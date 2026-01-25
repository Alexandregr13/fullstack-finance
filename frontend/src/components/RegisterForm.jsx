import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './Form.css'

function RegisterForm({ onSuccess }) {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validatePassword = (password) => {
    return password.length >= 6
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (name.length < 2) {
      setError('Le nom doit contenir au moins 2 caractères')
      return
    }

    if (!validateEmail(email)) {
      setError('Email invalide')
      return
    }

    if (!validatePassword(password)) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    try {
      await register(name, email, password)
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} data-testid="register-form" noValidate>
      <h2>Inscription</h2>

      <div className="form-group">
        <label htmlFor="name">Nom</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Votre nom"
          data-testid="name-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="reg-email">Email</label>
        <input
          type="email"
          id="reg-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          data-testid="register-email-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="reg-password">Mot de passe</label>
        <input
          type="password"
          id="reg-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
          data-testid="register-password-input"
        />
        {password && !validatePassword(password) && (
          <span className="hint">Au moins 6 caractères</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="confirm-password">Confirmer le mot de passe</label>
        <input
          type="password"
          id="confirm-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="********"
          data-testid="confirm-password-input"
        />
        {confirmPassword && password !== confirmPassword && (
          <span className="hint error">Les mots de passe ne correspondent pas</span>
        )}
      </div>

      {error && <p className="error" data-testid="register-error">{error}</p>}

      <button type="submit" disabled={loading} data-testid="register-submit">
        {loading ? 'Inscription...' : "S'inscrire"}
      </button>
    </form>
  )
}

export default RegisterForm
