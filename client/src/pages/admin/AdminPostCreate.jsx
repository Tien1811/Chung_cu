// src/pages/admin/AdminPostCreate.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminPostCreate() {
  const navigate = useNavigate()

  // ===== OPTIONS TỪ BACKEND =====
  const [categories, setCategories] = useState([])
  const [amenities, setAmenities] = useState([])
  const [envFeatures, setEnvFeatures] = useState([])
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])

  // ===== FORM STATE CHÍNH =====
  const [form, setForm] = useState({
    title: '',
    category_id: '',
    price: '',
    area: '',
    address: '',
    province_id: '',
    district_id: '',
    ward_id: '',
    status: 'draft', // draft | published
    content: '',
  })

  const [selectedAmenities, setSelectedAmenities] = useState([])      // [id,...]
  const [selectedEnvFeatures, setSelectedEnvFeatures] = useState([]) // [id,...]

  const [images, setImages] = useState([])              // File[]
  const [imagePreviews, setImagePreviews] = useState([]) // URL[]

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ===== LOAD OPTIONS BAN ĐẦU =====
  useEffect(() => {
    async function loadInitial() {
      try {
        setLoading(true)
        setError('')

        const [catRes, ameRes, envRes, provRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/amenities'),
          fetch('/api/environment-features'),
          fetch('/api/provinces'),
        ])

        const [catJson, ameJson, envJson, provJson] = await Promise.all([
          catRes.json(),
          ameRes.json(),
          envRes.json(),
          provRes.json(),
        ])

        setCategories(catJson.data || catJson || [])
        setAmenities(ameJson.data || ameJson || [])
        setEnvFeatures(envJson.data || envJson || [])
        setProvinces(provJson.data || provJson || [])
      } catch (err) {
        console.error(err)
        setError('Không tải được dữ liệu danh mục/tiện ích/địa lý.')
      } finally {
        setLoading(false)
      }
    }

    loadInitial()
  }, [])

  // ===== KHI CHỌN PROVINCE -> LOAD DISTRICT =====
  useEffect(() => {
    const provinceId = form.province_id
    if (!provinceId) {
      setDistricts([])
      setWards([])
      setForm(f => ({ ...f, district_id: '', ward_id: '' }))
      return
    }

    async function loadDistricts() {
      try {
        const res = await fetch(`/api/districts?province_id=${provinceId}`)
        const json = await res.json()
        setDistricts(json.data || json || [])
        setWards([])
        setForm(f => ({ ...f, district_id: '', ward_id: '' }))
      } catch (err) {
        console.error(err)
      }
    }

    loadDistricts()
  }, [form.province_id])

  // ===== KHI CHỌN DISTRICT -> LOAD WARD =====
  useEffect(() => {
    const districtId = form.district_id
    if (!districtId) {
      setWards([])
      setForm(f => ({ ...f, ward_id: '' }))
      return
    }

    async function loadWards() {
      try {
        const res = await fetch(`/api/wards?district_id=${districtId}`)
        const json = await res.json()
        setWards(json.data || json || [])
        setForm(f => ({ ...f, ward_id: '' }))
      } catch (err) {
        console.error(err)
      }
    }

    loadWards()
  }, [form.district_id])

  // ===== HANDLERS =====
  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const toggleAmenity = id => {
    setSelectedAmenities(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleEnvFeature = id => {
    setSelectedEnvFeatures(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleImagesChange = e => {
    const files = Array.from(e.target.files || [])
    setImages(files)
    setImagePreviews(files.map(f => URL.createObjectURL(f)))
  }

  // ===== SUBMIT TẠO BÀI =====
  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.title.trim()) {
      setError('Vui lòng nhập tiêu đề bài đăng.')
      return
    }
    if (!form.category_id) {
      setError('Vui lòng chọn danh mục.')
      return
    }
    if (!form.price) {
      setError('Vui lòng nhập giá thuê.')
      return
    }
    if (!form.area) {
      setError('Vui lòng nhập diện tích.')
      return
    }
    if (!form.province_id || !form.district_id || !form.ward_id) {
      setError('Vui lòng chọn đầy đủ Tỉnh / Quận / Phường.')
      return
    }

    try {
      setSaving(true)

      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('Bạn chưa đăng nhập.')
      }

      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('category_id', form.category_id)
      fd.append('price', form.price)
      fd.append('area', form.area)
      fd.append('address', form.address)
      fd.append('province_id', form.province_id)
      fd.append('district_id', form.district_id)
      fd.append('ward_id', form.ward_id)
      fd.append('status', form.status) // draft | published
      fd.append('content', form.content)

      // mảng tiện ích -> amenities[0], amenities[1] ...
      selectedAmenities.forEach((id, index) => {
        fd.append(`amenities[${index}]`, id)
      })

      // mảng environment_features -> environment_features[0]...
      selectedEnvFeatures.forEach((id, index) => {
        fd.append(`environment_features[${index}]`, id)
      })

      // ảnh -> images[0], images[1]...
      images.forEach((file, index) => {
        fd.append(`images[${index}]`, file)
      })

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          // KHÔNG set Content-Type vì đang gửi FormData
        },
        body: fd,
      })

      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error('Máy chủ trả về dữ liệu không hợp lệ.')
      }

      if (!res.ok || data.status === false) {
        // Ưu tiên lỗi validate 422
        if (res.status === 422 && data.errors) {
          const firstError =
            Object.values(data.errors)[0]?.[0] || 'Lỗi xác thực dữ liệu.'
          throw new Error(firstError)
        }

        if (res.status === 401) {
          throw new Error('Bạn chưa đăng nhập hoặc phiên đã hết hạn.')
        }

        if (res.status === 403) {
          throw new Error('Bạn không có quyền đăng bài.')
        }

        throw new Error(data.message || 'Không tạo được bài đăng.')
      }

      setSuccess('Tạo bài đăng thành công!')
      setTimeout(() => {
        navigate('/admin/posts')
      }, 1200)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Có lỗi khi tạo bài đăng.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="admin-page">
      <header className="admin-page__head">
        <div>
          <h1 className="admin-page__title">Đăng bài cho thuê mới</h1>
          <p className="admin-page__desc">
            Tạo bản ghi mới cho bảng <code>posts</code> và liên kết tới{' '}
            <code>post_images</code>, <code>amenity_post</code>,{' '}
            <code>environment_post</code>, địa lý{' '}
            <code>provinces/districts/wards</code>.
          </p>
        </div>
      </header>

      <div className="admin-section--card">
        {loading && <p className="admin-loading">Đang tải dữ liệu chọn...</p>}
        {error && <p className="admin-error">{error}</p>}
        {success && <p className="admin-success">{success}</p>}

        <form className="admin-form" onSubmit={handleSubmit}>
          {/* HÀNG 1: tiêu đề + danh mục */}
          <div className="admin-form__row">
            <div className="admin-form__col">
              <label className="admin-label">
                Tiêu đề bài đăng
                <input
                  className="admin-input"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="VD: Phòng trọ full nội thất gần ĐH Bách Khoa"
                />
              </label>
            </div>
            <div className="admin-form__col admin-form__col--sm">
              <label className="admin-label">
                Danh mục
                <select
                  className="admin-input"
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* HÀNG 2: giá + diện tích + trạng thái */}
          <div className="admin-form__row">
            <div className="admin-form__col">
              <label className="admin-label">
                Giá thuê (VNĐ/tháng)
                <input
                  type="number"
                  className="admin-input"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  min="0"
                />
              </label>
            </div>
            <div className="admin-form__col">
              <label className="admin-label">
                Diện tích (m²)
                <input
                  type="number"
                  className="admin-input"
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  min="0"
                />
              </label>
            </div>
            <div className="admin-form__col admin-form__col--sm">
              <label className="admin-label">
                Trạng thái
                <select
                  className="admin-input"
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

          {/* HÀNG 3: địa chỉ + địa lý */}
          <div className="admin-form__row">
            <div className="admin-form__col">
              <label className="admin-label">
                Địa chỉ cụ thể
                <input
                  className="admin-input"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Số nhà, tên đường..."
                />
              </label>
            </div>
          </div>

          <div className="admin-form__row">
            <div className="admin-form__col">
              <label className="admin-label">
                Tỉnh / Thành
                <select
                  className="admin-input"
                  name="province_id"
                  value={form.province_id}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn tỉnh/thành --</option>
                  {provinces.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="admin-form__col">
              <label className="admin-label">
                Quận / Huyện
                <select
                  className="admin-input"
                  name="district_id"
                  value={form.district_id}
                  onChange={handleChange}
                  disabled={!districts.length}
                >
                  <option value="">-- Chọn quận/huyện --</option>
                  {districts.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="admin-form__col">
              <label className="admin-label">
                Phường / Xã
                <select
                  className="admin-input"
                  name="ward_id"
                  value={form.ward_id}
                  onChange={handleChange}
                  disabled={!wards.length}
                >
                  <option value="">-- Chọn phường/xã --</option>
                  {wards.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* MÔ TẢ */}
          <div className="admin-form__row">
            <div className="admin-form__col">
              <label className="admin-label">
                Mô tả chi tiết
                <textarea
                  className="admin-input admin-input--textarea"
                  name="content"
                  rows={6}
                  value={form.content}
                  onChange={handleChange}
                  placeholder="Mô tả nội thất, quy định, tiện nghi, đối tượng cho thuê..."
                />
              </label>
            </div>
          </div>

          {/* TIỆN ÍCH */}
          <div className="admin-form__row">
            <div className="admin-form__col">
              <h3 className="admin-subtitle">Tiện ích trong phòng</h3>
              <div className="admin-chip-list">
                {amenities.map(a => (
                  <label key={a.id} className="admin-chip-input">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(a.id)}
                      onChange={() => toggleAmenity(a.id)}
                    />
                    <span>{a.name}</span>
                  </label>
                ))}
                {amenities.length === 0 && (
                  <p className="admin-note">
                    Chưa có tiện ích nào, hãy thêm ở mục Tiện ích.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* MÔI TRƯỜNG XUNG QUANH */}
          <div className="admin-form__row">
            <div className="admin-form__col">
              <h3 className="admin-subtitle">Môi trường xung quanh</h3>
              <div className="admin-chip-list">
                {envFeatures.map(e => (
                  <label key={e.id} className="admin-chip-input">
                    <input
                      type="checkbox"
                      checked={selectedEnvFeatures.includes(e.id)}
                      onChange={() => toggleEnvFeature(e.id)}
                    />
                    <span>{e.name}</span>
                  </label>
                ))}
                {envFeatures.length === 0 && (
                  <p className="admin-note">
                    Chưa có yếu tố môi trường nào, hãy thêm ở mục Môi trường
                    xung quanh.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ẢNH BÀI ĐĂNG */}
          <div className="admin-form__row">
            <div className="admin-form__col">
              <h3 className="admin-subtitle">Ảnh bài đăng</h3>
              <label className="admin-upload">
                <span>Chọn nhiều ảnh (tối đa tuỳ bạn cấu hình)</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                />
              </label>

              {imagePreviews.length > 0 && (
                <div className="admin-upload-preview">
                  {imagePreviews.map((src, idx) => (
                    <div
                      key={idx}
                      className="admin-upload-preview__item"
                    >
                      <img src={src} alt={`preview-${idx}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* NÚT LƯU */}
          <div className="admin-form__actions">
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={() => navigate('/admin/posts')}
              disabled={saving}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Đăng bài'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
