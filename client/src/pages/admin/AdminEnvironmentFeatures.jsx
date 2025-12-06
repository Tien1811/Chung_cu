// src/pages/admin/AdminAmenities.jsx
import { useEffect, useState, Fragment } from 'react'
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

export default function AdminAmenities() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // form sửa
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  // form thêm mới
  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createSlug, setCreateSlug] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  const token = localStorage.getItem('access_token')

  // ===== LOAD TIỆN ÍCH =====
  useEffect(() => {
    const controller = new AbortController()

    async function fetchAmenities() {
      try {
        setLoading(true)
        setError('')

        const res = await fetch(`${API_BASE_URL}/amenities`, {
          signal: controller.signal,
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            Accept: 'application/json',
          },
        })

        const json = await safeJson(res)

        if (!res.ok) {
          throw new Error(json?.message || 'Không tải được danh sách tiện ích')
        }

        const list = json?.data || json || []
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
  }, [token])

  // ===== MỞ FORM SỬA NGAY TRÊN DÒNG =====
  const handleStartEdit = item => {
    setEditingId(item.id)
    setEditName(item.name || '')
    setEditSlug(item.slug || '')
    setFormError('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditSlug('')
    setFormError('')
  }

  // ===== SUBMIT SỬA =====
  const handleSubmitEdit = async e => {
    e.preventDefault()
    if (!editingId) return

    if (!editName.trim()) {
      setFormError('Vui lòng nhập tên tiện ích')
      return
    }

    try {
      setSaving(true)
      setFormError('')

      // PUT /api/amenities/{id}
      const res = await fetch(`${API_BASE_URL}/amenities/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: editName.trim(),
          slug: editSlug.trim() || null,
        }),
      })

      const json = await safeJson(res)

      if (!res.ok || json?.status === false) {
        throw new Error(json?.message || 'Không cập nhật được tiện ích')
      }

      // cập nhật lại list FE
      setItems(prev =>
        prev.map(a =>
          a.id === editingId
            ? { ...a, name: editName.trim(), slug: editSlug.trim() || a.slug }
            : a,
        ),
      )

      // tắt form sau khi lưu xong
      handleCancelEdit()
    } catch (err) {
      console.error(err)
      setFormError(err.message || 'Có lỗi khi cập nhật tiện ích')
    } finally {
      setSaving(false)
    }
  }

  // ===== THÊM TIỆN ÍCH MỚI =====
  const handleCreateAmenity = async e => {
    e.preventDefault()

    if (!createName.trim()) {
      setCreateError('Vui lòng nhập tên tiện ích')
      return
    }

    try {
      setCreating(true)
      setCreateError('')
      setCreateSuccess('')

      // POST /api/amenities
      const res = await fetch(`${API_BASE_URL}/amenities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: createName.trim(),
          slug: createSlug.trim() || null,
        }),
      })

      const json = await safeJson(res)

      if (!res.ok || json?.status === false) {
        throw new Error(json?.message || 'Không thêm được tiện ích')
      }

      const newAmenity = json?.data || json

      // thêm tiện ích mới lên đầu danh sách
      setItems(prev => [newAmenity, ...prev])

      setCreateSuccess('Thêm tiện ích thành công.')
      setCreateName('')
      setCreateSlug('')
      // Nếu muốn sau khi thêm ẩn form:
      // setShowCreate(false)
    } catch (err) {
      console.error(err)
      setCreateError(err.message || 'Có lỗi khi thêm tiện ích')
    } finally {
      setCreating(false)
    }
  }

  // ===== XOÁ TIỆN ÍCH =====
  const handleDelete = async id => {
    if (!window.confirm(`Bạn chắc chắn muốn xoá tiện ích #${id}?`)) return

    try {
      // DELETE /api/amenities/{id}
      const res = await fetch(`${API_BASE_URL}/amenities/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })

      const json = await safeJson(res)

      if (!res.ok || json?.status === false) {
        throw new Error(json?.message || 'Không xoá được tiện ích')
      }

      setItems(prev => prev.filter(a => a.id !== id))
      if (editingId === id) handleCancelEdit()
    } catch (err) {
      console.error(err)
      alert(err.message || 'Có lỗi khi xoá tiện ích')
    }
  }

  return (
    <section className="admin-page">
      {/* HEADER */}
      <header className="admin-page__head">
        <div>
          <h1 className="admin-page__title">Tiện ích phòng</h1>
          <p className="admin-page__desc">
            Quản lý bảng <code>amenities</code> và số bài đang dùng qua{' '}
            <code>amenity_post</code>.
          </p>
        </div>

        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={() => {
            setShowCreate(prev => !prev)
            setCreateError('')
            setCreateSuccess('')
          }}
        >
          {showCreate ? 'Ẩn form thêm' : '+ Thêm tiện ích'}
        </button>
      </header>

      <div className="admin-section--card">
        {/* FORM THÊM MỚI */}
        {showCreate && (
          <div className="admin-create-box" style={{ marginBottom: 16 }}>
            <h3 className="admin-create-box__title">Thêm tiện ích mới</h3>
            {createError && (
              <p className="admin-error" style={{ marginBottom: 8 }}>
                {createError}
              </p>
            )}
            {createSuccess && (
              <p className="admin-success" style={{ marginBottom: 8 }}>
                {createSuccess}
              </p>
            )}

            <form
              onSubmit={handleCreateAmenity}
              className="admin-edit-form-inline"
            >
              <div className="admin-edit-form__grid">
                <label className="admin-field">
                  <span>Tên tiện ích *</span>
                  <input
                    className="admin-input"
                    value={createName}
                    onChange={e => setCreateName(e.target.value)}
                    placeholder="Máy lạnh, WC riêng, chỗ để xe..."
                  />
                </label>

                <label className="admin-field">
                  <span>Slug (có thể để trống)</span>
                  <input
                    className="admin-input"
                    value={createSlug}
                    onChange={e => setCreateSlug(e.target.value)}
                    placeholder="may-lanh, wc-rieng..."
                  />
                </label>
              </div>

              <div className="admin-edit-form__actions">
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={() => {
                    setShowCreate(false)
                    setCreateError('')
                    setCreateSuccess('')
                  }}
                  disabled={creating}
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={creating}
                >
                  {creating ? 'Đang lưu...' : 'Thêm tiện ích'}
                </button>
              </div>
            </form>
          </div>
        )}

        {error && <p className="admin-error">{error}</p>}
        {loading && <p className="admin-loading">Đang tải tiện ích…</p>}

        <div className="admin-card-table">
          <table className="admin-table admin-table--compact">
            <thead>
              <tr>
                <th>ID</th>
                <th>Slug</th>
                <th>Tên</th>
                <th>Số bài sử dụng</th>
                <th style={{ width: 180 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && !loading && !error && (
                <tr>
                  <td colSpan={5} className="admin-empty">
                    Chưa có tiện ích nào.
                  </td>
                </tr>
              )}

              {items.map(item => (
                <Fragment key={item.id}>
                  {/* HÀNG FORM SỬA – NẰM NGAY TRÊN HÀNG DỮ LIỆU */}
                  {editingId === item.id && (
                    <tr className="admin-edit-row">
                      <td colSpan={5}>
                        {formError && (
                          <p
                            className="admin-error"
                            style={{ marginBottom: 8 }}
                          >
                            {formError}
                          </p>
                        )}

                        <form
                          onSubmit={handleSubmitEdit}
                          className="admin-edit-form-inline"
                        >
                          <div className="admin-edit-form__grid">
                            <label className="admin-field">
                              <span>Tên tiện ích *</span>
                              <input
                                className="admin-input"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                placeholder="Máy lạnh, WC riêng, chỗ để xe..."
                              />
                            </label>

                            <label className="admin-field">
                              <span>Slug (có thể để trống)</span>
                              <input
                                className="admin-input"
                                value={editSlug}
                                onChange={e => setEditSlug(e.target.value)}
                                placeholder="may-lanh, wc-rieng..."
                              />
                            </label>
                          </div>

                          <div className="admin-edit-form__actions">
                            <button
                              type="button"
                              className="admin-btn admin-btn--ghost"
                              onClick={handleCancelEdit}
                              disabled={saving}
                            >
                              Huỷ
                            </button>
                            <button
                              type="submit"
                              className="admin-btn admin-btn--primary"
                              disabled={saving}
                            >
                              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  )}

                  {/* HÀNG DỮ LIỆU CHÍNH */}
                  <tr>
                    <td>{item.id}</td>
                    <td>{item.slug}</td>
                    <td>{item.name}</td>
                    <td>{item.posts_count ?? 0}</td>
                    <td className="admin-td-actions">
                      <button
                        type="button"
                        className="admin-chip admin-chip--ghost"
                        onClick={() => handleStartEdit(item)}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="admin-chip admin-chip--danger"
                        onClick={() => handleDelete(item.id)}
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
