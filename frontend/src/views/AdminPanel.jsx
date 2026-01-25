import { useState, useEffect } from 'react'
import api from '../services/api'
import './AdminPanel.css'

function AdminPanel() {
  const [users, setUsers] = useState([])
  const [categories, setCategories] = useState([])
  const [activeTab, setActiveTab] = useState('users')
  const [loading, setLoading] = useState(true)

  const [newCategory, setNewCategory] = useState({ name: '', parentId: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersData, categoriesData] = await Promise.all([
        api.get('/api/users'),
        api.get('/api/categories/flat')
      ])
      setUsers(usersData)
      setCategories(categoriesData)
    } catch (err) {
      console.error('Erreur chargement données:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAdmin = async (user) => {
    try {
      await api.put(`/api/users/${user.id}`, { isAdmin: !user.isAdmin })
      setUsers(users.map(u => u.id === user.id ? { ...u, isAdmin: !u.isAdmin } : u))
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Supprimer cet utilisateur ?')) return
    try {
      await api.delete(`/api/users/${userId}`)
      setUsers(users.filter(u => u.id !== userId))
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    try {
      const created = await api.post('/api/categories', {
        name: newCategory.name,
        parentId: newCategory.parentId || null
      })
      setCategories([...categories, created])
      setNewCategory({ name: '', parentId: '' })
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Supprimer cette catégorie ?')) return
    try {
      await api.delete(`/api/categories/${categoryId}`)
      setCategories(categories.filter(c => c.id !== categoryId))
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div className="loading">Chargement...</div>

  return (
    <div className="admin-panel">
      <h1>Administration</h1>

      <div className="tabs">
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Utilisateurs ({users.length})
        </button>
        <button
          className={activeTab === 'categories' ? 'active' : ''}
          onClick={() => setActiveTab('categories')}
        >
          Catégories ({categories.length})
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="panel-content">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Admin</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={user.isAdmin}
                      onChange={() => handleToggleAdmin(user)}
                    />
                  </td>
                  <td>
                    <button onClick={() => handleDeleteUser(user.id)} className="danger">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="panel-content">
          <form onSubmit={handleCreateCategory} className="create-form">
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              placeholder="Nom de la catégorie"
              required
            />
            <select
              value={newCategory.parentId}
              onChange={(e) => setNewCategory({ ...newCategory, parentId: e.target.value })}
            >
              <option value="">Racine</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {'─'.repeat(cat.level)} {cat.name}
                </option>
              ))}
            </select>
            <button type="submit">Créer</button>
          </form>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Niveau</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td>{'─'.repeat(cat.level)} {cat.name}</td>
                  <td>{cat.level}</td>
                  <td>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="danger">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminPanel
