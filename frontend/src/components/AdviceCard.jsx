import { Link } from 'react-router-dom'
import './AdviceCard.css'

function AdviceCard({ advice }) {
  const getTypeLabel = (type) => {
    const labels = {
      short_term: 'Court terme',
      medium_term: 'Moyen terme',
      long_term: 'Long terme'
    }
    return labels[type] || type
  }

  const getTypeClass = (type) => {
    const classes = {
      short_term: 'short',
      medium_term: 'medium',
      long_term: 'long'
    }
    return classes[type] || ''
  }

  return (
    <article className="advice-card">
      <div className="advice-header">
        <Link to={`/advice/${advice.id}`} className="advice-title">
          {advice.title}
        </Link>
        {advice.investmentType && (
          <span className={`advice-type ${getTypeClass(advice.investmentType)}`}>
            {getTypeLabel(advice.investmentType)}
          </span>
        )}
      </div>

      {advice.summary && (
        <p className="advice-summary">{advice.summary}</p>
      )}

      <div className="advice-meta">
        <span className="advice-author">
          Par {advice.author?.name || 'Anonyme'}
        </span>
        <span className="advice-date">
          {new Date(advice.createdAt).toLocaleDateString('fr-FR')}
        </span>
      </div>

      <div className="advice-stats">
        {advice.estimatedGain !== null && (
          <span className={`stat gain ${advice.estimatedGain >= 0 ? 'positive' : 'negative'}`}>
            {advice.estimatedGain >= 0 ? '+' : ''}{advice.estimatedGain}%
          </span>
        )}
        {advice.confidenceIndex !== null && (
          <span className="stat confidence">
            Confiance: {advice.confidenceIndex}%
          </span>
        )}
      </div>

      {advice.categories && advice.categories.length > 0 && (
        <div className="advice-categories">
          {advice.categories.map(cat => (
            <span key={cat.id} className="category-tag">{cat.name}</span>
          ))}
        </div>
      )}
    </article>
  )
}

export default AdviceCard
