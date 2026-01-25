import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import AdviceCard from '../components/AdviceCard'
import './MyAdvices.css'

function MyAdvices() {
  const [advices, setAdvices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMyAdvices()
  }, [])

  const fetchMyAdvices = async () => {
    try {
      const data = await api.get('/api/advices/myadvices')
      setAdvices(data)
    } catch (err) {
      setError('Erreur lors du chargement de vos conseils')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Chargement...</div>

  return (
    <div className="my-advices">
      <header className="page-header">
        <h1>Mes conseils</h1>
        <Link to="/create-advice" className="btn primary">
          Nouveau conseil
        </Link>
      </header>

      {error && <p className="error">{error}</p>}

      <div className="advice-list">
        {advices.map(advice => (
          <AdviceCard key={advice.id} advice={advice} />
        ))}
      </div>

      {advices.length === 0 && (
        <div className="empty-state">
          <p>Vous n'avez pas encore créé de conseil</p>
          <Link to="/create-advice" className="btn primary">
            Créer mon premier conseil
          </Link>
        </div>
      )}
    </div>
  )
}

export default MyAdvices
