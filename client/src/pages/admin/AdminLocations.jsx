// src/pages/admin/AdminLocations.jsx
import { useEffect, useState } from 'react'

export default function AdminLocations() {
  // ====== STATE PROVINCE ======
  const [provinceQ, setProvinceQ] = useState('')
  const [provinces, setProvinces] = useState([])
  const [selectedProvinceId, setSelectedProvinceId] = useState(null)
  const [provLoading, setProvLoading] = useState(false)
  const [provError, setProvError] = useState('')

  // ====== STATE DISTRICT ======
  const [districtQ, setDistrictQ] = useState('')
  const [districts, setDistricts] = useState([])
  const [selectedDistrictId, setSelectedDistrictId] = useState(null)
  const [distLoading, setDistLoading] = useState(false)
  const [distError, setDistError] = useState('')

  // ====== STATE WARD ======
  const [wardQ, setWardQ] = useState('')
  const [wards, setWards] = useState([])
  const [wardLoading, setWardLoading] = useState(false)
  const [wardError, setWardError] = useState('')

  // ============================
  // 1. LOAD PROVINCES (bảng provinces)
  // ============================
  useEffect(() => {
    const controller = new AbortController()

    async function fetchProvinces() {
      try {
        setProvLoading(true)
        setProvError('')

        const params = new URLSearchParams()
        if (provinceQ.trim()) params.append('q', provinceQ.trim())

        /**
         * API #1 – Danh sách tỉnh / thành
         *
         * Laravel gợi ý:
         *   GET /api/admin/provinces?q={keyword}
         *
         * Controller:
         *   Province::query()
         *     ->when($q, fn($qr) =>
         *        $qr->where('name','like',"%$q%")
         *            ->orWhere('code','like',"%$q%"))
         *     ->orderBy('name')
         *     ->get(['id','code','name']);
         *
         * Response gợi ý:
         *   { "data": [ { "id": 1, "code": "HCM", "name": "TP. Hồ Chí Minh" }, ... ] }
         * hoặc trả thẳng mảng [].
         */
        const res = await fetch(
          `/api/admin/provinces?${params.toString()}`,
          { signal: controller.signal },
        )

        const text = await res.text()
        let json
        try {
          json = JSON.parse(text)
        } catch {
          throw new Error('Response không phải JSON hợp lệ (provinces).')
        }

        if (!res.ok) {
          throw new Error(json?.message || 'Không tải được danh sách tỉnh / thành')
        }

        const list = json.data || json
        const arr = Array.isArray(list) ? list : []
        setProvinces(arr)

        // nếu chưa chọn tỉnh nào thì chọn tỉnh đầu tiên
        if (arr.length > 0 && !selectedProvinceId) {
          setSelectedProvinceId(arr[0].id)
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceQ])

  // ============================
  // 2. LOAD DISTRICTS THEO PROVINCE (bảng districts)
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
        if (districtQ.trim()) params.append('q', districtQ.trim())

        /**
         * API #2 – Quận / huyện thuộc 1 tỉnh
         *
         * Gợi ý Laravel:
         *   GET /api/admin/provinces/{province}/districts?q={keyword}
         *
         * Controller:
         *   $province->districts()
         *     ->when($q, fn($qr) =>
         *        $qr->where('name','like',"%$q%")
         *            ->orWhere('code','like',"%$q%"))
         *     ->orderBy('name')
         *     ->get(['id','code','name','province_id']);
         */
        const res = await fetch(
          `/api/admin/provinces/${selectedProvinceId}/districts?${params.toString()}`,
          { signal: controller.signal },
        )

        const text = await res.text()
        let json
        try {
          json = JSON.parse(text)
        } catch {
          throw new Error('Response không phải JSON hợp lệ (districts).')
        }

        if (!res.ok) {
          throw new Error(json?.message || 'Không tải được danh sách quận / huyện')
        }

        const list = json.data || json
        const arr = Array.isArray(list) ? list : []
        setDistricts(arr)

        if (arr.length > 0 && !selectedDistrictId) {
          setSelectedDistrictId(arr[0].id)
        }
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
  }, [selectedProvinceId, districtQ, selectedDistrictId])

  // ============================
  // 3. LOAD WARDS THEO DISTRICT (bảng wards)
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
        if (wardQ.trim()) params.append('q', wardQ.trim())

        /**
         * API #3 – Phường / xã thuộc 1 quận
         *
         * Gợi ý Laravel:
         *   GET /api/admin/districts/{district}/wards?q={keyword}
         *
         * Controller:
         *   $district->wards()
         *     ->when($q, fn($qr) =>
         *        $qr->where('name','like',"%$q%")
         *            ->orWhere('code','like',"%$q%"))
         *     ->orderBy('name')
         *     ->get(['id','code','name','district_id']);
         */
        const res = await fetch(
          `/api/admin/districts/${selectedDistrictId}/wards?${params.toString()}`,
          { signal: controller.signal },
        )

        const text = await res.text()
        let json
        try {
          json = JSON.parse(text)
        } catch {
          throw new Error('Response không phải JSON hợp lệ (wards).')
        }

        if (!res.ok) {
          throw new Error(json?.message || 'Không tải được danh sách phường / xã')
        }

        const list = json.data || json
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
  }, [selectedDistrictId, wardQ])

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

          <div className="admin-toolbar">
            <input
              className="admin-input"
              placeholder="Tìm tỉnh theo tên..."
              value={provinceQ}
              onChange={(e) => setProvinceQ(e.target.value)}
            />
            {/* TODO: sau này mở modal tạo tỉnh mới */}
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={() => alert('TODO: mở form tạo tỉnh/thành mới')}
            >
              + Thêm tỉnh
            </button>
          </div>

          {provError && <p className="admin-error">{provError}</p>}
          {provLoading && <p className="admin-loading">Đang tải tỉnh / thành…</p>}

          <div className="admin-table__wrap">
            <table className="admin-table admin-table--compact">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Mã</th>
                  <th>Tên</th>
                  <th style={{ width: 90 }}>Thao tác</th>
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

                {provinces.map((p) => (
                  <tr
                    key={p.id}
                    className={p.id === selectedProvinceId ? 'is-selected' : ''}
                    onClick={() => setSelectedProvinceId(p.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{p.id}</td>
                    <td>{p.code}</td>
                    <td>{p.name}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-chip admin-chip--ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          alert(`TODO: mở form sửa province #${p.id}`)
                        }}
                      >
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===================== DISTRICTS + WARDS ===================== */}
        <div className="admin-card">
          <h2 className="admin-card__title">Quận / Huyện &amp; Phường / Xã</h2>
          <p className="admin-card__subtitle">
            Chọn một <strong>tỉnh</strong> bên trái để xem danh sách quận /
            huyện và phường / xã tương ứng.
          </p>

          {/* DISTRICTS */}
          <div style={{ marginTop: 10, marginBottom: 14 }}>
            <div className="admin-toolbar">
              <input
                className="admin-input"
                placeholder="Tìm quận / huyện..."
                value={districtQ}
                onChange={(e) => setDistrictQ(e.target.value)}
                disabled={!selectedProvinceId}
              />
            </div>

            {distError && <p className="admin-error">{distError}</p>}
            {distLoading && <p className="admin-loading">Đang tải quận / huyện…</p>}

            <div className="admin-table__wrap" style={{ marginBottom: 10 }}>
              <table className="admin-table admin-table--compact">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Mã</th>
                    <th>Tên quận / huyện</th>
                    <th style={{ width: 90 }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {(!selectedProvinceId || districts.length === 0) &&
                    !distLoading &&
                    !distError && (
                      <tr>
                        <td colSpan={4} className="admin-empty">
                          {selectedProvinceId
                            ? 'Chưa có quận / huyện nào.'
                            : 'Hãy chọn một tỉnh ở bên trái.'}
                        </td>
                      </tr>
                    )}

                  {districts.map((d) => (
                    <tr
                      key={d.id}
                      className={d.id === selectedDistrictId ? 'is-selected' : ''}
                      onClick={() => setSelectedDistrictId(d.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{d.id}</td>
                      <td>{d.code}</td>
                      <td>{d.name}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-chip admin-chip--ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            alert(`TODO: mở form sửa district #${d.id}`)
                          }}
                        >
                          Sửa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* WARDS */}
          <div>
            <div className="admin-toolbar">
              <input
                className="admin-input"
                placeholder="Tìm phường / xã..."
                value={wardQ}
                onChange={(e) => setWardQ(e.target.value)}
                disabled={!selectedDistrictId}
              />
            </div>

            {wardError && <p className="admin-error">{wardError}</p>}
            {wardLoading && <p className="admin-loading">Đang tải phường / xã…</p>}

            <div className="admin-table__wrap">
              <table className="admin-table admin-table--compact">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Mã</th>
                    <th>Tên phường / xã</th>
                  </tr>
                </thead>
                <tbody>
                  {(!selectedDistrictId || wards.length === 0) &&
                    !wardLoading &&
                    !wardError && (
                      <tr>
                        <td colSpan={3} className="admin-empty">
                          {selectedDistrictId
                            ? 'Chưa có phường / xã nào.'
                            : 'Hãy chọn một quận / huyện ở trên.'}
                        </td>
                      </tr>
                    )}

                  {wards.map((w) => (
                    <tr key={w.id}>
                      <td>{w.id}</td>
                      <td>{w.code}</td>
                      <td>{w.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
