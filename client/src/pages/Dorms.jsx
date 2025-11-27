// src/pages/DormsExplore.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../assets/style/style.css'

// ===== CẤU HÌNH API =====
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

/** Bộ lọc giá & diện tích cho Ký túc xá / Dorm */
const PRICE = [
  { v: '', t: 'Mức giá' },
  { v: '0-800000', t: '< 800k' },
  { v: '800000-1500000', t: '800k – 1.5 triệu' },
  { v: '1500000-2500000', t: '1.5 – 2.5 triệu' },
  { v: '2500000-4000000', t: '2.5 – 4 triệu' },
  { v: '4000000-999999999', t: '> 4 triệu' },
]

const AREA = [
  { v: '', t: 'Diện tích' },
  { v: '0-15', t: '< 15 m²' },
  { v: '15-25', t: '15 – 25 m²' },
  { v: '25-40', t: '25 – 40 m²' },
  { v: '40-60', t: '40 – 60 m²' },
  { v: '60-999', t: '> 60 m²' },
]

const AMENITIES = [
  { k: 'giuong-tang', t: 'Giường tầng' },
  { k: 'may-lanh', t: 'Máy lạnh' },
  { k: 'wc-chung', t: 'WC chung' },
  { k: 'wc-rieng', t: 'WC riêng' },
  { k: 'wifi', t: 'WiFi miễn phí' },
  { k: 'giu-xe', t: 'Giữ xe' },
  { k: 'may-giat', t: 'Máy giặt' },
]

const environment = [
  { k: 'gan-truong', t: 'Gần trường' },
  { k: 'gan-cho', t: 'Gần chợ' },
  { k: 'gan-bv', t: 'Gần bệnh viện' },
  { k: 'ben-xe-bus', t: 'Gần trạm bus' },
  { k: 'khu-an-ninh', t: 'Khu an ninh' },
]

const member = [
  { k: 'sinh-vien', t: 'Sinh viên' },
  { k: 'nu-uu-tien', t: 'Ưu tiên nữ' },
  { k: 'o-ghep', t: 'Ở ghép' },
  { k: 'nhom-ban', t: 'Nhóm bạn' },
]

const policy = [
  { k: 'gio-giac-tu-do', t: 'Giờ giấc tự do' },
  { k: 'gio-giac-quy-dinh', t: 'Giờ giấc theo nội quy' },
  { k: 'nuoi-thu-cung', t: 'Cho nuôi thú cưng' },
  { k: 'khong-chung-chu', t: 'Không ở chung chủ' },
]

/** Helper: danh sách trang có “…” */
function pageList(totalPages, current) {
  const delta = 1
  const range = []
  const left = Math.max(2, current - delta)
  const right = Math.min(totalPages - 1, current + delta)
  range.push(1)
  if (left > 2) range.push('...')
  for (let i = left; i <= right; i++) range.push(i)
  if (right < totalPages - 1) range.push('...')
  if (totalPages > 1) range.push(totalPages)
  return range
}

// category_id = 4 cho Ký túc xá / Dorm
const CATEGORY_ID = 4

