import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Header.css'

function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          Conseils Investissements
        </Link>

        <nav className="nav">
          <Link to="/">Accueil</Link>
          <Link to="/search">Recherche</Link>

          {user ? (
            <>
              <Link to="/my-advices">Mes conseils</Link>
              <Link to="/create-advice">Nouveau conseil</Link>
              {user.isAdmin && <Link to="/admin">Admin</Link>}
              <span className="user-info">
                {user.name}
                <button onClick={logout} className="logout-btn">
                  Déconnexion
                </button>
              </span>
            </>
          ) : (
            <Link to="/login">Connexion</Link>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
