// src/pages/admin/AdminCategories.jsx
import { useEffect, useState } from 'react'

export default function AdminCategories() {
  // ===== STATE =====
  const [items, setItems] = useState([])        // danh sách categories từ API
  const [q, setQ] = useState('')               // từ khoá tìm kiếm
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ===== LOAD DANH MỤC TỪ API =====
  useEffect(() => {
    const controller = new AbortController()

    async function fetchCategories() {
      try {
        setLoading(true)
        setError('')

        const params = new URLSearchParams()
        if (q.trim()) params.append('q', q.trim())

        /**
         * API #1 – Lấy danh sách categories
         * Gợi ý backend Laravel:
         *   GET /api/admin/categories?q={keyword}
         *
         * Response gợi ý:
         *   {
         *     "data": [
         *       { "id": 1, "slug": "phong-tro", "name": "Phòng trọ", "posts_count": 120 },
         *       ...
         *     ]
         *   }
         * hoặc trả mảng [] trực tiếp cũng được.
         */
        const res = await fetch(
          `/api/admin/categories?${params.toString()}`,
          { signal: controller.signal },
        )

        const text = await res.text()
        let json
        try {
          json = JSON.parse(text)
        } catch {
          // trường hợp backend đang trả HTML (404, trang login, lỗi PHP...)
          throw new Error("Response không phải JSON hợp lệ (backend chưa trả JSON).")
        }

        if (!res.ok) {
          throw new Error(json?.message || 'Không tải được danh sách danh mục')
        }

        const list = json.data || json
        setItems(Array.isArray(list) ? list : [])
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error(err)
        setError(err.message || 'Có lỗi khi tải danh mục')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
    return () => controller.abort()
  }, [q])

  // ===== XOÁ 1 DANH MỤC =====
  const handleDelete = async (id) => {
    if (!window.confirm(`Bạn chắc chắn muốn xoá danh mục #${id}?`)) return

    try {
      /**
       * API #2 – Xoá 1 category
       *   DELETE /api/admin/categories/{id}
       * Gợi ý Laravel:
       *   Route::delete('/admin/categories/{category}', ...);
       */
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })

      const text = await res.text()
      let json = {}
      try {
        json = text ? JSON.parse(text) : {}
      } catch {
        // nếu backend trả 204 No Content thì không sao, bỏ qua parse
      }

      if (!res.ok) {
        throw new Error(json?.message || 'Không xoá được danh mục')
      }

      // xoá khỏi state ở FE
      setItems((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      console.error(err)
      alert(err.message || 'Có lỗi khi xoá danh mục')
    }
  }

  return (
    <section className="admin-page">
      {/* PHẦN HEADER TRANG */}
      <header className="admin-page__head">
        <div>
          <h1 className="admin-page__title">Danh mục bài đăng</h1>
          <p className="admin-page__desc">
            Quản lý bảng <code>categories</code>: tên danh mục, slug, số lượng bài (posts_count).
          </p>
        </div>

        {/* TODO: sau này mở modal / chuyển trang tạo mới */}
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={() => alert('TODO: mở form tạo category mới')}
        >
          + Thêm danh mục
        </button>
      </header>

      {/* CARD CHÍNH */}
      <div className="admin-section--card">
        {/* Thanh search */}
        <div className="admin-toolbar">
          <div className="admin-input-wrap admin-input-wrap--search">
            <span className="admin-input__icon">🔍</span>
            <input
              className="admin-input admin-input--search"
              placeholder="Tìm theo tên danh mục..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {/* Thông báo lỗi / loading */}
        {error && <p className="admin-error">{error}</p>}
        {loading && <p className="admin-loading">Đang tải danh mục…</p>}

        {/* Bảng dữ liệu */}
        <div className="admin-card-table">
          <table className="admin-table admin-table--compact">
            <thead>
              <tr>
                <th>ID</th>
                <th>Slug</th>
                <th>Tên</th>
                <th>Số bài đăng</th>
                <th style={{ width: 150 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {/* Nếu không có data */}
              {items.length === 0 && !loading && !error && (
                <tr>
                  <td colSpan={5} className="admin-empty">
                    Chưa có danh mục nào hoặc không tìm thấy kết quả.
                  </td>
                </tr>
              )}

              {/* Data thật từ API */}
              {items.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td>{cat.slug}</td>
                  <td>{cat.name}</td>
                  <td>{cat.posts_count ?? 0}</td>
                  <td className="admin-td-actions">
                    {/* TODO: thay alert bằng form sửa */}
                    <button
                      type="button"
                      className="admin-chip admin-chip--ghost"
                      onClick={() =>
                        alert(`TODO: mở form sửa category #${cat.id}`)
                      }
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="admin-chip admin-chip--danger"
                      onClick={() => handleDelete(cat.id)}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
