// src/pages/admin/AdminAmenities.jsx
import { useEffect, useState } from 'react'

export default function AdminAmenities() {
  // ===== STATE =====
  const [items, setItems] = useState([])        // danh sách amenities từ API
  const [q, setQ] = useState('')               // từ khoá tìm kiếm (slug/name)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ===== LOAD TIỆN ÍCH TỪ API =====
  useEffect(() => {
    const controller = new AbortController()

    async function fetchAmenities() {
      try {
        setLoading(true)
        setError('')

        const params = new URLSearchParams()
        if (q.trim()) params.append('q', q.trim())

        /**
         * API #1 – Lấy danh sách tiện ích (amenities)
         * Gợi ý backend Laravel:
         *   GET /api/admin/amenities?q={keyword}
         *
         * Trong controller:
         *   Amenity::query()
         *      ->when($q, fn($qr) => $qr->where('name','like',"%$q%")
         *                                ->orWhere('slug','like',"%$q%"))
         *      ->withCount('posts')      // quan hệ qua bảng amenity_post
         *
         * Response gợi ý:
         *   {
         *     "data": [
         *       { "id": 1, "slug": "may-lanh", "name": "Máy lạnh", "posts_count": 230 },
         *       ...
         *     ]
         *   }
         * hoặc trả trực tiếp mảng [] cũng được.
         */
        const res = await fetch(
          `/api/admin/amenities?${params.toString()}`,
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
          throw new Error(json?.message || 'Không tải được danh sách tiện ích')
        }

        const list = json.data || json
        setItems(Array.isArray(list) ? list : [])
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error(err)
        setError(err.message || 'Có lỗi khi tải tiện ích')
      } finally {
        setLoading(false)
      }
    }

    fetchAmenities()
    return () => controller.abort()
  }, [q])

  // ===== XOÁ 1 TIỆN ÍCH =====
  const handleDelete = async (id) => {
    if (!window.confirm(`Bạn chắc chắn muốn xoá tiện ích #${id}?`)) return

    try {
      /**
       * API #2 – Xoá tiện ích
       *
       * Gợi ý Laravel:
       *   DELETE /api/admin/amenities/{amenity}
       *
       * - Trước khi xoá nên detach bản ghi trong bảng trung gian amenity_post
       *   $amenity->posts()->detach();
       * - Sau đó $amenity->delete();
       */
      const res = await fetch(`/api/admin/amenities/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })

      const text = await res.text()
      let json = {}
      try {
        json = text ? JSON.parse(text) : {}
      } catch {
        // nếu backend trả 204 No Content thì bỏ qua parse
      }

      if (!res.ok) {
        throw new Error(json?.message || 'Không xoá được tiện ích')
      }

      // Cập nhật lại state FE (xoá khỏi danh sách hiện tại)
      setItems((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      console.error(err)
      alert(err.message || 'Có lỗi khi xoá tiện ích')
    }
  }

  return (
    <section className="admin-page">
      {/* PHẦN HEADER TRANG */}
      <header className="admin-page__head">
        <div>
          <h1 className="admin-page__title">Tiện ích phòng</h1>
          <p className="admin-page__desc">
            Quản lý bảng <code>amenities</code> và số bài đang dùng qua{' '}
            <code>amenity_post</code>.
          </p>
        </div>

        {/* TODO: sau này mở modal / chuyển sang trang tạo tiện ích mới */}
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={() => alert('TODO: mở form tạo tiện ích mới')}
        >
          + Thêm tiện ích
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
              placeholder="Tìm tiện ích (máy lạnh, WC riêng...)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {/* Thông báo lỗi / loading */}
        {error && <p className="admin-error">{error}</p>}
        {loading && <p className="admin-loading">Đang tải tiện ích…</p>}

        {/* Bảng dữ liệu */}
        <div className="admin-card-table">
          <table className="admin-table admin-table--compact">
            <thead>
              <tr>
                <th>ID</th>
                <th>Slug</th>
                <th>Tên</th>
                <th>Số bài sử dụng</th>
                <th style={{ width: 170 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {/* Không có dữ liệu */}
              {items.length === 0 && !loading && !error && (
                <tr>
                  <td colSpan={5} className="admin-empty">
                    Chưa có tiện ích nào hoặc không tìm thấy kết quả.
                  </td>
                </tr>
              )}

              {/* Data thật từ API */}
              {items.map((amenity) => (
                <tr key={amenity.id}>
                  <td>{amenity.id}</td>
                  <td>{amenity.slug}</td>
                  <td>{amenity.name}</td>
                  <td>{amenity.posts_count ?? 0}</td>
                  <td className="admin-td-actions">
                    {/* TODO: thay alert bằng form sửa tiện ích */}
                    <button
                      type="button"
                      className="admin-chip admin-chip--ghost"
                      onClick={() =>
                        alert(`TODO: mở form sửa tiện ích #${amenity.id}`)
                      }
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="admin-chip admin-chip--danger"
                      onClick={() => handleDelete(amenity.id)}
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
