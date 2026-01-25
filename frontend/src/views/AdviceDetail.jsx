import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import './AdviceDetail.css'

function AdviceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [advice, setAdvice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAdvice()
  }, [id])

  const fetchAdvice = async () => {
    try {
      const data = await api.get(`/api/advices/${id}`)
      setAdvice(data)
    } catch (err) {
      setError('Conseil non trouvé')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Supprimer ce conseil ?')) return

    try {
      await api.delete(`/api/advices/${id}`)
      navigate('/')
    } catch (err) {
      console.error('Erreur suppression:', err)
    }
  }

  if (loading) return <div className="loading">Chargement...</div>
  if (error) return <div className="error">{error}</div>
  if (!advice) return null

  const isOwner = user && user.id === advice.authorId
  const canEdit = isOwner || (user && user.isAdmin)

  return (
    <div className="advice-detail">
      <article className="advice-content">
        <header>
          <h1>{advice.title}</h1>
          <div className="advice-meta">
            <span>Par {advice.author?.name}</span>
            <span>{new Date(advice.createdAt).toLocaleDateString('fr-FR')}</span>
            {advice.investmentType && (
              <span className="type-badge">{advice.investmentType.replace('_', ' ')}</span>
            )}
          </div>
        </header>

        {advice.summary && (
          <p className="summary">{advice.summary}</p>
        )}

        <div className="content">{advice.content}</div>

        <div className="stats">
          {advice.estimatedGain !== null && (
            <div className="stat">
              <label>Gain estimé</label>
              <span className={advice.estimatedGain >= 0 ? 'positive' : 'negative'}>
                {advice.estimatedGain >= 0 ? '+' : ''}{advice.estimatedGain}%
              </span>
            </div>
          )}
          {advice.confidenceIndex !== null && (
            <div className="stat">
              <label>Indice de confiance</label>
              <span>{advice.confidenceIndex}%</span>
            </div>
          )}
        </div>

        {advice.assets && advice.assets.length > 0 && (
          <div className="assets">
            <h3>Actifs référencés</h3>
            <div className="asset-list">
              {advice.assets.map((asset, i) => (
                <span key={i} className="asset-tag">{asset}</span>
              ))}
            </div>
          </div>
        )}

        {advice.categories && advice.categories.length > 0 && (
          <div className="categories">
            <h3>Catégories</h3>
            <div className="category-list">
              {advice.categories.map(cat => (
                <span key={cat.id} className="category-tag">{cat.name}</span>
              ))}
            </div>
          </div>
        )}

        {canEdit && (
          <div className="actions">
            <Link to={`/edit-advice/${id}`} className="btn">Modifier</Link>
            <button onClick={handleDelete} className="danger">Supprimer</button>
          </div>
        )}
      </article>
    </div>
  )
}

export default AdviceDetail
