// src/pages/admin/AdminLocations.jsx
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

export default function AdminLocations() {
  const token = localStorage.getItem('access_token')

  // ====== STATE PROVINCE ======
  const [provinceQ, setProvinceQ] = useState('')
  const [provinces, setProvinces] = useState([])
  const [selectedProvinceId, setSelectedProvinceId] = useState(null)
  const [provLoading, setProvLoading] = useState(false)
  const [provError, setProvError] = useState('')

  // TẠO TỈNH
  const [newProvName, setNewProvName] = useState('')
  const [newProvCode, setNewProvCode] = useState('')
  const [provCreateLoading, setProvCreateLoading] = useState(false)
  const [provCreateError, setProvCreateError] = useState('')

  // SỬA TỈNH
  const [editingProvinceId, setEditingProvinceId] = useState(null)
  const [editProvName, setEditProvName] = useState('')
  const [editProvCode, setEditProvCode] = useState('')
  const [provEditLoading, setProvEditLoading] = useState(false)
  const [provEditError, setProvEditError] = useState('')

  // ====== STATE DISTRICT ======
  const [districtQ, setDistrictQ] = useState('')
  const [districts, setDistricts] = useState([])
  const [selectedDistrictId, setSelectedDistrictId] = useState(null)
  const [distLoading, setDistLoading] = useState(false)
  const [distError, setDistError] = useState('')

  // TẠO QUẬN / HUYỆN
  const [newDistName, setNewDistName] = useState('')
  const [newDistCode, setNewDistCode] = useState('')
  const [distCreateLoading, setDistCreateLoading] = useState(false)
  const [distCreateError, setDistCreateError] = useState('')

  // SỬA QUẬN / HUYỆN
  const [editingDistrictId, setEditingDistrictId] = useState(null)
  const [editDistName, setEditDistName] = useState('')
  const [editDistCode, setEditDistCode] = useState('')
  const [distEditLoading, setDistEditLoading] = useState(false)
  const [distEditError, setDistEditError] = useState('')

  // ====== STATE WARD ======
  const [wardQ, setWardQ] = useState('')
  const [wards, setWards] = useState([])
  const [wardLoading, setWardLoading] = useState(false)
  const [wardError, setWardError] = useState('')

  // TẠO PHƯỜNG / XÃ
  const [newWardName, setNewWardName] = useState('')
  const [newWardCode, setNewWardCode] = useState('')
  const [wardCreateLoading, setWardCreateLoading] = useState(false)
  const [wardCreateError, setWardCreateError] = useState('')

  // ============================
  // 1. PROVINCES
  // ============================
  useEffect(() => {
    const controller = new AbortController()

    async function fetchProvinces() {
      try {
        setProvLoading(true)
        setProvError('')

        const params = new URLSearchParams()
        if (provinceQ.trim()) params.append('q', provinceQ.trim())

        const res = await fetch(
          `${API_BASE_URL}/provinces?${params.toString()}`,
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
            json?.message || 'Không tải được danh sách tỉnh / thành',
          )
        }

        const list = json?.data || json || []
        const arr = Array.isArray(list) ? list : []
        setProvinces(arr)
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error(err)
        setProvError(err.message || 'Có lỗi khi tải tỉnh / thành')
      } finally {
        setProvLoading(false)
      }
    }

    fetchProvinces()
    return () => controller.abort()
  }, [provinceQ, token])

  const handleCreateProvince = async e => {
    e.preventDefault()
    if (!newProvName.trim() || !newProvCode.trim()) {
      setProvCreateError('Vui lòng nhập đủ mã và tên tỉnh / thành')
      return
    }

    try {
      setProvCreateLoading(true)
      setProvCreateError('')

      const res = await fetch(`${API_BASE_URL}/provinces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: newProvName.trim(),
          code: newProvCode.trim(),
        }),
      })

      const json = await safeJson(res)
      if (!res.ok || json?.status === false) {
        throw new Error(json?.message || 'Không thêm được tỉnh / thành')
      }

      const created = json?.data || json
      setProvinces(prev => [...prev, created])
      setNewProvName('')
      setNewProvCode('')
    } catch (err) {
      console.error(err)
      setProvCreateError(err.message || 'Có lỗi khi thêm tỉnh / thành')
    } finally {
      setProvCreateLoading(false)
    }
  }

  const startEditProvince = p => {
    setEditingProvinceId(p.id)
    setEditProvName(p.name || '')
    setEditProvCode(p.code || '')
    setProvEditError('')
  }
  const cancelEditProvince = () => {
    setEditingProvinceId(null)
    setEditProvName('')
    setEditProvCode('')
    setProvEditError('')
  }
  const handleSubmitProvinceEdit = async e => {
    e.preventDefault()
    if (!editingProvinceId) return
    if (!editProvName.trim() || !editProvCode.trim()) {
      setProvEditError('Vui lòng nhập đủ mã và tên tỉnh / thành')
      return
    }

    try {
      setProvEditLoading(true)
      setProvEditError('')

      const res = await fetch(
        `${API_BASE_URL}/provinces/${editingProvinceId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          body: JSON.stringify({
            name: editProvName.trim(),
            code: editProvCode.trim(),
          }),
        },
      )

      const json = await safeJson(res)
      if (!res.ok || json?.status === false) {
        throw new Error(json?.message || 'Không cập nhật được tỉnh / thành')
      }

      setProvinces(prev =>
        prev.map(p =>
          p.id === editingProvinceId
            ? { ...p, name: editProvName.trim(), code: editProvCode.trim() }
            : p,
        ),
      )
      cancelEditProvince()
    } catch (err) {
      console.error(err)
      setProvEditError(err.message || 'Có lỗi khi cập nhật tỉnh / thành')
    } finally {
      setProvEditLoading(false)
    }
  }

  // XOÁ TỈNH
  const handleDeleteProvince = async id => {
    if (!window.confirm(`Xoá tỉnh/thành #${id}?`)) return

    try {
      const res = await fetch(`${API_BASE_URL}/provinces/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })

      const json = await safeJson(res)
      if (!res.ok || json?.status === false) {
        throw new Error(json?.message || 'Không xoá được tỉnh / thành')
      }

      setProvinces(prev => prev.filter(p => p.id !== id))

      // nếu đang chọn tỉnh này thì reset quận/huyện + phường/xã
      if (selectedProvinceId === id) {
        setSelectedProvinceId(null)
        setDistricts([])
        setSelectedDistrictId(null)
        setWards([])
      }
    } catch (err) {
      console.error(err)
      alert(err.message || 'Có lỗi khi xoá tỉnh / thành')
    }
  }

  // ============================
  // 2. DISTRICTS
  // ============================
  useEffect(() => {
    if (!selectedProvinceId) {
      setDistricts([])
      setSelectedDistrictId(null)
      return
    }

    const controller = new AbortController()

    async function fetchDistricts() {
      try {
        setDistLoading(true)
        setDistError('')

        const params = new URLSearchParams()
        params.append('province_id', String(selectedProvinceId))
        if (districtQ.trim()) params.append('q', districtQ.trim())

        const res = await fetch(
          `${API_BASE_URL}/districts?${params.toString()}`,
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
            json?.message || 'Không tải được danh sách quận / huyện',
          )
        }

        const list = json?.data || json || []
        setDistricts(Array.isArray(list) ? list : [])
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error(err)
        setDistError(err.message || 'Có lỗi khi tải quận / huyện')
      } finally {
        setDistLoading(false)
      }
    }

    fetchDistricts()
    return () => controller.abort()
  }, [selectedProvinceId, districtQ, token])

  const handleCreateDistrict = async e => {
    e.preventDefault()
    if (!selectedProvinceId) {
      setDistCreateError('Hãy chọn một tỉnh trước')
      return
    }
    if (!newDistName.trim() || !newDistCode.trim()) {
      setDistCreateError('Vui lòng nhập đủ mã và tên quận / huyện')
      return
    }

    try {
      setDistCreateLoading(true)
      setDistCreateError('')

      const res = await fetch(`${API_BASE_URL}/districts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: newDistName.trim(),
          code: newDistCode.trim(),
          province_id: selectedProvinceId,
        }),
      })

      const json = await safeJson(res)
      if (!res.ok || json?.status === false) {
        throw new Error(json?.message || 'Không thêm được quận / huyện')
      }

      const created = json?.data || json
      setDistricts(prev => [...prev, created])
      setNewDistName('')
      setNewDistCode('')
    } catch (err) {
      console.error(err)
      setDistCreateError(err.message || 'Có lỗi khi thêm quận / huyện')
    } finally {
      setDistCreateLoading(false)
    }
  }

  const startEditDistrict = d => {
    setEditingDistrictId(d.id)
    setEditDistName(d.name || '')
    setEditDistCode(d.code || '')
    setDistEditError('')
  }
  const cancelEditDistrict = () => {
    setEditingDistrictId(null)
    setEditDistName('')
    setEditDistCode('')
    setDistEditError('')
  }
  const handleSubmitDistrictEdit = async e => {
    e.preventDefault()
    if (!editingDistrictId) return
    if (!editDistName.trim() || !editDistCode.trim()) {
      setDistEditError('Vui lòng nhập đủ mã và tên quận / huyện')
      return
    }

    try {
      setDistEditLoading(true)
      setDistEditError('')

      const res = await fetch(
        `${API_BASE_URL}/districts/${editingDistrictId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          body: JSON.stringify({
            name: editDistName.trim(),
            code: editDistCode.trim(),
            province_id: selectedProvinceId,
          }),
        },
      )

      const json = await safeJson(res)
      if (!res.ok || json?.status === false) {
        throw new Error(json?.message || 'Không cập nhật được quận / huyện')
      }

      setDistricts(prev =>
        prev.map(d =>
          d.id === editingDistrictId
            ? { ...d, name: editDistName.trim(), code: editDistCode.trim() }
            : d,
        ),
      )
      cancelEditDistrict()
    } catch (err) {
      console.error(err)
      setDistEditError(err.message || 'Có lỗi khi cập nhật quận / huyện')
    } finally {
      setDistEditLoading(false)
    }
  }

  // XOÁ QUẬN / HUYỆN
  const handleDeleteDistrict = async id => {
    if (!window.confirm(`Xoá quận / huyện #${id}?`)) return

    try {
      const res = await fetch(`${API_BASE_URL}/districts/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })

      const json = await safeJson(res)
      if (!res.ok || json?.status === false) {
        throw new Error(json?.message || 'Không xoá được quận / huyện')
      }

      setDistricts(prev => prev.filter(d => d.id !== id))

      if (selectedDistrictId === id) {
        setSelectedDistrictId(null)
        setWards([])
      }
    } catch (err) {
      console.error(err)
      alert(err.message || 'Có lỗi khi xoá quận / huyện')
    }
  }

  // ============================
  // 3. WARDS
  // ============================
  useEffect(() => {
    if (!selectedDistrictId) {
      setWards([])
      return
    }

    const controller = new AbortController()

    async function fetchWards() {
      try {
        setWardLoading(true)
        setWardError('')

        const params = new URLSearchParams()
        params.append('district_id', String(selectedDistrictId))
        if (wardQ.trim()) params.append('q', wardQ.trim())

        const res = await fetch(
          `${API_BASE_URL}/wards?${params.toString()}`,
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
            json?.message || 'Không tải được danh sách phường / xã',
          )
        }

        const list = json?.data || json || []
        setWards(Array.isArray(list) ? list : [])
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error(err)
        setWardError(err.message || 'Có lỗi khi tải phường / xã')
      } finally {
        setWardLoading(false)
      }
    }

    fetchWards()
    return () => controller.abort()
  }, [selectedDistrictId, wardQ, token])

  const handleCreateWard = async e => {
    e.preventDefault()
    if (!selectedDistrictId) {
      setWardCreateError('Hãy chọn một quận / huyện trước')
      return
    }
    if (!newWardName.trim() || !newWardCode.trim()) {
      setWardCreateError('Vui lòng nhập đủ mã và tên phường / xã')
      return
    }

    try {
      setWardCreateLoading(true)
      setWardCreateError('')

      const res = await fetch(`${API_BASE_URL}/wards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: newWardName.trim(),
          code: newWardCode.trim(),
          district_id: selectedDistrictId,
        }),
      })

      const json = await safeJson(res)
      if (!res.ok || json?.status === false) {
        throw new Error(json?.message || 'Không thêm được phường / xã')
      }

      const created = json?.data || json
      setWards(prev => [...prev, created])
      setNewWardName('')
      setNewWardCode('')
    } catch (err) {
      console.error(err)
      setWardCreateError(err.message || 'Có lỗi khi thêm phường / xã')
    } finally {
      setWardCreateLoading(false)
    }
  }

  // XOÁ PHƯỜNG / XÃ
  const handleDeleteWard = async id => {
    if (!window.confirm(`Xoá phường / xã #${id}?`)) return

    try {
      const res = await fetch(`${API_BASE_URL}/wards/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })

      const json = await safeJson(res)
      if (!res.ok || json?.status === false) {
        throw new Error(json?.message || 'Không xoá được phường / xã')
      }

      setWards(prev => prev.filter(w => w.id !== id))
    } catch (err) {
      console.error(err)
      alert(err.message || 'Có lỗi khi xoá phường / xã')
    }
  }

  // ============ RENDER ============
  return (
    <section className="admin-page">
      <header className="admin-page__head">
        <div>
          <h1 className="admin-page__title">Địa lý – Tỉnh / Quận / Phường</h1>
          <p className="admin-page__desc">
            Quản lý các bảng <code>provinces</code>, <code>districts</code>,{' '}
            <code>wards</code> dùng cho địa chỉ bài đăng.
          </p>
        </div>
      </header>

      <div className="admin-grid-2">
        {/* ===================== PROVINCES ===================== */}
        <div className="admin-card">
          <h2 className="admin-card__title">Tỉnh / Thành (provinces)</h2>

          {/* form tạo province */}
          <form
            className="admin-toolbar"
            onSubmit={handleCreateProvince}
            style={{ gap: 8 }}
          >
            <input
              className="admin-input"
              placeholder="Mã tỉnh (VD: HCM, HN...)"
              value={newProvCode}
              onChange={e => setNewProvCode(e.target.value)}
              style={{ maxWidth: 120 }}
            />
            <input
              className="admin-input"
              placeholder="Tên tỉnh / thành..."
              value={newProvName}
              onChange={e => setNewProvName(e.target.value)}
            />
            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={provCreateLoading}
            >
              {provCreateLoading ? 'Đang thêm...' : '+ Thêm tỉnh'}
            </button>
          </form>
          {provCreateError && (
            <p className="admin-error" style={{ marginTop: 4 }}>
              {provCreateError}
            </p>
          )}

          {/* ô tìm kiếm */}
          <div className="admin-toolbar" style={{ marginTop: 10 }}>
            <input
              className="admin-input"
              placeholder="Tìm tỉnh theo tên..."
              value={provinceQ}
              onChange={e => setProvinceQ(e.target.value)}
            />
          </div>

          {provError && <p className="admin-error">{provError}</p>}
          {provLoading && (
            <p className="admin-loading">Đang tải tỉnh / thành…</p>
          )}

          <div className="admin-table__wrap">
            <table className="admin-table admin-table--compact">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Mã</th>
                  <th>Tên</th>
                  <th style={{ width: 150 }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {provinces.length === 0 && !provLoading && !provError && (
                  <tr>
                    <td colSpan={4} className="admin-empty">
                      Chưa có tỉnh / thành nào hoặc không tìm thấy kết quả.
                    </td>
                  </tr>
                )}

                {provinces.map(p => (
                  <Fragment key={p.id}>
                    {/* HÀNG FORM SỬA */}
                    {editingProvinceId === p.id && (
                      <tr className="admin-edit-row">
                        <td colSpan={4}>
                          {provEditError && (
                            <p
                              className="admin-error"
                              style={{ marginBottom: 6 }}
                            >
                              {provEditError}
                            </p>
                          )}
                          <form
                            onSubmit={handleSubmitProvinceEdit}
                            className="admin-edit-form-inline"
                          >
                            <div className="admin-edit-form__grid">
                              <input
                                className="admin-input"
                                placeholder="Mã tỉnh"
                                value={editProvCode}
                                onChange={e =>
                                  setEditProvCode(e.target.value)
                                }
                                style={{ maxWidth: 120 }}
                              />
                              <input
                                className="admin-input"
                                placeholder="Tên tỉnh / thành"
                                value={editProvName}
                                onChange={e =>
                                  setEditProvName(e.target.value)
                                }
                              />
                            </div>
                            <div className="admin-edit-form__actions">
                              <button
                                type="button"
                                className="admin-btn admin-btn--ghost"
                                onClick={cancelEditProvince}
                                disabled={provEditLoading}
                              >
                                Huỷ
                              </button>
                              <button
                                type="submit"
                                className="admin-btn admin-btn--primary"
                                disabled={provEditLoading}
                              >
                                {provEditLoading
                                  ? 'Đang lưu...'
                                  : 'Lưu thay đổi'}
                              </button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    )}

                    {/* DÒNG CHÍNH */}
                    <tr
                      className={
                        p.id === selectedProvinceId ? 'is-selected' : ''
                      }
                      onClick={() => {
                        setSelectedProvinceId(p.id)
                        setSelectedDistrictId(null)
                        setWards([])
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{p.id}</td>
                      <td>{p.code}</td>
                      <td>{p.name}</td>
                      <td className="admin-td-actions">
                        <button
                          type="button"
                          className="admin-chip admin-chip--ghost"
                          onClick={e => {
                            e.stopPropagation()
                            startEditProvince(p)
                          }}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="admin-chip admin-chip--danger"
                          onClick={e => {
                            e.stopPropagation()
                            handleDeleteProvince(p.id)
                          }}
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

        {/* ===================== DISTRICTS + WARDS ===================== */}
        <div className="admin-card">
          <h2 className="admin-card__title">Quận / Huyện &amp; Phường / Xã</h2>

          {!selectedProvinceId && (
            <p className="admin-card__subtitle">
              Hãy chọn một <strong>tỉnh</strong> ở bảng bên trái để
              thêm/quản&nbsp;lý quận huyện và phường xã.
            </p>
          )}

          {selectedProvinceId && (
            <>
              <p className="admin-card__subtitle">
                Đang thao tác với tỉnh ID <strong>{selectedProvinceId}</strong>.
                Chọn một quận / huyện để xem phường / xã.
              </p>

              {/* DISTRICTS */}
              <div style={{ marginTop: 10, marginBottom: 14 }}>
                {/* form tạo district */}
                <form
                  className="admin-toolbar"
                  onSubmit={handleCreateDistrict}
                  style={{ gap: 8 }}
                >
                  <input
                    className="admin-input"
                    placeholder="Mã quận / huyện"
                    value={newDistCode}
                    onChange={e => setNewDistCode(e.target.value)}
                    style={{ maxWidth: 120 }}
                  />
                  <input
                    className="admin-input"
                    placeholder="Tên quận / huyện..."
                    value={newDistName}
                    onChange={e => setNewDistName(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="admin-btn admin-btn--ghost"
                    disabled={distCreateLoading}
                  >
                    {distCreateLoading ? 'Đang thêm...' : '+ Thêm quận/huyện'}
                  </button>
                </form>
                {distCreateError && (
                  <p className="admin-error" style={{ marginTop: 4 }}>
                    {distCreateError}
                  </p>
                )}

                {/* ô tìm kiếm */}
                <div className="admin-toolbar" style={{ marginTop: 8 }}>
                  <input
                    className="admin-input"
                    placeholder="Tìm quận / huyện..."
                    value={districtQ}
                    onChange={e => setDistrictQ(e.target.value)}
                  />
                </div>

                {distError && <p className="admin-error">{distError}</p>}
                {distLoading && (
                  <p className="admin-loading">Đang tải quận / huyện…</p>
                )}

                <div
                  className="admin-table__wrap"
                  style={{ marginBottom: 10 }}
                >
                  <table className="admin-table admin-table--compact">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Mã</th>
                        <th>Tên quận / huyện</th>
                        <th style={{ width: 170 }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {districts.length === 0 &&
                        !distLoading &&
                        !distError && (
                          <tr>
                            <td colSpan={4} className="admin-empty">
                              Chưa có quận / huyện nào trong tỉnh này.
                            </td>
                          </tr>
                        )}

                      {districts.map(d => (
                        <Fragment key={d.id}>
                          {/* form sửa ngay trên dòng */}
                          {editingDistrictId === d.id && (
                            <tr className="admin-edit-row">
                              <td colSpan={4}>
                                {distEditError && (
                                  <p
                                    className="admin-error"
                                    style={{ marginBottom: 6 }}
                                  >
                                    {distEditError}
                                  </p>
                                )}
                                <form
                                  onSubmit={handleSubmitDistrictEdit}
                                  className="admin-edit-form-inline"
                                >
                                  <div className="admin-edit-form__grid">
                                    <input
                                      className="admin-input"
                                      placeholder="Mã quận / huyện"
                                      value={editDistCode}
                                      onChange={e =>
                                        setEditDistCode(e.target.value)
                                      }
                                      style={{ maxWidth: 120 }}
                                    />
                                    <input
                                      className="admin-input"
                                      placeholder="Tên quận / huyện"
                                      value={editDistName}
                                      onChange={e =>
                                        setEditDistName(e.target.value)
                                      }
                                    />
                                  </div>
                                  <div className="admin-edit-form__actions">
                                    <button
                                      type="button"
                                      className="admin-btn admin-btn--ghost"
                                      onClick={cancelEditDistrict}
                                      disabled={distEditLoading}
                                    >
                                      Huỷ
                                    </button>
                                    <button
                                      type="submit"
                                      className="admin-btn admin-btn--primary"
                                      disabled={distEditLoading}
                                    >
                                      {distEditLoading
                                        ? 'Đang lưu...'
                                        : 'Lưu thay đổi'}
                                    </button>
                                  </div>
                                </form>
                              </td>
                            </tr>
                          )}

                          {/* dòng chính */}
                          <tr
                            className={
                              d.id === selectedDistrictId ? 'is-selected' : ''
                            }
                            onClick={() => setSelectedDistrictId(d.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td>{d.id}</td>
                            <td>{d.code}</td>
                            <td>{d.name}</td>
                            <td className="admin-td-actions">
                              <button
                                type="button"
                                className="admin-chip admin-chip--ghost"
                                onClick={e => {
                                  e.stopPropagation()
                                  startEditDistrict(d)
                                }}
                              >
                                Sửa
                              </button>
                              <button
                                type="button"
                                className="admin-chip admin-chip--danger"
                                onClick={e => {
                                  e.stopPropagation()
                                  handleDeleteDistrict(d.id)
                                }}
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

              {/* ===== PHƯỜNG/XÃ – chỉ hiện khi đã chọn quận/huyện ===== */}
              {selectedDistrictId ? (
                <div>
                  {/* form tạo ward */}
                  <form
                    className="admin-toolbar"
                    onSubmit={handleCreateWard}
                    style={{ gap: 8 }}
                  >
                    <input
                      className="admin-input"
                      placeholder="Mã phường / xã"
                      value={newWardCode}
                      onChange={e => setNewWardCode(e.target.value)}
                      style={{ maxWidth: 120 }}
                    />
                    <input
                      className="admin-input"
                      placeholder="Tên phường / xã..."
                      value={newWardName}
                      onChange={e => setNewWardName(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="admin-btn admin-btn--ghost"
                      disabled={wardCreateLoading}
                    >
                      {wardCreateLoading
                        ? 'Đang thêm...'
                        : '+ Thêm phường/xã'}
                    </button>
                  </form>
                  {wardCreateError && (
                    <p className="admin-error" style={{ marginTop: 4 }}>
                      {wardCreateError}
                    </p>
                  )}

                  <div className="admin-toolbar" style={{ marginTop: 8 }}>
                    <input
                      className="admin-input"
                      placeholder="Tìm phường / xã..."
                      value={wardQ}
                      onChange={e => setWardQ(e.target.value)}
                    />
                  </div>

                  {wardError && <p className="admin-error">{wardError}</p>}
                  {wardLoading && (
                    <p className="admin-loading">Đang tải phường / xã…</p>
                  )}

                  <div className="admin-table__wrap">
                    <table className="admin-table admin-table--compact">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Mã</th>
                          <th>Tên phường / xã</th>
                          <th style={{ width: 90 }}>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wards.length === 0 &&
                          !wardLoading &&
                          !wardError && (
                            <tr>
                              <td colSpan={4} className="admin-empty">
                                Chưa có phường / xã nào trong quận/huyện này.
                              </td>
                            </tr>
                          )}

                        {wards.map(w => (
                          <tr key={w.id}>
                            <td>{w.id}</td>
                            <td>{w.code}</td>
                            <td>{w.name}</td>
                            <td className="admin-td-actions">
                              <button
                                type="button"
                                className="admin-chip admin-chip--danger"
                                onClick={() => handleDeleteWard(w.id)}
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
              ) : (
                <p className="admin-card__subtitle" style={{ marginTop: 12 }}>
                  Hãy chọn một <strong>quận / huyện</strong> ở bảng trên để
                  thêm và xem danh sách phường / xã.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
