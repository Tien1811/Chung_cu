// src/pages/admin/AdminSavedPosts.jsx
import { useEffect, useState } from 'react'
import '@/assets/style/pages/admin.css'

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

async function safeJson(res) {
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    console.warn('Phản hồi không phải JSON:', res.url, text.slice(0, 120))
    return null
  }
}

export default function AdminSavedPosts() {
  // ===== STATE =====
  const [items, setItems] = useState([])      // danh sách saved_posts từ API
  const [q, setQ] = useState('')             // từ khoá tìm theo user / post
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const token = localStorage.getItem('access_token')

  // ============================
  // LOAD DANH SÁCH BÀI ĐÃ LƯU
  // ============================
  useEffect(() => {
    const controller = new AbortController()

    async function fetchSaved() {
      try {
        setLoading(true)
        setError('')

        const params = new URLSearchParams()
        if (q.trim()) params.append('q', q.trim())

        const res = await fetch(
          `${API_BASE_URL}/admin/saved-posts?${params.toString()}`,
          {
            signal: controller.signal,
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
              Accept: 'application/json',
            },
          },
        )

        const json = await safeJson(res)

        if (!res.ok) {
          throw new Error(
            json?.message || 'Không tải được danh sách bài đã lưu',
          )
        }

        const list = json?.data || json || []
        setItems(Array.isArray(list) ? list : [])
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error(err)
        setError(err.message || 'Có lỗi khi tải bài đã lưu')
      } finally {
        setLoading(false)
      }
    }

    fetchSaved()
    return () => controller.abort()
  }, [q, token])

  // ============================
  // XOÁ 1 DÒNG SAVED_POST
  // ============================
  const handleDelete = async id => {
    if (!window.confirm(`Xoá dòng saved_posts #${id}?`)) return

    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/saved-posts/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            Accept: 'application/json',
          },
        },
      )

      const json = await safeJson(res)

      if (!res.ok || json?.status === false) {
        throw new Error(json?.message || 'Không xoá được dòng saved_posts')
      }

      // xoá trên FE
      setItems(prev => prev.filter(it => it.id !== id))
    } catch (err) {
      console.error(err)
      alert(err.message || 'Có lỗi khi xoá')
    }
  }

  return (
    <section className="admin-page">
      {/* HEADER */}
      <header className="admin-page__head">
        <div>
          <h1 className="admin-page__title">Bài đã lưu của người dùng</h1>
          <p className="admin-page__desc">
            Quản lý bảng <code>saved_posts</code> – xem ai đang lưu bài nào.
          </p>
        </div>
      </header>

      {/* CARD CHÍNH */}
      <div className="admin-section--card">
        {/* Thanh search */}
        <div className="admin-toolbar">
          <div className="admin-input-wrap admin-input-wrap--search">
            <span className="admin-input__icon">🔍</span>
            <input
              className="admin-input admin-input--search"
              placeholder="Tìm theo email, tên người dùng hoặc tiêu đề bài đăng..."
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
        </div>

        {/* Thông báo lỗi / loading */}
        {error && <p className="admin-error">{error}</p>}
        {loading && (
          <p className="admin-loading">Đang tải danh sách bài đã lưu…</p>
        )}

        {/* Bảng dữ liệu */}
        <div className="admin-card-table">
          <table className="admin-table admin-table--compact">
            <thead>
              <tr>
                <th>ID</th>
                <th>Người dùng</th>
                <th>Bài đăng</th>
                <th>Ngày lưu</th>
                <th style={{ width: 90 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && !loading && !error && (
                <tr>
                  <td colSpan={5} className="admin-empty">
                    Chưa có ai lưu bài nào hoặc không tìm thấy kết quả.
                  </td>
                </tr>
              )}

              {items.map(row => {
                const user = row.user || {}
                const post = row.post || {}
                const savedAt = row.created_at
                  ? new Date(row.created_at).toLocaleString('vi-VN')
                  : '—'

                return (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>
                      <div>{user.name || user.email || 'Không rõ'}</div>
                      {user.email && (
                        <div className="admin-td-sub">{user.email}</div>
                      )}
                    </td>
                    <td>
                      <div>{post.title || '—'}</div>
                      {post.id && (
                        <div className="admin-td-sub">Post #{post.id}</div>
                      )}
                    </td>
                    <td>{savedAt}</td>
                    <td className="admin-td-actions">
                      <button
                        type="button"
                        className="admin-chip admin-chip--danger"
                        onClick={() => handleDelete(row.id)}
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
