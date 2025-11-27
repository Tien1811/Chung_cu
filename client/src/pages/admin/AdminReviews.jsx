// src/pages/admin/AdminReviews.jsx
import { useEffect, useState } from 'react'

export default function AdminReviews() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError('')
        const res = await fetch('/api/admin/reviews')
        if (!res.ok) throw new Error('Không tải được danh sách đánh giá')
        const data = await res.json()
        setItems(data.data || data)
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
      <h2>Quản lý đánh giá</h2>
      {loading && <p>Đang tải...</p>}
      {error && <p style={{ color: '#fecaca' }}>{error}</p>}

      <div className="admin-card" style={{ marginTop: 10 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Bài đăng</th>
              <th>User</th>
              <th>Rating</th>
              <th>Nội dung</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>#{r.post_id}</td>
                <td>{r.user?.name || r.user_id}</td>
                <td>{r.rating}/5</td>
                <td>{r.content}</td>
                <td>{new Date(r.created_at).toLocaleString('vi-VN')}</td>
              </tr>
            ))}
            {!loading && !items.length && (
              <tr>
                <td colSpan="6">Chưa có đánh giá nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
