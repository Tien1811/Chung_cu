// src/pages/lessor/LessorPostEdit.jsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { API_URL } from '@/config/api.js';

export default function LessorPostEdit() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    category_id: '',
    price: '',
    area: '',
    address: '',
    content: '',
    status: 'draft',
  })

  const [categories, setCategories] = useState([])

  // ===== GIỮ NGUYÊN ẢNH ĐẠI DIỆN CŨ =====
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  // ===== GALLERY (THÊM – KHÔNG ĐỤNG CODE CŨ) =====
  const [existingImages, setExistingImages] = useState([])
  const [removedImageIds, setRemovedImageIds] = useState([])
  const [newImages, setNewImages] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ================= LOAD DATA =================
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError('')

        const token = localStorage.getItem('access_token')

        const [postRes, catRes] = await Promise.all([
          fetch(`${API_URL}/posts/${id}`, {
            headers: {
              Accept: 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }),
          fetch(`${API_URL}/categories`, {
            headers: { Accept: 'application/json' },
          }),
        ])

        const postJson = await postRes.json()
        if (!postRes.ok || postJson.status === false) {
          throw new Error(postJson.message || 'Không tải được bài viết.')
        }

        const p = postJson.data

        setForm({
          title: p.title || '',
          category_id: p.category_id || '',
          price: p.price ?? '',
          area: p.area ?? '',
          address: p.address || '',
          content: p.content || '',
          status: p.status || 'draft',
        })

        // ===== GIỮ LOGIC ẢNH ĐẠI DIỆN CŨ =====
        if (p.main_image_url) {
          setImagePreview(p.main_image_url)
        }

        // ===== THÊM: LOAD GALLERY =====
        if (Array.isArray(p.images)) {
          setExistingImages(p.images)
        }

        const catJson = await catRes.json()
        if (!catRes.ok || catJson.status === false) {
          throw new Error(catJson.message || 'Không tải được danh mục.')
        }
        setCategories(catJson.data || [])
      } catch (err) {
        console.error(err)
        setError(err.message || 'Có lỗi khi tải dữ liệu.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  // ================= HANDLERS =================
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // ===== GIỮ NGUYÊN ẢNH ĐẠI DIỆN =====
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  // ===== GALLERY HANDLERS (THÊM) =====
  const handleRemoveExistingImage = (img) => {
    setExistingImages((prev) => prev.filter((i) => i.id !== img.id))
    setRemovedImageIds((prev) => [...prev, img.id])
  }

  const handleAddNewImages = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setNewImages((prev) => [...prev, ...files])
  }

  const handleRemoveNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
  }

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.title.trim()) return setError('Vui lòng nhập tiêu đề.')
    if (!form.category_id) return setError('Vui lòng chọn danh mục.')

    try {
      setSaving(true)
      const token = localStorage.getItem('access_token')
      if (!token) throw new Error('Bạn chưa đăng nhập.')

      const formData = new FormData()
      formData.append('_method', 'PUT')

      Object.entries(form).forEach(([k, v]) =>
        formData.append(k, v !== '' ? v : '')
      )

      // ===== GIỮ ẢNH ĐẠI DIỆN CŨ =====
      if (imageFile) {
        formData.append('image', imageFile)
      }

      // ===== THÊM: ẢNH MỚI =====
      newImages.forEach((file) => {
        formData.append('images[]', file)
      })

      // ===== THÊM: ẢNH BỊ XÓA =====
      removedImageIds.forEach((id) => {
        formData.append('remove_image_ids[]', id)
      })

      const res = await fetch(`${API_URL}/posts/${id}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await res.json()
      if (!res.ok || data.status === false) {
        throw new Error(data.message || 'Không cập nhật được bài viết.')
      }

      setSuccess('Cập nhật bài viết thành công.')
      setTimeout(() => navigate('/lessor/posts'), 1000)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Có lỗi khi cập nhật.')
    } finally {
      setSaving(false)
    }
  }

  // ================= RENDER =================
  return (
    <section className="lessor-page">
      <header className="lessor-page__head">
        <div>
          <h1 className="lessor-page__title">Sửa bài đăng #{id}</h1>
          <p className="lessor-page__desc">
            Chỉnh sửa nội dung và ảnh bài đăng.
          </p>
        </div>
      </header>

      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p className="lessor-error">{error}</p>}
      {success && <p className="lessor-success">{success}</p>}

      {!loading && (
        <div className="lessor-section--card">
          <form className="lessor-form" onSubmit={handleSubmit}>
            {/* TITLE + CATEGORY */}
            <div className="lessor-form__row">
              <div className="lessor-form__col">
                <label className="lessor-label">
                  Tiêu đề
                  <input
                    className="lessor-input"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="lessor-form__col lessor-form__col--sm">
                <label className="lessor-label">
                  Danh mục
                  <select
                    className="lessor-input"
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {/* PRICE + AREA + STATUS */}
            <div className="lessor-form__row">
              <div className="lessor-form__col">
                <label className="lessor-label">
                  Giá thuê
                  <input
                    type="number"
                    className="lessor-input"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="lessor-form__col">
                <label className="lessor-label">
                  Diện tích
                  <input
                    type="number"
                    className="lessor-input"
                    name="area"
                    value={form.area}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="lessor-form__col lessor-form__col--sm">
                <label className="lessor-label">
                  Trạng thái
                  <select
                    className="lessor-input"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="draft">Nháp</option>
                    <option value="published">Đang cho thuê</option>
                  </select>
                </label>
              </div>
            </div>

            {/* ADDRESS */}
            <div className="lessor-form__row">
              <div className="lessor-form__col">
                <label className="lessor-label">
                  Địa chỉ
                  <input
                    className="lessor-input"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                  />
                </label>
              </div>
            </div>

            {/* CONTENT (MÔ TẢ) */}
            <div className="lessor-form__row">
              <div className="lessor-form__col">
                <label className="lessor-label">
                  Nội dung mô tả
                  <textarea
                    className="lessor-input"
                    style={{ minHeight: "140px" }}
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    placeholder="Mô tả chi tiết căn hộ, tiện ích, khu vực..."
                  />
                </label>
              </div>
            </div>

            {/* ẢNH ĐẠI DIỆN (GIỮ NGUYÊN) */}
            <div className="lessor-form__row">
              <div className="lessor-form__col">
                <label className="lessor-label">
                  Ảnh đại diện
                  <input
                    type="file"
                    accept="image/*"
                    className="lessor-input"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            {/* ===== GALLERY ẢNH ĐÃ ĐĂNG ===== */}
            {existingImages.length > 0 && (
              <div className="lessor-form__row">
                <div className="lessor-form__col">
                  <label className="lessor-label">Ảnh đã đăng</label>
                  <div className="lessor-image-grid">
                    {existingImages.map((img) => (
                      <div key={img.id} className="lessor-image-item">
                        <img src={img.full_url} alt="" />
                        <button
                          type="button"
                          className="lessor-image-remove"
                          onClick={() => handleRemoveExistingImage(img)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ===== THÊM ẢNH KHÁC ===== */}
            <div className="lessor-form__row">
              <div className="lessor-form__col">
                <label className="lessor-label">Thêm ảnh khác</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="lessor-input"
                  onChange={handleAddNewImages}
                />

                <div className="lessor-image-grid">
                  {newImages.map((file, i) => (
                    <div key={i} className="lessor-image-item">
                      <img src={URL.createObjectURL(file)} alt="" />
                      <button
                        type="button"
                        className="lessor-image-remove"
                        onClick={() => handleRemoveNewImage(i)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="lessor-form__actions">
              <button
                type="button"
                className="lessor-btn lessor-btn--ghost"
                onClick={() => navigate('/lessor/posts')}
                disabled={saving}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="lessor-btn lessor-btn--primary"
                disabled={saving}
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}
