import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../assets/style/style.css'

export default function PhongTotHome(){
  const nav = useNavigate()

  // ===== Form tìm kiếm nhanh =====
  const [keyword, setKeyword] = useState('')
  const [province, setProvince] = useState('')
  const [price, setPrice] = useState('')
  const [area, setArea] = useState('')

  // ===== Dữ liệu demo (UI chạy ngay, chưa cần API) =====
  const [featured, setFeatured] = useState([])
  const [blogs, setBlogs] = useState([])
  const [stats] = useState({posts:12500, landlords:3800, views:965000})




  // <-- api ảo-->
  // Phòng trọ quanh các trường (demo)
  const uniList = [
    // API: GET /universities?limit=6
    { id: 1, name: 'Trường Đại học Kinh Tế Huế', logo: 'https://picsum.photos/seed/uni1/90/90' },
    { id: 2, name: 'Trường Đại học Sư phạm', logo: 'https://picsum.photos/seed/uni2/90/90' },
    { id: 3, name: 'Trường Đại học Khoa Học', logo: 'https://picsum.photos/seed/uni3/90/90' },
    { id: 4, name: 'Trường đại học Y Tế Huế', logo: 'https://picsum.photos/seed/uni4/90/90' },
    { id: 5, name: 'Cao Dẳng Công Nghiệp Huế', logo: 'https://picsum.photos/seed/uni5/90/90' },
    { id: 6, name: 'xem thêm', more: true },
  ]

  // Carousel "Cẩm nang"
  const guideRef = useRef(null)
  const scrollGuide = (dir) => {
    const el = guideRef.current
    if (!el) return
    const delta = el.clientWidth * 0.9
    el.scrollBy({ left: dir === 'left' ? -delta : delta, behavior: 'smooth' })
  }

  useEffect(()=>{
    // API: /posts?type=featured&limit=8
    setFeatured([
      { id:1, title:'Phòng studio mới, nội thất đẹp', price:4500000, area:28, address:'Q.7, TP.HCM', img:'https://picsum.photos/seed/a1/1200/800' },
      { id:2, title:'Nhà nguyên căn 1 trệt 1 lầu', price:9000000, area:70, address:'TP. Thủ Đức', img:'https://picsum.photos/seed/a2/1200/800' },
      { id:3, title:'Căn hộ mini ban công thoáng', price:5500000, area:32, address:'Q.10, TP.HCM', img:'https://picsum.photos/seed/a3/1200/800' },
      { id:4, title:'Ký túc xá máy lạnh – trung tâm', price:1300000, area:12, address:'Q.3, TP.HCM', img:'https://picsum.photos/seed/a4/1200/800' },
      { id:5, title:'Phòng trọ có gác, giờ giấc tự do', price:2800000, area:20, address:'Gò Vấp, TP.HCM', img:'https://picsum.photos/seed/a5/1200/800' },
      { id:6, title:'Căn hộ 1PN full nội thất', price:8000000, area:45, address:'Q.2, TP.HCM', img:'https://picsum.photos/seed/a6/1200/800' },
      { id:7, title:'Nhà riêng hẻm rộng, an ninh', price:7500000, area:60, address:'Tân Bình, TP.HCM', img:'https://picsum.photos/seed/a7/1200/800' },
      { id:8, title:'Phòng gần ĐH BK, đi bộ 5 phút', price:2200000, area:18, address:'Q.10, TP.HCM', img:'https://picsum.photos/seed/a8/1200/800' },
    ])
    // API: /blog?limit=8 (dùng cho carousel)
    setBlogs([
      { id:101, title:'Mẹo tìm trọ nhanh trong 24h', excerpt:'3 bước lọc và gọi chủ trọ hiệu quả…', img:'https://picsum.photos/seed/b1/1200/800' },
      { id:102, title:'Checklist xem trọ an toàn', excerpt:'Ánh sáng, an ninh, đồng hồ điện nước…', img:'https://picsum.photos/seed/b2/1200/800' },
      { id:103, title:'Cách thương lượng tiền cọc', excerpt:'Chuẩn bị giấy tờ và bằng chứng thị trường…', img:'https://picsum.photos/seed/b3/1200/800' },
      { id:104, title:'Chọn khu vực phù hợp', excerpt:'Khoảng cách – an ninh – tiện ích…', img:'https://picsum.photos/seed/b4/1200/800' },
      { id:105, title:'Gợi ý nội thất tiết kiệm', excerpt:'Bố trí gọn gàng, sáng sủa…', img:'https://picsum.photos/seed/b5/1200/800' },
    ])
  },[])







  const submitSearch = (e)=>{
    e.preventDefault()
    const qs = new URLSearchParams()
    if(keyword) qs.set('q', keyword)
    if(province) qs.set('province', province)
    if(price) qs.set('price', price)
    if(area) qs.set('area', area)
    nav('/' + (qs.toString() ? `?${qs.toString()}` : ''))
  }

  return (
    <div className="pthome">
      {/* ===== HERO full-width ===== */}
      <section className="pth-hero u-fullbleed">
        <div className="container pth-hero__inner">
          <div className="pth-hero__text">
            <h1>Thuê trọ, nhà, căn hộ<br/>Nhanh – Rõ ràng – Dễ dùng</h1>
            <p>Hàng chục nghìn tin xác thực, cập nhật mỗi ngày.</p>

            <form className="pth-search" onSubmit={submitSearch}>
              <div className="pth-input pth-input--grow">
                <span className="pth-input__icon">🔎</span>
                <input
                  value={keyword}
                  onChange={e=>setKeyword(e.target.value)}
                  placeholder="Bạn muốn tìm ở đâu? (VD: phường xuân phú, phường vĩnh phước, ...)"
                  aria-label="Từ khóa hoặc địa điểm"
                />
              </div>
              <select className="pth-input" value={province} onChange={e=>setProvince(e.target.value)}>
                {/* API: /geo/provinces */}
                <option value="">Tỉnh/Thành</option>
                <option value="HUE">TP. Huế</option>
              </select>
              <select className="pth-input" value={price} onChange={e=>setPrice(e.target.value)}>
                {/* API: /filters/priceRanges */}
                <option value="">Mức giá</option>
                <option value="0-2000000">Dưới 2 triệu</option>
                <option value="2000000-5000000">2–5 triệu</option>
                <option value="5000000-10000000">5–10 triệu</option>
                <option value="10000000-999999999">Trên 10 triệu</option>
              </select>
              <select className="pth-input" value={area} onChange={e=>setArea(e.target.value)}>
                {/* API: /filters/areas */}
                <option value="">Diện tích</option>
                <option value="0-20">Dưới 20 m²</option>
                <option value="20-40">20–40 m²</option>
                <option value="40-60">40–60 m²</option>
                <option value="60-999">Trên 60 m²</option>
              </select>
              <button className="pth-btn pth-btn--primary" type="submit">Tìm kiếm</button>
            </form>

            <ul className="pth-hero__stats">
              <li><strong>{stats.posts.toLocaleString()}</strong> tin đăng</li>
              <li><strong>{stats.landlords.toLocaleString()}</strong> chủ trọ</li>
              <li><strong>{stats.views.toLocaleString()}</strong> lượt xem</li>
            </ul>
          </div>
          <div className="pth-hero__illustration" aria-hidden />
        </div>
      </section>

      {/* ===== Danh mục nhanh ===== */}
      <section className="container pth-quickcats">
        <Link to="/" className="pth-quickcat">
          <img src="https://picsum.photos/seed/c1/1200/800" alt="Phòng trọ"/>
          <div className="pth-quickcat__body"><h3>Phòng trọ</h3><p>Giá rẻ – tiện lợi</p></div>
        </Link>
        <Link to="/can-ho" className="pth-quickcat">
          <img src="https://picsum.photos/seed/c2/1200/800" alt="Căn hộ"/>
          <div className="pth-quickcat__body"><h3>Căn hộ</h3><p>Hiện đại – an ninh</p></div>
        </Link>
        <Link to="/nha-nguyen-can" className="pth-quickcat">
          <img src="https://picsum.photos/seed/c3/1200/800" alt="Nhà nguyên căn"/>
          <div className="pth-quickcat__body"><h3>Nhà nguyên căn</h3><p>Rộng rãi – riêng tư</p></div>
        </Link>
        <Link to="/ky-tuc-xa" className="pth-quickcat">
          <img src="https://picsum.photos/seed/c4/1200/800" alt="Ký túc xá"/>
          <div className="pth-quickcat__body"><h3>Ký túc xá</h3><p>Tiết kiệm – bạn bè</p></div>
        </Link>
      </section>

      {/* ===== Tin nổi bật ===== */}
      <section className="container pth-section">
        <div className="pth-section__head">
          <h2>Tin nổi bật</h2>
          <Link to="/" className="pth-link">Xem tất cả</Link>
        </div>
        <div className="pth-grid">
          {featured.map(item=>(
            <article key={item.id} className="pth-card">
              <div className="pth-card__media">
                <img src={item.img} alt={item.title}/>
                <span className="pth-badge">Nổi bật</span>
              </div>
              <div className="pth-card__body">
                <h3 className="pth-card__title" title={item.title}>{item.title}</h3>
                <div className="pth-card__meta">
                  <span className="price">{item.price.toLocaleString()} ₫/tháng</span>
                  <span className="dot">•</span>
                  <span>{item.area} m²</span>
                </div>
                <p className="pth-card__addr">{item.address}</p>
                <div className="pth-card__actions">
                  <Link to="/" className="pth-btn pth-btn--ghost">Chi tiết</Link>
                  <button className="pth-btn">Lưu</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===== Phòng trọ quanh các trường ===== */}
      <section className="container home-uni">
        <h2 className="home-uni__title">Phòng trọ quanh các trường</h2>
        <div className="home-uni__grid">
          {uniList.map(u => (
            <a
              key={u.id}
              href={u.more ? '/schools' : '/?q=' + encodeURIComponent(u.name)}
              className={'home-uni__item' + (u.more ? ' is-more' : '')}
            >
              <div className="home-uni__logo">
                {!u.more ? <img src={u.logo} alt={u.name}/> : <span className="home-uni__plus">+</span>}
              </div>
              <div className="home-uni__name">{u.more ? 'Xem thêm' : u.name}</div>
            </a>
          ))}
        </div>
      </section>

      {/* ===== Cẩm nang Thuê phòng (carousel) ===== */}
      <section className="container home-guide">
        <div className="home-guide__head">
          <h2>Cẩm nang Thuê phòng</h2>
          <a className="home-guide__more" href="/blog">Xem tất cả ▸</a>
        </div>

        <div className="home-guide__wrap">
          <button className="home-guide__nav is-left" onClick={()=>scrollGuide('left')} aria-label="Prev">‹</button>

          <div className="home-guide__track" ref={guideRef}>
            {blogs.map(b => (
              <article className="home-guide__card" key={b.id}>
                <div className="home-guide__media">
                  <img src={b.img} alt={b.title}/>
                  <span className="home-guide__date">03/10/2022{/* API: b.published_at */}</span>
                </div>
                <div className="home-guide__body">
                  <h3 className="home-guide__title">{b.title}</h3>
                  <p className="home-guide__excerpt">{b.excerpt}</p>
                </div>
              </article>
            ))}
          </div>

          <button className="home-guide__nav is-right" onClick={()=>scrollGuide('right')} aria-label="Next">›</button>
        </div>
      </section>

      {/* ===== Banner full-width ===== */}
      <section className="u-fullbleed pth-promo">
        <img
          src="https://picsum.photos/seed/promo/1600/360"
          alt="Ưu đãi đăng tin – banner full width"
          className="pth-promo__img"
        />
      </section>

      {/* ===== Blog mới (lưới) ===== */}
      <section className="container pth-section">
        <div className="pth-section__head">
          <h2>Blog mới</h2>
          <Link to="/blog" className="pth-link">Xem thêm</Link>
        </div>
        <div className="pth-grid pth-grid--3">
          {blogs.slice(0,3).map(b=>(
            <article key={b.id} className="pth-blog">
              <img src={b.img} alt={b.title}/>
              <div className="pth-blog__body">
                <h3 className="pth-blog__title">{b.title}</h3>
                <p className="pth-blog__excerpt">{b.excerpt}</p>
                <Link to="/blog" className="pth-link">Đọc bài</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
