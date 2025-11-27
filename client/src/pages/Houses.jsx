// src/pages/HousesExplore.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../assets/style/style.css'

// ===== CẤU HÌNH API =====
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

/** Bộ lọc giá & diện tích cho Nhà */
const PRICE = [
  { v: '', t: 'Mức giá' },
  { v: '0-8000000', t: '< 8 triệu' },
  { v: '8000000-15000000', t: '8–15 triệu' },
  { v: '15000000-25000000', t: '15–25 triệu' },
  { v: '25000000-40000000', t: '25–40 triệu' },
  { v: '40000000-999999999', t: '> 40 triệu' },
]

const AREA = [
  { v: '', t: 'Diện tích' },
  { v: '0-50', t: '< 50 m²' },
  { v: '50-80', t: '50–80 m²' },
  { v: '80-120', t: '80–120 m²' },
  { v: '120-180', t: '120–180 m²' },
  { v: '180-999', t: '> 180 m²' },
]

const AMENITIES = [
  { k: 'gara', t: 'Gara/đậu xe' },
  { k: 'san-vuon', t: 'Sân vườn' },
  { k: 'noi-that', t: 'Nội thất' },
  { k: 'ban-cong', t: 'Ban công' },
  { k: 'may-lanh', t: 'Máy lạnh' },
  { k: 'an-ninh', t: 'Khu an ninh' },
]

const environment = [
  { k: 'cho', t: 'Chợ' },
  { k: 'cong-vien', t: 'Công viên' },
  { k: 'truong-hoc', t: 'Trường học' },
  { k: 'ben-xe-bus', t: 'Bến xe bus' },
  { k: 'sieu-thi', t: 'Siêu thị' },
  { k: 'trung-tam-the-thao', t: 'Trung tâm thể thao' },
]

const member = [
  { k: 'di-hoc', t: 'Đi học' },
  { k: 'di-lam', t: 'Đi làm' },
  { k: 'gia-dinh', t: 'Gia đình' },
  { k: 'cap-doi', t: 'Cặp đôi' },
]

