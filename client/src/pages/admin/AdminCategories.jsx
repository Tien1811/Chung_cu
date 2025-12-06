// src/pages/admin/AdminCategories.jsx
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

export default function AdminCategories() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // form tạo / sửa
  const [showForm, setShowForm] = useState(false)
  const [formId, setFormId] = useState(null) // null = thêm mới, khác null = sửa
  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const token = localStorage.getItem('access_token')

  // ===== LOAD DANH MỤC TỪ API =====
  useEffect(() => {
    const controller = new AbortController()

    async function fetchCategories() {
      try {
        setLoading(true)
        setError('')

        const res = await fetch(`${API_BASE_URL}/categories`, {
          signal: controller.signal,
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            Accept: 'application/json',
          },
        })

        const json = await safeJson(res)

        if (!res.ok) {
          throw new Error(
            json?.message || 'Không tải được danh sách danh mục',
          )
        }

        const list = json?.data || json || []
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
  }, [token])

  // ===== RESET FORM =====
  const resetForm = () => {
    setFormId(null)
    setFormName('')

    setFormError('')
    setFormSuccess('')
  }

  // ===== MỞ FORM Ở CHẾ ĐỘ THÊM MỚI =====
  const handleCreateClick = () => {
    resetForm()
    setShowForm(true)
  }

  // ===== MỞ FORM Ở CHẾ ĐỘ SỬA =====
  const handleEditClick = cat => {
    setFormId(cat.id)
    setFormName(cat.name || '')

    setFormError('')
    setFormSuccess('')
    setShowForm(true)
  }

  // ===== SUBMIT FORM THÊM / SỬA =====
  const handleSubmit = async e => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    if (!formName.trim()) {
      setFormError('Vui lòng nhập tên danh mục')
      return
    }

    try {
      setFormLoading(true)

      const payload = {
        name: formName.trim(),
       
      }

      const isEdit = !!formId
      const url = isEdit
        ? `${API_BASE_URL}/categories/${formId}`
        : `${API_BASE_URL}/categories`
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const json = await safeJson(res)

      if (!res.ok || json?.status === false) {
        throw new Error(json?.message || 'Không lưu được danh mục')
      }

      const saved = json.data || {}

      if (isEdit) {
        // cập nhật trong list, giữ nguyên posts_count
        setItems(prev =>
          prev.map(c => (c.id === saved.id ? { ...c, ...saved } : c)),
        )
        setFormSuccess('Cập nhật danh mục thành công')
      } else {
        // thêm mới, posts_count = 0
        setItems(prev => [{ ...saved, posts_count: 0 }, ...prev])
        setFormSuccess('Thêm danh mục thành công')
      }

      // ẩn form sau khi lưu
      setShowForm(false)
      resetForm()
    } catch (err) {
      console.error(err)
      setFormError(err.message || 'Có lỗi khi lưu danh mục')
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <section className="admin-page">
      {/* HEADER TRANG */}
      <header className="admin-page__head">
        <div>
          <h1 className="admin-page__title">Danh mục bài đăng</h1>
          <p className="admin-page__desc">
            Quản lý bảng <code>categories</code>: tên danh mục, slug, số lượng
            bài (posts_count).
          </p>
        </div>

       
      </header>

      <div className="admin-section--card">
        {/* FORM THÊM / SỬA – chỉ hiện khi showForm = true */}
        {showForm && (
          <form className="admin-form-inline" onSubmit={handleSubmit}>
            <div className="admin-form-inline__fields">
              <div className="admin-field">
                <label>
                  <span>Tên danh mục *</span>
                  <input
                    className="admin-input"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="Phòng trọ, căn hộ, ký túc xá..."
                  />
                </label>
              </div>


            </div>

            <div className="admin-form-inline__actions">
              <button
                type="submit"
                className="admin-btn admin-btn--primary"
                disabled={formLoading}
              >
                {formId
                  ? formLoading
                    ? 'Đang cập nhật...'
                    : 'Lưu thay đổi'
                  : formLoading
                    ? 'Đang thêm...'
                    : 'Thêm danh mục'}
              </button>

              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
                disabled={formLoading}
              >
                Đóng
              </button>
            </div>

            {formError && (
              <p className="admin-error" style={{ marginTop: 8 }}>
                {formError}
              </p>
            )}
            {formSuccess && (
              <p className="admin-success" style={{ marginTop: 8 }}>
                {formSuccess}
              </p>
            )}
          </form>
        )}

        {/* LỖI & LOADING */}
        {error && <p className="admin-error">{error}</p>}
        {loading && <p className="admin-loading">Đang tải danh mục…</p>}

        {/* BẢNG DỮ LIỆU */}
        <div className="admin-card-table">
          <table className="admin-table admin-table--compact">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Số bài đăng</th>
                <th style={{ width: 140 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && !loading && !error && (
                <tr>
                  <td colSpan={5} className="admin-empty">
                    Chưa có danh mục nào.
                  </td>
                </tr>
              )}

              {items.map(cat => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td>{cat.name}</td>
                  <td>{cat.posts_count ?? 0}</td>
                  <td className="admin-td-actions">
                    <button
                      type="button"
                      className="admin-chip admin-chip--ghost"
                      onClick={() => handleEditClick(cat)}
                    >
                      Sửa
                    </button>
                    {/* KHÔNG CÒN NÚT XOÁ */}
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
