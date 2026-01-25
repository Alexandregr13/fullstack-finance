import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './CreateAdvice.css'

function CreateAdvice() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    investmentType: '',
    estimatedGain: '',
    confidenceIndex: '',
    assets: '',
    categoryIds: []
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const data = await api.get('/api/categories/flat')
      setCategories(data)
    } catch (err) {
      console.error('Erreur chargement catégories:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, opt => parseInt(opt.value))
    setFormData(prev => ({ ...prev, categoryIds: selected }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.title || !formData.content) {
      setError('Titre et contenu requis')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        estimatedGain: formData.estimatedGain ? parseFloat(formData.estimatedGain) : null,
        confidenceIndex: formData.confidenceIndex ? parseFloat(formData.confidenceIndex) : null,
        assets: formData.assets ? formData.assets.split(',').map(a => a.trim()).filter(Boolean) : []
      }

      const advice = await api.post('/api/advices', payload)
      navigate(`/advice/${advice.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-advice">
      <h1>Créer un conseil</h1>

      <form onSubmit={handleSubmit} className="advice-form">
        <div className="form-group">
          <label htmlFor="title">Titre *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Titre de votre conseil"
          />
        </div>

        <div className="form-group">
          <label htmlFor="summary">Résumé</label>
          <textarea
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            placeholder="Court résumé de votre conseil"
            rows={2}
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Contenu *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Détaillez votre conseil d'investissement..."
            rows={8}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="investmentType">Type d'investissement</label>
            <select
              id="investmentType"
              name="investmentType"
              value={formData.investmentType}
              onChange={handleChange}
            >
              <option value="">Sélectionner...</option>
              <option value="short_term">Court terme</option>
              <option value="medium_term">Moyen terme</option>
              <option value="long_term">Long terme</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="categoryIds">Catégories</label>
            <select
              id="categoryIds"
              multiple
              value={formData.categoryIds}
              onChange={handleCategoryChange}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {'─'.repeat(cat.level)} {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="estimatedGain">Gain estimé (%)</label>
            <input
              type="number"
              id="estimatedGain"
              name="estimatedGain"
              value={formData.estimatedGain}
              onChange={handleChange}
              placeholder="Ex: 15"
              step="0.1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confidenceIndex">Indice de confiance (0-100)</label>
            <input
              type="number"
              id="confidenceIndex"
              name="confidenceIndex"
              value={formData.confidenceIndex}
              onChange={handleChange}
              placeholder="Ex: 75"
              min="0"
              max="100"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="assets">Actifs référencés</label>
          <input
            type="text"
            id="assets"
            name="assets"
            value={formData.assets}
            onChange={handleChange}
            placeholder="AAPL, TSLA, BTC (séparés par des virgules)"
          />
        </div>

        {error && <p className="error">{error}</p>}

        <div className="form-actions">
          <button type="button" onClick={() => navigate(-1)} className="secondary">
            Annuler
          </button>
          <button type="submit" disabled={loading}>
            {loading ? 'Création...' : 'Publier le conseil'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateAdvice
