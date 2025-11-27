// src/pages/admin/AdminEnvironmentFeatures.jsx
import { useEffect, useState } from 'react'

export default function AdminEnvironmentFeatures() {
  // ===== STATE =====
  const [items, setItems] = useState([])        // danh sách environment_features từ API
  const [q, setQ] = useState('')               // từ khoá tìm kiếm
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ===== LOAD MÔI TRƯỜNG TỪ API =====
  useEffect(() => {
    const controller = new AbortController()

    async function fetchEnvFeatures() {
      try {
        setLoading(true)
        setError('')

        const params = new URLSearchParams()
        if (q.trim()) params.append('q', q.trim())

        /**
         * API #1 – Lấy danh sách environment_features
         *
         * Gợi ý backend Laravel:
         *   GET /api/admin/environment-features?q={keyword}
         *
         * Eloquent:
         *   EnvironmentFeature::query()
         *     ->when($q, fn($qr) =>
         *        $qr->where('name','like',"%$q%")
         *            ->orWhere('slug','like',"%$q%"))
         *     ->withCount('posts');   // quan hệ qua bảng environment_post
         *
         * Response gợi ý:
         *   {
         *     "data": [
         *       { "id": 1, "slug": "gan-truong", "name": "Gần trường học", "posts_count": 80 },
         *       ...
         *     ]
         *   }
         * hoặc trả thẳng mảng [].
         */
        const res = await fetch(
          `/api/admin/environment-features?${params.toString()}`,
          { signal: controller.signal },
        )

        const text = await res.text()
        let json
        try {
          json = JSON.parse(text)
        } catch {
          throw new Error('Response không phải JSON hợp lệ (backend chưa trả JSON).')
        }

        if (!res.ok) {
          throw new Error(json?.message || 'Không tải được danh sách yếu tố môi trường')
        }

        const list = json.data || json
        setItems(Array.isArray(list) ? list : [])
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error(err)
        setError(err.message || 'Có lỗi khi tải yếu tố môi trường')
      } finally {
        setLoading(false)
      }
    }

    fetchEnvFeatures()
    return () => controller.abort()
  }, [q])

  // ===== XOÁ 1 YẾU TỐ MÔI TRƯỜNG =====
  const handleDelete = async (id) => {
    if (!window.confirm(`Bạn chắc chắn muốn xoá yếu tố môi trường #${id}?`)) return

    try {
      /**
       * API #2 – Xoá environment_feature
       *
       * Gợi ý Laravel:
       *   DELETE /api/admin/environment-features/{environment_feature}
       *
       * Trong controller:
       *   $feature->posts()->detach();   // xoá liên kết trong bảng environment_post
       *   $feature->delete();
       */
      const res = await fetch(`/api/admin/environment-features/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })

      const text = await res.text()
      let json = {}
      try {
        json = text ? JSON.parse(text) : {}
      } catch {
        // nếu 204 No Content thì không sao
      }

      if (!res.ok) {
        throw new Error(json?.message || 'Không xoá được yếu tố môi trường')
      }

      // cập nhật lại state FE
      setItems((prev) => prev.filter((f) => f.id !== id))
    } catch (err) {
      console.error(err)
      alert(err.message || 'Có lỗi khi xoá yếu tố môi trường')
    }
  }

  return (
    <section className="admin-page">
      {/* HEADER TRANG */}
      <header className="admin-page__head">
        <div>
          <h1 className="admin-page__title">Môi trường xung quanh</h1>
          <p className="admin-page__desc">
            Quản lý bảng <code>environment_features</code> và liên kết{' '}
            <code>environment_post</code> (gần chợ, gần trường, bến xe...).
          </p>
        </div>

        {/* TODO: sau này mở modal / trang tạo yếu tố mới */}
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={() => alert('TODO: mở form tạo yếu tố môi trường mới')}
        >
          + Thêm yếu tố môi trường
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
              placeholder="Tìm yếu tố (gần ĐH, gần chợ...)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {/* Lỗi / loading */}
        {error && <p className="admin-error">{error}</p>}
        {loading && <p className="admin-loading">Đang tải yếu tố môi trường…</p>}

        {/* Bảng dữ liệu */}
        <div className="admin-card-table">
          <table className="admin-table admin-table--compact">
            <thead>
              <tr>
                <th>ID</th>
                <th>Slug</th>
                <th>Tên</th>
                <th>Số bài liên quan</th>
                <th style={{ width: 170 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {/* Không có data */}
              {items.length === 0 && !loading && !error && (
                <tr>
                  <td colSpan={5} className="admin-empty">
                    Chưa có yếu tố môi trường nào hoặc không tìm thấy kết quả.
                  </td>
                </tr>
              )}

              {/* Data từ API */}
              {items.map((feature) => (
                <tr key={feature.id}>
                  <td>{feature.id}</td>
                  <td>{feature.slug}</td>
                  <td>{feature.name}</td>
                  <td>{feature.posts_count ?? 0}</td>
                  <td className="admin-td-actions">
                    {/* TODO: thay alert bằng form sửa */}
                    <button
                      type="button"
                      className="admin-chip admin-chip--ghost"
                      onClick={() =>
                        alert(`TODO: mở form sửa yếu tố môi trường #${feature.id}`)
                      }
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="admin-chip admin-chip--danger"
                      onClick={() => handleDelete(feature.id)}
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
