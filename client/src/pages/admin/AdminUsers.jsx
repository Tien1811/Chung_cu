// src/pages/admin/AdminUsers.jsx
import { useEffect, useState } from 'react'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError('')
        const res = await fetch('/api/admin/users')
        if (!res.ok) throw new Error('Không tải được danh sách người dùng')
        const data = await res.json()
        setUsers(data.data || data)
      } catch (err) {
        setError(err.message || 'Có lỗi xảy ra')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div>
      <h2>Quản lý người dùng</h2>
      {loading && <p>Đang tải...</p>}
      {error && <p style={{ color: '#fecaca' }}>{error}</p>}

      <div className="admin-card" style={{ marginTop: 10 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{new Date(u.created_at).toLocaleString('vi-VN')}</td>
              </tr>
            ))}
            {!loading && !users.length && (
              <tr>
                <td colSpan="5">Chưa có người dùng.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
