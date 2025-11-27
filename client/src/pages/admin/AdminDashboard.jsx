// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '@/assets/style/pages/admin.css'

// ------ helper: parse JSON an toàn ------
async function safeJson(res) {
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    console.warn('Phản hồi không phải JSON:', res.url, text.slice(0, 120))
    return null
  }
}

function normalizeErrorMessage(err) {
  const msg = String(err?.message || err)
  if (msg.includes('Unexpected token') && msg.includes('<')) {
    return 'API trả về HTML (thường là lỗi 404/500) nên không parse được JSON. Kiểm tra lại route /api/admin/posts ở backend.'
  }
  return msg
}

export default function AdminDashboard() {
  // --- SỐ LIỆU TỔNG QUAN (stats) ---
  // map với các bảng: posts, users, reviews, saved_posts
  const [stats, setStats] = useState({
    total_posts: 0,
    total_users: 0,
    total_reviews: 0,
    total_saved: 0,
  })

  // --- DANH SÁCH BÀI ĐĂNG (bảng posts) ---
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([]) // bảng categories

  const [status, setStatus] = useState('all') // enum status trong posts
  const [categoryId, setCategoryId] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ================== LOAD STATS ==================
  useEffect(() => {
    ;(async () => {
      try {
        // API: GET /api/admin/stats
        // Gợi ý response:
        // { "total_posts": 10, "total_users": 5, "total_reviews": 3, "total_saved": 8 }
        const res = await fetch('/api/admin/stats')
        const data = await safeJson(res)

        if (!res.ok) {
          throw new Error(data?.message || 'Không tải được số liệu thống kê')
        }

        setStats(prev => ({
          ...prev,
          ...(data?.data || data || {}),
        }))
      } catch (err) {
        console.error('Lỗi load stats:', err)
        // không cần hiển thị lỗi to, chỉ log console
      }
    })()
  }, [])

  // ================== LOAD CATEGORIES ==================
  useEffect(() => {
    ;(async () => {
      try {
        // API: GET /api/categories
        // Gợi ý response: { data: [{id, name, slug}, ...] }
        const res = await fetch('/api/categories')
        const data = await safeJson(res)
        if (!res.ok) return

        setCategories(data?.data || data || [])
      } catch (err) {
        console.error('Lỗi load categories:', err)
      }
    })()
  }, [])

  // ================== LOAD POSTS (bảng posts) ==================
  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        setError('')

        const params = new URLSearchParams()
        if (status !== 'all') params.set('status', status)
        if (categoryId) params.set('category_id', categoryId)
        if (q.trim()) params.set('q', q.trim())
        params.set('page', String(page))

        // API: GET /api/admin/posts
        // Gợi ý response kiểu Laravel:
        // {
        //   data: [
        //     {
        //       id, title, price, area, address,
        //       status, published_at,
        //       user: { id, name, email },
        //       category: { id, name },
        //       province: { id, name },
        //       district: { id, name },
        //       ward: { id, name }
        //     }, ...
        //   ],
        //   meta: { current_page, last_page, ... }
        // }
        const res = await fetch(`/api/admin/posts?${params.toString()}`)
        const data = await safeJson(res)

        if (!res.ok) {
          throw new Error(data?.message || 'Không tải được danh sách bài đăng')
        }

        const list = data?.data || data || []
        setPosts(Array.isArray(list) ? list : [])

        const meta = data?.meta || data?.pagination || {}
        setLastPage(meta.last_page || 1)
      } catch (err) {
        console.error('Lỗi load posts:', err)
        setError(normalizeErrorMessage(err))
      } finally {
        setLoading(false)
      }
    })()
  }, [status, categoryId, q, page])

  // ================== ĐỔI TRẠNG THÁI BÀI ĐĂNG ==================
  const handleToggleStatus = async (postId, currentStatus) => {
    const next = currentStatus === 'published' ? 'hidden' : 'published'
    if (!window.confirm(`Chuyển trạng thái bài #${postId} sang "${next}"?`)) return

    try {
      // API: PATCH /api/admin/posts/{id}/status
      // body: { status: "published" | "hidden" | ... }
      const res = await fetch(`/api/admin/posts/${postId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })

      const data = await safeJson(res)

      if (!res.ok) {
        throw new Error(data?.message || 'Không cập nhật được trạng thái')
      }

      setPosts(prev =>
        prev.map(p => (p.id === postId ? { ...p, status: next } : p)),
      )
    } catch (err) {
      console.error('Lỗi đổi trạng thái:', err)
      alert(err.message || 'Có lỗi khi cập nhật trạng thái')
    }
  }

  const resetFilters = () => {
    setStatus('all')
    setCategoryId('')
    setQ('')
    setPage(1)
  }

  // ================== RENDER ==================
  return (
    <div className="admin-page">
      {/* HEADER */}
      <header className="admin-header">
        <div>
          <h1>Bảng điều khiển</h1>
          <p>
            Quản lý bài đăng, người dùng và đánh giá trong hệ thống cho thuê
            chung cư / phòng trọ.
          </p>
        </div>

        <div className="admin-header__actions">
          {/* API create post: front sẽ điều hướng sang form tạo (AdminPost.jsx) */}
          <Link
            to="/admin/posts/create"
            className="admin-btn admin-btn--primary"
          >
            + Đăng bài mới
          </Link>
        </div>
      </header>

      {/* STATS CARDS (posts, users, reviews, saved_posts) */}
      <section className="admin-stats">
        <div className="admin-stat">
          <p className="admin-stat__label">Tổng bài đăng</p>
          <p className="admin-stat__value">{stats.total_posts}</p>
          <p className="admin-stat__hint">Bảng posts</p>
        </div>
        <div className="admin-stat">
          <p className="admin-stat__label">Người dùng</p>
          <p className="admin-stat__value">{stats.total_users}</p>
          <p className="admin-stat__hint">Bảng users</p>
        </div>
        <div className="admin-stat">
          <p className="admin-stat__label">Đánh giá</p>
          <p className="admin-stat__value">{stats.total_reviews}</p>
          <p className="admin-stat__hint">Bảng reviews</p>
        </div>
        <div className="admin-stat">
          <p className="admin-stat__label">Bài đã lưu</p>
          <p className="admin-stat__value">{stats.total_saved}</p>
          <p className="admin-stat__hint">Bảng saved_posts</p>
        </div>
      </section>

      {/* DANH SÁCH BÀI ĐĂNG (bảng posts) */}
      <section className="admin-section">
        <div className="admin-section__head">
          <div>
            <h2>Danh sách bài đăng</h2>
            <p>
              Quản lý bài đăng phòng trọ / nhà nguyên căn / căn hộ trong bảng{' '}
              <code>posts</code>.
            </p>
          </div>

          <div className="admin-filters">
            <input
              className="admin-input"
              placeholder="Tìm theo tiêu đề, địa chỉ, ID…"
              value={q}
              onChange={e => {
                setQ(e.target.value)
                setPage(1)
              }}
            />
            <select
              className="admin-input"
              value={categoryId}
              onChange={e => {
                setCategoryId(e.target.value)
                setPage(1)
              }}
            >
              <option value="">Tất cả loại phòng</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              className="admin-input"
              value={status}
              onChange={e => {
                setStatus(e.target.value)
                setPage(1)
              }}
            >
              <option value="all">Trạng thái: Tất cả</option>
              <option value="pending">Chờ duyệt</option>
              <option value="published">Đang hiển thị</option>
              <option value="hidden">Đã ẩn</option>
            </select>
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={resetFilters}
            >
              Xoá lọc
            </button>
          </div>
        </div>

        {error && <p className="admin-error">{error}</p>}
        {loading && !error && (
          <p className="admin-loading">Đang tải danh sách bài đăng…</p>
        )}

        {!loading && !error && (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tiêu đề</th>
                    <th>Giá / Diện tích</th>
                    <th>Địa chỉ</th>
                    <th>Loại</th>
                    <th>Chủ phòng</th>
                    <th>Trạng thái</th>
                    <th>Ngày đăng</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.length === 0 && (
                    <tr>
                      <td colSpan="9" className="admin-empty">
                        Không có bài đăng nào phù hợp.
                      </td>
                    </tr>
                  )}

                  {posts.map(post => (
                    <tr key={post.id}>
                      <td>#{post.id}</td>
                      <td className="admin-td-title">
                        <Link
                          to={`/post/${post.id}`}
                          className="admin-link"
                          target="_blank"
                        >
                          {post.title}
                        </Link>
                      </td>
                      <td>
                        <div>
                          {post.price?.toLocaleString?.('vi-VN') ?? post.price}{' '}
                          ₫
                        </div>
                        <div className="admin-td-sub">{post.area} m²</div>
                      </td>
                      <td>
                        <div>{post.address}</div>
                        <div className="admin-td-sub">
                          {post.ward?.name}, {post.district?.name},{' '}
                          {post.province?.name}
                        </div>
                      </td>
                      <td>{post.category?.name || '—'}</td>
                      <td>
                        <div>{post.user?.name || '—'}</div>
                        <div className="admin-td-sub">{post.user?.email}</div>
                      </td>
                      <td>
                        <span
                          className={`admin-badge admin-badge--${
                            post.status || 'pending'
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td>
                        {post.published_at
                          ? new Date(
                              post.published_at,
                            ).toLocaleDateString('vi-VN')
                          : '—'}
                      </td>
                      <td className="admin-td-actions">
                        <Link
                          to={`/admin/posts/${post.id}/edit`}
                          className="admin-link"
                        >
                          Sửa
                        </Link>
                        <button
                          type="button"
                          className="admin-link admin-link--danger"
                          onClick={() =>
                            handleToggleStatus(post.id, post.status)
                          }
                        >
                          {post.status === 'published' ? 'Ẩn' : 'Hiển thị'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PHÂN TRANG */}
            <div className="admin-paging">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                ‹ Trước
              </button>
              <span>
                Trang {page} / {lastPage}
              </span>
              <button
                type="button"
                onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                disabled={page >= lastPage}
              >
                Sau ›
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