const policy = [
  { k: 'gio-giac-tu-do', t: 'Giờ giấc tự do' },
  { k: 'nuoi-thu-cung', t: 'Nuôi thú cưng' },
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

// category_id = 2 cho Nhà nguyên căn
const CATEGORY_ID = 2

export default function HousesExplore() {
  const nav = useNavigate()
  const { search } = useLocation()
  const qs = new URLSearchParams(search)

  // ===== GIÁ TRỊ KHỞI TẠO TỪ QUERY =====
  const initQ = qs.get('q') || ''
  const initProvince = qs.get('province') || ''
  const initDistrict = qs.get('district') || ''
  const initPrice = qs.get('price') || ''
  const initArea = qs.get('area') || ''
  const initAmenArr = (qs.get('amen') || '').split(',').filter(Boolean)
  const initSort = qs.get('sort') || 'new'

  // ===== STATE DRAFT (gõ ở UI) =====
  const [qDraft, setQDraft] = useState(initQ)
  const [provinceDraft, setProvinceDraft] = useState(initProvince)
  const [districtDraft, setDistrictDraft] = useState(initDistrict)
  const [priceDraft, setPriceDraft] = useState(initPrice)
  const [areaDraft, setAreaDraft] = useState(initArea)
  const [amenDraft, setAmenDraft] = useState(initAmenArr)
  const [sortDraft, setSortDraft] = useState(initSort)

  // ===== STATE FILTER ĐÃ ÁP DỤNG (dùng để lọc) =====
  const [q, setQ] = useState(initQ)
  const [province, setProvince] = useState(initProvince)
  const [district, setDistrict] = useState(initDistrict)
  const [price, setPrice] = useState(initPrice)
  const [area, setArea] = useState(initArea)
  const [amen, setAmen] = useState(initAmenArr)
  const [sort, setSort] = useState(initSort)
  const [page, setPage] = useState(Number(qs.get('page') || 1))

  const PAGE_SIZE = 8

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

  // ===== ÁP DỤNG FILTER TỪ DRAFT =====
  const applyFilters = () => {
    setQ(qDraft)
    setProvince(provinceDraft)
    setDistrict(districtDraft)
    setPrice(priceDraft)
    setArea(areaDraft)
    setAmen(amenDraft)
    setSort(sortDraft)
    setPage(1)
  }

  // ===== GỌI API LẤY DANH SÁCH NHÀ (CATEGORY_ID = 2) =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')

        const res = await axios.get(
          `${API_BASE_URL}/categories/${CATEGORY_ID}/posts`,
        )

        const posts = res.data.posts || res.data.data || []

        // 🔥 Chỉ giữ bài đã duyệt (published)
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
          }))

        setRawItems(mapped)
      } catch (e) {
        console.error(e)
        setError('Không tải được danh sách nhà cho thuê.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // ===== FILTER + SORT + PAGINATE (theo state đã áp dụng) =====
  useEffect(() => {
    let data = [...rawItems]

    if (q) {
      data = data.filter(d =>
        d.title.toLowerCase().includes(q.toLowerCase()),
      )
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
    // sort = 'new' giữ nguyên thứ tự API

    setTotal(data.length)
    const start = (page - 1) * PAGE_SIZE
    setItems(data.slice(start, start + PAGE_SIZE))
  }, [rawItems, q, province, district, price, area, amen, sort, page])

  // ===== SYNC QUERY LÊN URL (dùng filter đã áp dụng) =====
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
  }, [q, province, district, price, area, amen, sort, page, nav])

  // toggle tiện ích (draft)
  const toggleAmenDraft = k => {
    setAmenDraft(s => (s.includes(k) ? s.filter(x => x !== k) : [...s, k]))
  }

  const chips = useMemo(() => {
    const arr = []
    if (q) arr.push({ k: 'q', t: `"${q}"` })
    if (province) arr.push({ k: 'province', t: province })
    if (district) arr.push({ k: 'district', t: district })
    if (price) arr.push({ k: 'price', t: PRICE.find(x => x.v === price)?.t })
    if (area) arr.push({ k: 'area', t: AREA.find(x => x.v === area)?.t })

    const amenLabelPool = [...AMENITIES, ...environment, ...member, ...policy]
    amen.forEach(a => {
      const label = amenLabelPool.find(x => x.k === a)?.t || a
      arr.push({ k: 'amen', v: a, t: label })
    })

    return arr
  }, [q, province, district, price, area, amen])

  const clearChip = (k, v) => {
    if (k === 'q') {
      setQ('')
      setQDraft('')
    }
    if (k === 'province') {
      setProvince('')
      setProvinceDraft('')
      setDistrict('')
      setDistrictDraft('')
    }
    if (k === 'district') {
      setDistrict('')
      setDistrictDraft('')
    }
    if (k === 'price') {
      setPrice('')
      setPriceDraft('')
    }
    if (k === 'area') {
      setArea('')
      setAreaDraft('')
    }
    if (k === 'amen') {
      setAmen(s => s.filter(x => x !== v))
      setAmenDraft(s => s.filter(x => x !== v))
    }
    setPage(1)
  }

  const clearAll = () => {
    setQ('')
    setQDraft('')
    setProvince('')
    setProvinceDraft('')
    setDistrict('')
    setDistrictDraft('')
    setPrice('')
    setPriceDraft('')
    setArea('')
    setAreaDraft('')
    setAmen([])
    setAmenDraft([])
    setSort('new')
    setSortDraft('new')
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="re">
      {/* HERO */}
      <section
        className="re-hero u-fullbleed"
        style={{
          backgroundImage:
            'url("https://kientruchnp.vn/wp-content/uploads/2024/12/mau-nha-vuon-600-trieu-03-1024x505.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="container re-hero__inner">
          <div>
            <h1>Khám phá nhà nguyên căn • studio • officetel</h1>
            <p>Lọc chi tiết, gợi ý thông minh & tin xác thực.</p>
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
                value={qDraft}
                onChange={e => setQDraft(e.target.value)}
                placeholder="Từ khoá, khu vực, tuyến đường..."
              />
            </div>
            <select
              className="re-input"
              value={provinceDraft}
              onChange={e => {
                setProvinceDraft(e.target.value)
                setDistrictDraft('')
              }}
            >
              <option value="">Tỉnh/Thành</option>
              <option>TP. Hồ Chí Minh</option>
              <option>Hà Nội</option>
              <option>Đà Nẵng</option>
            </select>
            <select
              className="re-input"
              value={districtDraft}
              onChange={e => setDistrictDraft(e.target.value)}
            >
              <option value="">Quận/Huyện</option>
              <option>Quận 1</option>
              <option>Quận 7</option>
              <option>Bình Thạnh</option>
              <option>TP. Thủ Đức</option>
            </select>
            <select
              className="re-input"
              value={priceDraft}
              onChange={e => setPriceDraft(e.target.value)}
            >
              {PRICE.map(o => (
                <option key={o.v} value={o.v}>
                  {o.t}
                </option>
              ))}
            </select>
            <select
              className="re-input"
              value={areaDraft}
              onChange={e => setAreaDraft(e.target.value)}
            >
              {AREA.map(o => (
                <option key={o.v} value={o.v}>
                  {o.t}
                </option>
              ))}
            </select>
            <select
              className="re-input"
              value={sortDraft}
              onChange={e => setSortDraft(e.target.value)}
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
              <h2>Nhà ở</h2>
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
                value={provinceDraft}
                onChange={e => {
                  setProvinceDraft(e.target.value)
                  setDistrictDraft('')
                }}
              >
                <option value="">Tất cả</option>
                <option>TP. Hồ Chí Minh</option>
                <option>Hà Nội</option>
                <option>Đà Nẵng</option>
              </select>
            </div>

            <div className="re-field">
              <label>Quận/Huyện</label>
              <select
                value={districtDraft}
                onChange={e => {
                  setDistrictDraft(e.target.value)
                }}
              >
                <option value="">Tất cả</option>
                <option>Quận 1</option>
                <option>Quận 7</option>
                <option>Bình Thạnh</option>
                <option>TP. Thủ Đức</option>
              </select>
            </div>

            <div className="re-field">
              <label>Mức giá</label>
              <select
                value={priceDraft}
                onChange={e => setPriceDraft(e.target.value)}
              >
                {PRICE.map(o => (
                  <option key={o.v} value={o.v}>
                    {o.t}
                  </option>
                ))}
              </select>
            </div>

            <div className="re-field">
              <label>Diện tích</label>
              <select
                value={areaDraft}
                onChange={e => setAreaDraft(e.target.value)}
              >
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
                      checked={amenDraft.includes(a.k)}
                      onChange={() => toggleAmenDraft(a.k)}
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
                      checked={amenDraft.includes(a.k)}
                      onChange={() => toggleAmenDraft(a.k)}
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
                      checked={amenDraft.includes(a.k)}
                      onChange={() => toggleAmenDraft(a.k)}
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
                      checked={amenDraft.includes(a.k)}
                      onChange={() => toggleAmenDraft(a.k)}
                    />
                    <span>{a.t}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="re-field">
              <label>Sắp xếp</label>
              <select
                value={sortDraft}
                onChange={e => setSortDraft(e.target.value)}
              >
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