export default function DormsExplore() {
  const nav = useNavigate()
  const { search } = useLocation()
  const qs = new URLSearchParams(search)

  // ==== LOCATION STATE (TỈNH / QUẬN) ====
  const [provinceList, setProvinceList] = useState([])
  const [districtList, setDistrictList] = useState([])

  // ==== FILTER STATE (user đang chỉnh) ====
  const [q, setQ] = useState(qs.get('q') || '')
  const [province, setProvince] = useState(qs.get('province') || '')
  const [district, setDistrict] = useState(qs.get('district') || '')
  const [price, setPrice] = useState(qs.get('price') || '')
  const [area, setArea] = useState(qs.get('area') || '')
  const [amen, setAmen] = useState(
    (qs.get('amen') || '').split(',').filter(Boolean),
  )
  const [sort, setSort] = useState(qs.get('sort') || 'new')
  const [page, setPage] = useState(Number(qs.get('page') || 1))

  // version filter đã APPLY – chỉ khi tăng version mới lọc lại
  const [appliedVersion, setAppliedVersion] = useState(0)

  const PAGE_SIZE = 8

  // ==== DATA STATE ====
  const [rawItems, setRawItems] = useState([])
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // sticky shadow cho thanh filter-top
  const barRef = useRef(null)
  useEffect(() => {
    const onScroll = () => {
      if (!barRef.current) return
      barRef.current.classList.toggle('rebar--scrolled', window.scrollY > 140)
    }
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ===== LẤY DANH SÁCH TỈNH =====
  useEffect(() => {
    async function loadProvinces() {
      try {
        const res = await axios.get(`${API_BASE_URL}/provinces`)
        const data = res.data.data || res.data
        setProvinceList(data)
      } catch (err) {
        console.error('Lỗi load provinces', err)
      }
    }
    loadProvinces()
  }, [])

  // ===== LẤY DANH SÁCH QUẬN KHI ĐỔI TỈNH =====
  useEffect(() => {
    if (!province) {
      setDistrictList([])
      setDistrict('')
      return
    }

    async function loadDistricts() {
      try {
        const res = await axios.get(`${API_BASE_URL}/districts`, {
          params: { province_id: province },
        })
        const data = res.data.data || res.data
        setDistrictList(data)
      } catch (err) {
        console.error('Lỗi load districts', err)
      }
    }

    loadDistricts()
  }, [province])

  // ===== GỌI API LẤY DANH SÁCH DORM (CATEGORY_ID = 4) =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')

        const res = await axios.get(
          `${API_BASE_URL}/categories/${CATEGORY_ID}/posts`,
        )

        const posts = res.data.posts || res.data.data || res.data || []

        // 🔥 Chỉ lấy bài đã duyệt (published)
        const mapped = posts
          .filter(p => p.status === 'published')
          .map(p => ({
            id: p.id,
            title: p.title,
            price: Number(p.price) || 0,
            area: Number(p.area) || 0,
            addr: p.address || p.full_address || '',
            img:
              p.images?.[0]?.url ||
              'https://via.placeholder.com/400x250?text=No+Image',
            vip: p.is_vip === 1 || p.vip === 1,
            time: new Date(p.created_at || Date.now()).toLocaleDateString(
              'vi-VN',
            ),
            province_id: p.province_id || null,
            district_id: p.district_id || null,
          }))

        setRawItems(mapped)
      } catch (e) {
        console.error(e)
        setError('Không tải được danh sách ký túc xá / phòng ở ghép.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // ===== FILTER + SORT + PAGINATE (chỉ chạy khi appliedVersion / page đổi) =====
  useEffect(() => {
    let data = [...rawItems]

    if (q) {
      const qLower = q.toLowerCase()
      data = data.filter(d => d.title.toLowerCase().includes(qLower))
    }

    if (province) {
      data = data.filter(d => String(d.province_id) === String(province))
    }
    if (district) {
      data = data.filter(d => String(d.district_id) === String(district))
    }

    if (price) {
      const [mi, ma] = price.split('-').map(Number)
      data = data.filter(d => d.price >= mi && d.price <= ma)
    }
    if (area) {
      const [mi, ma] = area.split('-').map(Number)
      data = data.filter(d => d.area >= mi && d.area <= ma)
    }

    if (sort === 'price_asc') data.sort((a, b) => a.price - b.price)
    else if (sort === 'price_desc') data.sort((a, b) => b.price - a.price)
    else if (sort === 'area_desc') data.sort((a, b) => b.area - a.area)
    // sort === 'new' thì giữ thứ tự mặc định

    setTotal(data.length)
    const start = (page - 1) * PAGE_SIZE
    setItems(data.slice(start, start + PAGE_SIZE))
  }, [rawItems, appliedVersion, page])

  // ===== SYNC QUERY LÊN URL (sau khi APPLY) =====
  useEffect(() => {
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    if (province) p.set('province', province)
    if (district) p.set('district', district)
    if (price) p.set('price', price)
    if (area) p.set('area', area)
    if (amen.length) p.set('amen', amen.join(','))
    if (sort !== 'new') p.set('sort', sort)
    if (page > 1) p.set('page', String(page))
    nav({ search: p.toString() })
  }, [appliedVersion, page, nav])

  const toggleAmen = k => {
    setAmen(s => (s.includes(k) ? s.filter(x => x !== k) : [...s, k]))
  }

  const chips = useMemo(() => {
    const arr = []
    if (q) arr.push({ k: 'q', t: `"${q}"` })

    if (province) {
      const pObj = provinceList.find(p => String(p.id) === String(province))
      arr.push({ k: 'province', t: pObj?.name || 'Tỉnh/Thành' })
    }
    if (district) {
      const dObj = districtList.find(d => String(d.id) === String(district))
      arr.push({ k: 'district', t: dObj?.name || 'Quận/Huyện' })
    }
    if (price) arr.push({ k: 'price', t: PRICE.find(x => x.v === price)?.t })
    if (area) arr.push({ k: 'area', t: AREA.find(x => x.v === area)?.t })

    const amenLabelPool = [...AMENITIES, ...environment, ...member, ...policy]
    amen.forEach(a => {
      const label = amenLabelPool.find(x => x.k === a)?.t || a
      arr.push({ k: 'amen', v: a, t: label })
    })

    return arr
  }, [
    appliedVersion,
    provinceList,
    districtList,
    q,
    province,
    district,
    price,
    area,
    amen,
  ])

  const clearChip = (k, v) => {
    if (k === 'q') setQ('')
    if (k === 'province') setProvince('')
    if (k === 'district') setDistrict('')
    if (k === 'price') setPrice('')
    if (k === 'area') setArea('')
    if (k === 'amen') setAmen(s => s.filter(x => x !== v))
    setPage(1)
    setAppliedVersion(ver => ver + 1)
  }

  const clearAll = () => {
    setQ('')
    setProvince('')
    setDistrict('')
    setPrice('')
    setArea('')
    setAmen([])
    setSort('new')
    setPage(1)
    setAppliedVersion(ver => ver + 1)
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const applyFilters = () => {
    setPage(1)
    setAppliedVersion(ver => ver + 1)
  }

  return (
    <div className="re">
      {/* HERO */}
      <section
        className="re-hero u-fullbleed"
        style={{
          backgroundImage:
            'url("https://cdn.luxstay.com/rooms/26764/large/room_26764_94_1560498789.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="container re-hero__inner">
          <div>
            <h1>Khám phá ký túc xá • phòng ở ghép</h1>
            <p>Tiết kiệm chi phí, phù hợp sinh viên &amp; người đi làm trẻ.</p>
          </div>
        </div>
      </section>

      {/* THANH TÌM TRÊN CÙNG */}
      <div className="rebar u-fullbleed" ref={barRef}>
        <div className="container rebar__inner">
          <form
            className="rebar-search"
            onSubmit={e => {
              e.preventDefault()
              applyFilters()
            }}
          >
            <div className="re-input re-input--grow">
              <span className="re-ico">🔎</span>
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Từ khoá, khu vực, gần trường..."
              />
            </div>

            {/* Tỉnh/Thành (API) */}
            <select
              className="re-input"
              value={province}
              onChange={e => {
                setProvince(e.target.value)
                setDistrict('')
              }}
            >
              <option value="">Tỉnh/Thành</option>
              {provinceList.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Quận/Huyện (API) */}
            <select
              className="re-input"
              value={district}
              onChange={e => setDistrict(e.target.value)}
              disabled={!province}
            >
              <option value="">Quận/Huyện</option>
              {districtList.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Mức giá */}
            <select
              className="re-input"
              value={price}
              onChange={e => setPrice(e.target.value)}
            >
              {PRICE.map(o => (
                <option key={o.v} value={o.v}>
                  {o.t}
                </option>
              ))}
            </select>

            {/* Diện tích */}
            <select
              className="re-input"
              value={area}
              onChange={e => setArea(e.target.value)}
            >
              {AREA.map(o => (
                <option key={o.v} value={o.v}>
                  {o.t}
                </option>
              ))}
            </select>

            {/* Sắp xếp */}
            <select
              className="re-input"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="new">Tin mới</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="area_desc">Diện tích lớn</option>
            </select>

            <button className="re-btn re-btn--primary" type="submit">
              Tìm
            </button>
          </form>
        </div>
      </div>

      {/* BỐ CỤC 2 CỘT */}
      <section className="container re-layout">
        {/* LEFT: KẾT QUẢ */}
        <div className="re-main">
          {chips.length > 0 && (
            <div className="re-chips">
              {chips.map((c, i) => (
                <button
                  key={i}
                  className="re-chip is-active"
                  onClick={() => clearChip(c.k, c.v)}
                  type="button"
                >
                  {c.t} <span className="x">×</span>
                </button>
              ))}
              <button className="re-linkclear" type="button" onClick={clearAll}>
                Xoá tất cả
              </button>
            </div>
          )}

          <header className="re-results__head">
            <div>
              <h2>Ký túc xá / phòng ở ghép</h2>
              {loading ? (
                <p>Đang tải...</p>
              ) : (
                <p>{total.toLocaleString()} tin phù hợp</p>
              )}
            </div>
          </header>

          {error && <p className="re-error">{error}</p>}

          <div className="re-grid">
            {items.map(it => (
              <article
                key={it.id}
                className={'re-card' + (it.vip ? ' is-vip' : '')}
              >
                <div className="re-card__media">
                  <img src={it.img} alt={it.title} />
                  {it.vip && <span className="re-badge">VIP</span>}
                </div>
                <div className="re-card__body">
                  <h3 className="re-card__title" title={it.title}>
                    {it.title}
                  </h3>
                  <div className="re-card__meta">
                    <span className="price">
                      {it.price?.toLocaleString()} ₫/tháng
                    </span>
                    <span className="dot">•</span>
                    <span>{it.area} m²</span>
                    <span className="dot">•</span>
                    <span>{it.addr}</span>
                  </div>
                  <div className="re-card__foot">
                    <span className="time">{it.time}</span>
                    <Link to={`/post/${it.id}`} className="re-btn re-btn--line">
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* PHÂN TRANG */}
          <nav className="re-paging" aria-label="pagination">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              ‹
            </button>
            {pageList(totalPages, page).map((n, idx) =>
              n === '...' ? (
                <span key={`e${idx}`} className="re-paging__ellipsis">
                  …
                </span>
              ) : (
                <button
                  key={n}
                  className={page === n ? 'is-on' : ''}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ),
            )}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              ›
            </button>
          </nav>
        </div>

        {/* RIGHT: ASIDE FILTER */}
        <aside className="re-aside">
          <div className="re-filtercard">
            <h3>Bộ lọc nhanh</h3>

            <div className="re-field">
              <label>Tỉnh/Thành</label>
              <select
                value={province}
                onChange={e => {
                  setProvince(e.target.value)
                  setDistrict('')
                }}
              >
                <option value="">Tất cả</option>
                {provinceList.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="re-field">
              <label>Quận/Huyện</label>
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                disabled={!province}
              >
                <option value="">Tất cả</option>
                {districtList.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="re-field">
              <label>Mức giá</label>
              <select value={price} onChange={e => setPrice(e.target.value)}>
                {PRICE.map(o => (
                  <option key={o.v} value={o.v}>
                    {o.t}
                  </option>
                ))}
              </select>
            </div>

            <div className="re-field">
              <label>Diện tích</label>
              <select value={area} onChange={e => setArea(e.target.value)}>
                {AREA.map(o => (
                  <option key={o.v} value={o.v}>
                    {o.t}
                  </option>
                ))}
              </select>
            </div>

            <div className="re-field">
              <label>Tiện ích</label>
              <div className="re-checklist">
                {AMENITIES.map(a => (
                  <label key={a.k} className="re-check">
                    <input
                      type="checkbox"
                      checked={amen.includes(a.k)}
                      onChange={() => toggleAmen(a.k)}
                    />
                    <span>{a.t}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="re-field">
              <label>Môi trường xung quanh</label>
              <div className="re-checklist">
                {environment.map(a => (
                  <label key={a.k} className="re-check">
                    <input
                      type="checkbox"
                      checked={amen.includes(a.k)}
                      onChange={() => toggleAmen(a.k)}
                    />
                    <span>{a.t}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="re-field">
              <label>Đối tượng</label>
              <div className="re-checklist">
                {member.map(a => (
                  <label key={a.k} className="re-check">
                    <input
                      type="checkbox"
                      checked={amen.includes(a.k)}
                      onChange={() => toggleAmen(a.k)}
                    />
                    <span>{a.t}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="re-field">
              <label>Chính sách</label>
              <div className="re-checklist">
                {policy.map(a => (
                  <label key={a.k} className="re-check">
                    <input
                      type="checkbox"
                      checked={amen.includes(a.k)}
                      onChange={() => toggleAmen(a.k)}
                    />
                    <span>{a.t}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="re-field">
              <label>Sắp xếp</label>
              <select value={sort} onChange={e => setSort(e.target.value)}>
                <option value="new">Tin mới</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="area_desc">Diện tích lớn</option>
              </select>
            </div>

            <div className="re-filtercard__actions">
              <button
                type="button"
                className="re-btn re-btn--primary"
                onClick={applyFilters}
              >
                Áp dụng
              </button>
              <button
                type="button"
                className="re-btn re-btn--ghost"
                onClick={clearAll}
              >
                Xoá bộ lọc
              </button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}
