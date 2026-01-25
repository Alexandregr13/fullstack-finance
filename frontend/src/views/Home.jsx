import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import AdviceCard from '../components/AdviceCard'
import './Home.css'

function Home() {
  const [latestAdvices, setLatestAdvices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [advicesData, categoriesData] = await Promise.all([
        api.get('/api/advices/latest'),
        api.get('/api/categories')
      ])
      setLatestAdvices(advicesData)
      setCategories(categoriesData)
    } catch (err) {
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const renderCategory = (category, level = 0) => (
    <li key={category.id} style={{ marginLeft: level * 16 }}>
      <Link to={`/search?category=${category.id}`}>{category.name}</Link>
      {category.children && category.children.length > 0 && (
        <ul>
          {category.children.map(child => renderCategory(child, level + 1))}
        </ul>
      )}
    </li>
  )

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  return (
    <div className="home">
      <section className="hero">
        <h1>Conseils en Investissements Collaboratifs</h1>
        <p>Découvrez et partagez des conseils d'investissement avec la communauté</p>
        <div className="hero-actions">
          <Link to="/search" className="btn primary">Explorer les conseils</Link>
          <Link to="/create-advice" className="btn secondary">Partager un conseil</Link>
        </div>
      </section>

      {error && <p className="error">{error}</p>}

      <div className="home-content">
        <section className="latest-section">
          <h2>Derniers conseils</h2>
          <div className="advice-list">
            {latestAdvices.map(advice => (
              <AdviceCard key={advice.id} advice={advice} />
            ))}
          </div>
          {latestAdvices.length === 0 && (
            <p className="empty">Aucun conseil pour le moment</p>
          )}
        </section>

        <aside className="categories-sidebar">
          <h2>Categories</h2>
          {categories.length > 0 ? (
            <ul className="categories-tree">
              {categories.map(cat => renderCategory(cat))}
            </ul>
          ) : (
            <p className="empty">Aucune catégorie</p>
          )}
        </aside>
      </div>
    </div>
  )
}

export default Home
