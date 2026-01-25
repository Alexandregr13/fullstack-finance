import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import AdviceCard from '../components/AdviceCard'
import './Search.css'

function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [advices, setAdvices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    type: searchParams.get('type') || '',
    minConfidence: searchParams.get('minConfidence') || ''
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (searchParams.toString()) {
      handleSearch()
    }
  }, [searchParams])

  const fetchCategories = async () => {
    try {
      const data = await api.get('/api/categories/flat')
      setCategories(data)
    } catch (err) {
      console.error('Erreur chargement catégories:', err)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.q) params.append('q', filters.q)
      if (filters.category) params.append('category', filters.category)
      if (filters.type) params.append('type', filters.type)
      if (filters.minConfidence) params.append('minConfidence', filters.minConfidence)

      const data = await api.get(`/api/advices/search/query?${params.toString()}`)
      setAdvices(data)
    } catch (err) {
      console.error('Erreur recherche:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    setSearchParams(params)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="search-page">
      <h1>Recherche</h1>

      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-main">
          <input
            type="text"
            name="q"
            value={filters.q}
            onChange={handleChange}
            placeholder="Rechercher un conseil..."
          />
          <button type="submit">Rechercher</button>
        </div>

        <div className="search-filters">
          <div className="filter">
            <label>Catégorie</label>
            <select name="category" value={filters.category} onChange={handleChange}>
              <option value="">Toutes</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {'─'.repeat(cat.level)} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter">
            <label>Type</label>
            <select name="type" value={filters.type} onChange={handleChange}>
              <option value="">Tous</option>
              <option value="short_term">Court terme</option>
              <option value="medium_term">Moyen terme</option>
              <option value="long_term">Long terme</option>
            </select>
          </div>

          <div className="filter">
            <label>Confiance min.</label>
            <input
              type="number"
              name="minConfidence"
              value={filters.minConfidence}
              onChange={handleChange}
              placeholder="0-100"
              min="0"
              max="100"
            />
          </div>
        </div>
      </form>

      <div className="search-results">
        {loading ? (
          <div className="loading">Recherche en cours...</div>
        ) : (
          <>
            <p className="results-count">{advices.length} résultat(s)</p>
            <div className="advice-list">
              {advices.map(advice => (
                <AdviceCard key={advice.id} advice={advice} />
              ))}
            </div>
            {advices.length === 0 && !loading && (
              <p className="empty">Aucun résultat pour cette recherche</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Search
