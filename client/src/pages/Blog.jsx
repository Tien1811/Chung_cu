// src/pages/BlogPage.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../assets/style/pages/blog.css'

const MOCK_BLOGS = [
  {
    id: 1,
    title: 'Kinh nghiệm thực tế khi đi xem trọ lần đầu',
    category: 'Kinh nghiệm thuê trọ',
    image:
      'https://images.pexels.com/photos/462235/pexels-photo-462235.jpeg?auto=compress&cs=tinysrgb&w=1200',
    created_at: '2024-09-03',
    author: 'Apartments Team',
    read_time: '6 phút đọc',
    excerpt:
      'Chuẩn bị những gì trước khi đi xem phòng, nên hỏi chủ nhà câu gì, nhận diện phòng trọ “có vấn đề”...',
  },
  {
    id: 2,
    title: 'Chọn khu vực phù hợp với sinh viên',
    category: 'Gợi ý khu vực',
    image:
      'https://images.pexels.com/photos/167404/pexels-photo-167404.jpeg?auto=compress&cs=tinysrgb&w=1200',
    created_at: '2024-08-21',
    author: 'Apartments Team',
    read_time: '5 phút đọc',
    excerpt:
      'Khoảng cách tới trường, an ninh, tiền ăn ở, chi phí đi lại… Cách cân bằng để chọn khu vực hợp lý.',
  },
  {
    id: 3,
    title: 'Mẹo tiết kiệm chi phí điện nước khi ở trọ',
    category: 'Mẹo tiết kiệm',
    image:
      'https://images.pexels.com/photos/5720565/pexels-photo-5720565.jpeg?auto=compress&cs=tinysrgb&w=1200',
    created_at: '2024-07-10',
    author: 'Apartments Team',
    read_time: '4 phút đọc',
    excerpt:
      'Một vài thói quen nhỏ mỗi ngày giúp bạn giảm đáng kể tiền điện nước mà vẫn sinh hoạt thoải mái.',
  },
  {
    id: 4,
    title: 'Checklist đồ dùng cần có khi chuyển vào phòng trọ mới',
    category: 'Checklist',
    image:
      'https://images.pexels.com/photos/7464661/pexels-photo-7464661.jpeg?auto=compress&cs=tinysrgb&w=1200',
    created_at: '2024-06-01',
    author: 'Apartments Team',
    read_time: '7 phút đọc',
    excerpt:
      'Từ đồ bếp, vệ sinh, điện tử tới giấy tờ quan trọng – checklist giúp bạn không bỏ sót món nào.',
  },
]

export default function BlogPage() {
  const [blogs, setBlogs] = useState(MOCK_BLOGS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  // Nếu sau này có API thật thì thay vào đây
  useEffect(() => {
    // ví dụ:
    // const API_BASE = 'http://127.0.0.1:8000'
    // fetch(`${API_BASE}/api/blogs`) ...
  }, [])

  const categories = ['Kinh nghiệm thuê trọ', 'Gợi ý khu vực', 'Mẹo tiết kiệm', 'Checklist']

  const filtered = blogs.filter((b) => {
    const matchCat = category ? b.category === category : true
    const matchSearch = search
      ? b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.excerpt.toLowerCase().includes(search.toLowerCase())
      : true
    return matchCat && matchSearch
  })

  return (
    <main className="container container--main blog-page">
      <header className="blog-header">
        <div>
            
          <h1 className="blog-title">Cẩm nang thuê trọ &amp; ở chung cư</h1>
          <p className="blog-subtitle">
            Tổng hợp kinh nghiệm thực tế dựa trên hàng nghìn bài đăng, đánh giá &amp; khu vực trong hệ
            thống.
          </p>
        </div>
      </header>

      <section className="blog-layout">
        {/* Cột trái: danh sách bài viết */}
        <div className="blog-main">
          {loading && <p>Đang tải bài viết...</p>}
          {error && <p className="blog-error">{error}</p>}

          {!loading && !error && (
            <>
              {filtered.length === 0 && (
                <p className="blog-empty">
                  Không tìm thấy bài viết phù hợp. Thử đổi từ khóa hoặc danh mục khác nhé.
                </p>
              )}

              <div className="blog-grid">
                {filtered.map((b) => (
                  <article key={b.id} className="blog-card">
                    <div className="blog-card__media">
                      <img src={b.image} alt={b.title} />
                      <span className="blog-card__date">
                        {new Date(b.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="blog-card__body">
                      <span className="blog-card__cat">{b.category}</span>
                      <h2 className="blog-card__title">
                        {/* sau này dùng /blog/:id hoặc :slug */}
                        <Link to={`/blog/${b.id}`}>{b.title}</Link>
                      </h2>
                      <p className="blog-card__meta">
                        Bởi <strong>{b.author}</strong> · {b.read_time}
                      </p>
                      <p className="blog-card__excerpt">{b.excerpt}</p>
                      <Link to={`/blog/${b.id}`} className="blog-card__more">
                        Đọc chi tiết
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Cột phải: bộ lọc + bài nổi bật */}
        <aside className="blog-aside">
          <div className="blog-widget">
            <h3>Bộ lọc nhanh</h3>
            <label className="blog-field">
              <span>Tìm theo từ khóa</span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ví dụ: xem trọ lần đầu..."
              />
            </label>

            <label className="blog-field">
              <span>Danh mục</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Tất cả</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="blog-widget">
            <h3>Bài viết nổi bật</h3>
            <ul className="blog-hotlist">
              {MOCK_BLOGS.slice(0, 3).map((b) => (
                <li key={b.id}>
                  <Link to={`/blog/${b.id}`}>
                    <span className="blog-hotlist__title">{b.title}</span>
                    <span className="blog-hotlist__meta">
                      {new Date(b.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="blog-widget blog-widget--note">
            <h3>Dựa trên dữ liệu thực</h3>
            <p>
              Các bài viết được đề xuất từ dữ liệu <strong>posts</strong>,{' '}
              <strong>reviews</strong>, khu vực (<strong>provinces, districts, wards</strong>) để
              giúp bạn chọn nơi ở phù hợp hơn.
            </p>
          </div>
        </aside>
      </section>
    </main>
  )
}
