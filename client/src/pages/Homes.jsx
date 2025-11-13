import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../assets/style/style.css'

export default function Homes() {
  const nav = useNavigate()

  // ===== Form tìm kiếm nhanh =====
  const [keyword, setKeyword] = useState('')
  const [province, setProvince] = useState('')
  const [price, setPrice] = useState('')
  const [area, setArea] = useState('')

  // ===== Dữ liệu demo =====
  const [featured, setFeatured] = useState([])
  const [blogs, setBlogs] = useState([])
  const [stats] = useState({
    posts: 12500,
    landlords: 3800,
    views: 965000
  })

  // Phòng trọ quanh các trường (demo)
  const uniList_room = [
    { id: 1, name: 'Trường Đại học Kinh Tế Huế', logo: 'https://picsum.photos/seed/uni1/90/90' },
    { id: 2, name: 'Trường Đại học Sư phạm', logo: 'https://picsum.photos/seed/uni2/90/90' },
    { id: 3, name: 'Trường Đại học Khoa Học', logo: 'https://picsum.photos/seed/uni3/90/90' },
    { id: 4, name: 'Trường Đại học Y Tế Huế', logo: 'https://picsum.photos/seed/uni4/90/90' },
    { id: 5, name: 'Cao Đẳng Công Nghiệp Huế', logo: 'https://picsum.photos/seed/uni5/90/90' },
    { id: 6, name: 'xem thêm', more: true },
  ]

    // Phòng trọ quanh các trường (demo)
  const uniList_house = [
    { id: 1, name: 'bệnh viện', logo: 'https://picsum.photos/seed/uni1/90/90' },
    { id: 2, name: 'trường học', logo: 'https://picsum.photos/seed/uni2/90/90' },
    { id: 3, name: 'chợ', logo: 'https://picsum.photos/seed/uni3/90/90' },
    { id: 4, name: 'siêu thị', logo: 'https://picsum.photos/seed/uni4/90/90' },
    { id: 5, name: 'sông', logo: 'https://picsum.photos/seed/uni5/90/90' },
    { id: 6, name: 'hồ', more: true },
  ]

  
  // Carousel "Cẩm nang"
  const guideRef = useRef(null)
  const scrollGuide = (dir) => {
    const el = guideRef.current
    if (!el) return
    const delta = el.clientWidth * 0.9
    el.scrollBy({ left: dir === 'left' ? -delta : delta, behavior: 'smooth' })
  }

  useEffect(() => {
    setFeatured([
      { id: 1, title: 'Phòng studio mới, nội thất đẹp', price: 4500000, area: 28, address: 'Q.7, TP.HCM', img: 'https://picsum.photos/seed/a1/1200/800' },
      { id: 2, title: 'Nhà nguyên căn 1 trệt 1 lầu', price: 9000000, area: 70, address: 'TP. Thủ Đức', img: 'https://picsum.photos/seed/a2/1200/800' },
      { id: 3, title: 'Căn hộ mini ban công thoáng', price: 5500000, area: 32, address: 'Q.10, TP.HCM', img: 'https://picsum.photos/seed/a3/1200/800' },
      { id: 4, title: 'Ký túc xá máy lạnh – trung tâm', price: 1300000, area: 12, address: 'Q.3, TP.HCM', img: 'https://picsum.photos/seed/a4/1200/800' },
      { id: 5, title: 'Phòng trọ có gác, giờ giấc tự do', price: 2800000, area: 20, address: 'Gò Vấp, TP.HCM', img: 'https://picsum.photos/seed/a5/1200/800' },
      { id: 6, title: 'Căn hộ 1PN full nội thất', price: 8000000, area: 45, address: 'Q.2, TP.HCM', img: 'https://picsum.photos/seed/a6/1200/800' },
      { id: 7, title: 'Nhà riêng hẻm rộng, an ninh', price: 7500000, area: 60, address: 'Tân Bình, TP.HCM', img: 'https://picsum.photos/seed/a7/1200/800' },
      { id: 8, title: 'Phòng gần ĐH BK, đi bộ 5 phút', price: 2200000, area: 18, address: 'Q.10, TP.HCM', img: 'https://picsum.photos/seed/a8/1200/800' },
    ])
    setBlogs([
      { id: 101, title: 'Mẹo tìm trọ nhanh trong 24h', excerpt: '3 bước lọc và gọi chủ trọ hiệu quả…', img: 'https://picsum.photos/seed/b1/1200/800' },
      { id: 102, title: 'Checklist xem trọ an toàn', excerpt: 'Ánh sáng, an ninh, đồng hồ điện nước…', img: 'https://picsum.photos/seed/b2/1200/800' },
      { id: 103, title: 'Cách thương lượng tiền cọc', excerpt: 'Chuẩn bị giấy tờ và bằng chứng thị trường…', img: 'https://picsum.photos/seed/b3/1200/800' },
      { id: 104, title: 'Chọn khu vực phù hợp', excerpt: 'Khoảng cách – an ninh – tiện ích…', img: 'https://picsum.photos/seed/b4/1200/800' },
      { id: 105, title: 'Gợi ý nội thất tiết kiệm', excerpt: 'Bố trí gọn gàng, sáng sủa…', img: 'https://picsum.photos/seed/b5/1200/800' },
    ])
  }, [])

  const submitSearch = (e) => {
    e.preventDefault()
    const qs = new URLSearchParams()
    if (keyword) qs.set('q', keyword)
    if (province) qs.set('province', province)
    if (price) qs.set('price', price)
    if (area) qs.set('area', area)
    nav('/' + (qs.toString() ? `?${qs.toString()}` : ''))
  }

  const mainFeatured = featured[0]
  const otherFeatured = featured.slice(1)

  return (
    <div className="pthome">
      {/* ===== HERO ===== */}
      <section className="u-fullbleed homes-hero">
        <div className="container">
          <div className="homes-hero-grid">
            <div className="homes-hero-main">
              <span className="homes-hero-pill">Tìm phòng dễ – sống thoải mái</span>
              <h1>Homes – Tìm chỗ ở phù hợp với ngân sách & lối sống của bạn</h1>
              <p>
                Bộ lọc thông minh giúp bạn tìm phòng trọ, căn hộ, nhà nguyên căn, ký túc xá
                chỉ trong vài phút. Cập nhật liên tục, hình thật – thông tin rõ ràng.
              </p>

              <form className="homes-search" onSubmit={submitSearch}>
                <div className="homes-search-row">
                  <div className="homes-search-input">
                    <span className="icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Nhập khu vực, tên đường, trường học..."
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="homes-btn homes-btn--primary">
                    Tìm kiếm
                  </button>
                </div>

                <div className="homes-search-filters">
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                  >
                    <option value="">Tỉnh / thành phố</option>
                    <option value="hcm">TP. Hồ Chí Minh</option>
                    <option value="hn">Hà Nội</option>
                    <option value="hue">Thừa Thiên Huế</option>
                    <option value="dn">Đà Nẵng</option>
                  </select>

                  <select
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  >
                    <option value="">Khoảng giá</option>
                    <option value="0-2000000">&lt; 2 triệu</option>
                    <option value="2000000-5000000">2 – 5 triệu</option>
                    <option value="5000000-8000000">5 – 8 triệu</option>
                    <option value="8000000-999999999">&gt; 8 triệu</option>
                  </select>

                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  >
                    <option value="">Diện tích</option>
                    <option value="0-20">&lt; 20 m²</option>
                    <option value="20-35">20 – 35 m²</option>
                    <option value="35-60">35 – 60 m²</option>
                    <option value="60-999">Trên 60 m²</option>
                  </select>
                </div>
              </form>

              <div className="homes-hero-tags">
                <span>Gợi ý nhanh:</span>
                <button type="button">Gần trường</button>
                <button type="button">Căn hộ mini</button>
                <button type="button">Ở ghép</button>
                <button type="button">Nhà nguyên căn</button>
              </div>

              <ul className="homes-hero-stats">
                <li>
                  <strong>{stats.posts.toLocaleString('vi-VN')}</strong>
                  <span>Tin đang hiển thị</span>
                </li>
                <li>
                  <strong>{stats.landlords.toLocaleString('vi-VN')}</strong>
                  <span>Chủ trọ uy tín</span>
                </li>
                <li>
                  <strong>{stats.views.toLocaleString('vi-VN')}</strong>
                  <span>Lượt xem mỗi tháng</span>
                </li>
              </ul>
            </div>

            <div className="homes-hero-side">
              <div className="hero-card hero-card--map">
                <div className="hero-card__header">
                  <span>Bản đồ phòng trọ</span>
                  <span className="hero-status-dot">Đang hoạt động</span>
                </div>
                <div className="hero-map">
                  <div className="hero-map-pin pin-1"></div>
                  <div className="hero-map-pin pin-2"></div>
                  <div className="hero-map-pin pin-3"></div>
                  <div className="hero-map-pin pin-4"></div>
                </div>
              </div>

              <div className="hero-card hero-card--list">
                <div className="hero-list-row">
                  <div>
                    <p className="hero-list-title">Phòng trọ gần ĐH Kinh Tế</p>
                    <p className="hero-list-sub">Đi bộ 7 phút • full nội thất</p>
                  </div>
                  <span className="hero-list-price">2.8tr</span>
                </div>
                <div className="hero-list-row">
                  <div>
                    <p className="hero-list-title">Căn hộ mini Q.7</p>
                    <p className="hero-list-sub">Ban công thoáng • có thang máy</p>
                  </div>
                  <span className="hero-list-price">5.5tr</span>
                </div>
                <div className="hero-list-row">
                  <div>
                    <p className="hero-list-title">Ký túc xá máy lạnh</p>
                    <p className="hero-list-sub">Ở ghép 4 người • trung tâm</p>
                  </div>
                  <span className="hero-list-price">1.2tr</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DANH MỤC THEO LOẠI CHỖ Ở ===== */}
      <section className="container homes-categories">
        <div className="homes-section-head">
          <div>
            <h2>Khám theo loại chỗ ở</h2>
            <p>Chọn đúng loại chỗ ở để lọc kết quả phù hợp hơn.</p>
          </div>
          <Link to="/" className="homes-link">Xem tất cả loại hình</Link>
        </div>

        <div className="homes-categories__list">
          <Link to="/" className="homes-cat">
            <div className="homes-cat__thumb">
              <img src="https://picsum.photos/seed/c1/400/400" alt="Phòng trọ" />
            </div>
            <div className="homes-cat__info">
              <h3>Phòng trọ</h3>
              <p>Giá mềm, phù hợp sinh viên & người đi làm.</p>
            </div>
          </Link>

          <Link to="/can-ho" className="homes-cat">
            <div className="homes-cat__thumb">
              <img src="https://picsum.photos/seed/c2/400/400" alt="Căn hộ" />
            </div>
            <div className="homes-cat__info">
              <h3>Căn hộ</h3>
              <p>Không gian riêng, tiện nghi, an ninh tốt.</p>
            </div>
          </Link>

          <Link to="/nha-nguyen-can" className="homes-cat">
            <div className="homes-cat__thumb">
              <img src="https://picsum.photos/seed/c3/400/400" alt="Nhà nguyên căn" />
            </div>
            <div className="homes-cat__info">
              <h3>Nhà nguyên căn</h3>
              <p>Thoải mái cho gia đình hoặc nhóm bạn.</p>
            </div>
          </Link>

          <Link to="/ky-tuc-xa" className="homes-cat">
            <div className="homes-cat__thumb">
              <img src="https://picsum.photos/seed/c4/400/400" alt="Ký túc xá" />
            </div>
            <div className="homes-cat__info">
              <h3>Ký túc xá</h3>
              <p>Tiết kiệm, nhiều bạn bè, không lo cô đơn.</p>
            </div>
          </Link>
        </div>
      </section>

      {/* ===== TIN NỔI BẬT ===== */}
      <section className="container homes-featured">
        <div className="homes-section-head">
          <div>
            <h2>Tin nổi bật hôm nay</h2>
            <p>Các tin được xem nhiều, hình thật – thông tin rõ ràng.</p>
          </div>
          <Link to="/" className="homes-link">Xem tất cả tin</Link>
        </div>

        <div className="homes-featured__grid">
          {mainFeatured && (
            <article className="homes-featured__main">
              <div className="main-image">
                <img src={mainFeatured.img} alt={mainFeatured.title} />
                <span className="featured-chip">Nổi bật</span>
              </div>
              <div className="main-body">
                <h3 title={mainFeatured.title}>{mainFeatured.title}</h3>
                <div className="main-meta">
                  <span className="price">
                    {mainFeatured.price.toLocaleString('vi-VN')} ₫/tháng
                  </span>
                  <span>•</span>
                  <span>{mainFeatured.area} m²</span>
                  <span>•</span>
                  <span>{mainFeatured.address}</span>
                </div>
                <p>
                  Phòng rộng, ánh sáng tốt, nội thất cơ bản. Phù hợp bạn trẻ làm việc văn phòng
                  hoặc sinh viên muốn không gian riêng tư.
                </p>
                <div className="main-actions">
                  <Link to="/" className="homes-btn homes-btn--primary">Xem chi tiết</Link>
                  <button className="homes-btn homes-btn--ghost">Lưu tin</button>
                </div>
              </div>
            </article>
          )}

          <div className="homes-featured__list">
            {otherFeatured.map(item => (
              <article key={item.id} className="homes-featured__item">
                <div className="item-thumb">
                  <img src={item.img} alt={item.title} />
                </div>
                <div className="item-body">
                  <h4 title={item.title}>{item.title}</h4>
                  <div className="item-meta">
                    <span className="price">
                      {item.price.toLocaleString('vi-VN')} ₫/tháng
                    </span>
                    <span>•</span>
                    <span>{item.area} m²</span>
                  </div>
                  <p className="item-addr">{item.address}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PHÒNG TRỌ QUANH CÁC TRƯỜNG ===== */}
      <section className="container homes-uni">
        <div className="homes-uni__inner">
          <div className="homes-uni__intro">
            <h2>Phòng trọ quanh các trường</h2>
            <p>
              Dành riêng cho sinh viên: lọc nhanh phòng trọ theo từng trường, hạn chế di chuyển xa
              và tối ưu chi phí đi lại.
            </p>
            <ul className="homes-uni__bullet">
              <li>Khoảng cách rõ ràng, ước tính thời gian di chuyển.</li>
              <li>Ưu tiên khu vực an ninh, gần tiện ích thiết yếu.</li>
              <li>Lọc theo giá & hình thức ở (ở ghép, phòng riêng...).</li>
            </ul>
          </div>

          <div className="homes-uni__list">
            {uniList_room.map(u => (
              <a
                key={u.id}
                href={u.more ? '/schools' : '/?q=' + encodeURIComponent(u.name)}
                className={'homes-uni__item' + (u.more ? ' is-more' : '')}
              >
                <div className="homes-uni__logo">
                  {!u.more ? <img src={u.logo} alt={u.name} /> : <span className="homes-uni__plus">+</span>}
                </div>
                <div className="homes-uni__info">
                  <p className="name">{u.more ? 'Xem thêm trường khác' : u.name}</p>
                  {!u.more && <p className="desc">Nhiều phòng trọ được sinh viên đánh giá tốt.</p>}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CẨM NANG THUÊ PHÒNG (CAROUSEL) ===== */}
      <section className="container homes-guide">
        <div className="homes-section-head">
          <div>
            <h2>Cẩm nang thuê phòng</h2>
            <p>Kinh nghiệm thực tế khi đi xem trọ, thương lượng hợp đồng và dọn vào ở.</p>
          </div>
          <a className="homes-link" href="/blog">Xem tất cả bài viết</a>
        </div>

        <div className="homes-guide__wrap">
          <button className="homes-guide__nav is-left" onClick={() => scrollGuide('left')} aria-label="Prev">‹</button>

          <div className="homes-guide__track" ref={guideRef}>
            {blogs.map(b => (
              <article className="homes-guide__card" key={b.id}>
                <div className="homes-guide__media">
                  <img src={b.img} alt={b.title} />
                  <span className="homes-guide__date">03/10/2022</span>
                </div>
                <div className="homes-guide__body">
                  <h3 className="homes-guide__title">{b.title}</h3>
                  <p className="homes-guide__excerpt">{b.excerpt}</p>
                  <a href="/blog" className="homes-link">Đọc chi tiết</a>
                </div>
              </article>
            ))}
          </div>

          <button className="homes-guide__nav is-right" onClick={() => scrollGuide('right')} aria-label="Next">›</button>
        </div>
      </section>

        <section className="container homes-uni">
        <div className="homes-uni__inner">
          <div className="homes-uni__intro">
            <h2>Căn hộ gần các khu vực tiện lợi</h2>
            <p>
              Dành riêng cho gia đình hoặc cặp đôi tiện lợi đi lại
            </p>
            <ul className="homes-uni__bullet">
              <li>Khoảng cách rõ ràng, ước tính thời gian di chuyển.</li>
              <li>Ưu tiên khu vực an ninh, gần tiện ích thiết yếu.</li>
              <li>Lọc theo giá & hình thức ở (chỉ 1 hoặc nhiều phòng ngủ, diện tích).</li>
            </ul>
          </div>

          <div className="homes-uni__list">
            {uniList_house.map(u => (
              <a
                key={u.id}
                href={u.more ? '/schools' : '/?q=' + encodeURIComponent(u.name)}
                className={'homes-uni__item' + (u.more ? ' is-more' : '')}
              >
                <div className="homes-uni__logo">
                  {!u.more ? <img src={u.logo} alt={u.name} /> : <span className="homes-uni__plus">+</span>}
                </div>
                <div className="homes-uni__info">
                  <p className="name">{u.more ? 'Xem thêm trường khác' : u.name}</p>
                  {!u.more && <p className="desc">Nhiều phòng trọ được sinh viên đánh giá tốt.</p>}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BANNER ===== */}
      <section className="u-fullbleed homes-promo">
        <div className="container homes-promo__inner">
          <div className="promo-text">
            <h2>Đăng tin miễn phí cho chủ trọ mới</h2>
            <p>
              Thử Homes trong 7 ngày với ưu đãi đẩy tin miễn phí, giúp phòng trọ của bạn
              tiếp cận đúng người đang cần.
            </p>
            <button className="homes-btn homes-btn--light">Đăng tin ngay</button>
          </div>
          <div className="promo-badge">
            <span>7 ngày</span>
            <small>Ưu đãi dùng thử</small>
          </div>
        </div>
      </section>

      {/* ===== BLOG MỚI ===== */}
      <section className="container homes-blog">
        <div className="homes-section-head">
          <div>
            <h2>Blog mới</h2>
            <p>Cập nhật kiến thức & tips nhỏ giúp cuộc sống trọ dễ chịu hơn.</p>
          </div>
          <Link to="/blog" className="homes-link">Xem thêm bài viết</Link>
        </div>

        <div className="homes-blog__grid">
          {blogs.slice(0, 3).map(b => (
            <article key={b.id} className="homes-blog__item">
              <div className="thumb">
                <img src={b.img} alt={b.title} />
              </div>
              <div className="body">
                <h3>{b.title}</h3>
                <p>{b.excerpt}</p>
                <Link to="/blog" className="homes-link">Đọc bài</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
