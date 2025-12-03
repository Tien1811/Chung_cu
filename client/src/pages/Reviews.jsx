// src/pages/Reviews.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import '../assets/style/pages/review.css'

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  const [summary, setSummary] = useState({
    avg: 0,
    total: 0,
    counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  })

  const [meta, setMeta] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 12,
    total: 0,
  })

  useEffect(() => {
    fetchReviews(1, false)
  }, [])

  async function fetchReviews(page = 1, append = false) {
    try {
      if (page === 1) setLoading(true)
      else setLoadingMore(true)
      setError('')

      console.log('CALL /reviews page=', page)

      const res = await axios.get(`${API_BASE_URL}/reviews`, {
        params: { page, per_page: 12 },
      })

      console.log('REVIEWS RESPONSE =', res.data)

      const r = res.data || {}

      if (r.status === false) {
        throw new Error(r.message || 'Không lấy được đánh giá')
      }

      const list =
        r.data || r.reviews || (Array.isArray(r) ? r : [])

      if (append) {
        setReviews(prev => [...prev, ...list])
      } else {
        setReviews(list)
      }

      setSummary({
        avg: r.average_rating ?? 0,
        total: r.total_reviews ?? (list.length || 0),
        counts: r.ratings_count || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      })

      const m = r.meta || {}
      setMeta({
        currentPage: m.current_page ?? 1,
        lastPage: m.last_page ?? 1,
        perPage: m.per_page ?? 12,
        total: m.total ?? (list.length || 0),
      })
    } catch (err) {
      console.error('REVIEWS ERROR =', err)
      setError(
        err.response?.data?.message ||
          err.message ||
          'Có lỗi xảy ra khi tải dữ liệu'
      )
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const hasMore = meta.currentPage < meta.lastPage

  const renderStars = value => {
    const full = Math.round(Number(value) || 0)
    return (
      <span className="rv-stars">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={i < full ? 'is-on' : ''}>
            ★
          </span>
        ))}
      </span>
    )
  }

  if (loading && !reviews.length && !error) {
    return (
      <main className="container container--main rv-page">
        <p>Đang tải dữ liệu...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container container--main rv-page">
        <p className="rv-error">{error}</p>
      </main>
    )
  }

  const avg = summary.avg || 0
  const total = summary.total || 0
  const counts = summary.counts || {}

  return (
    <main className="container container--main rv-page">
      <header className="rv-header">
        <div>
          <p className="rv-breadcrumb">
            <Link to="/" className="rv-link">
              Trang chủ
            </Link>
            <span> / Review</span>
          </p>
          <h1 className="rv-title">Đánh giá &amp; trải nghiệm của khách hàng</h1>
          <p className="rv-post-title">
            Tổng hợp đánh giá từ tất cả các bài đăng trên hệ thống.
          </p>
        </div>
      </header>

      <section className="rv-layout">
           {/* DANH SÁCH REVIEW */}
          <div className="rv-list">
            {reviews.length === 0 && (
              <p className="rv-empty">
                Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ trải nghiệm
                của bạn!
              </p>
            )}

{reviews.map(r => {
  const avatarUrl =
    r.user?.avatar_url || r.user?.avatar || null

  return (
    <article key={r.id} className="rv-item">
      <header className="rv-item-head">
        <div className="rv-item-user">
          <div className="rv-avatar">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={r.user?.name || 'Avatar'}
              />
            ) : (
              (r.user?.name || 'U')
                .charAt(0)
                .toUpperCase()
            )}
          </div>

          <div className="rv-item-user-info">
            {/* Hàng trên: tên + sao */}
            <div className="rv-item-user-top">
              <p className="rv-item-name">
                {r.user?.name || 'Người dùng ẩn danh'}
              </p>
              <div className="rv-item-rating-inline">
                {renderStars(r.rating)}
                <span className="rv-item-rating-number">
                  {r.rating}/5
                </span>
              </div>
            </div>

            {/* Hàng dưới: thời gian + bài đăng */}
            <p className="rv-item-time">
              {new Date(
                r.created_at || Date.now()
              ).toLocaleString('vi-VN')}
            </p>
            {r.post && (
              <p className="rv-item-post">
                Cho bài đăng{' '}
                <Link
                  className="rv-link"
                  to={`/posts/${r.post_id}`}
                >
                  {r.post.title}
                </Link>
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Nội dung đánh giá riêng ở dưới */}
      <p className="rv-item-content">{r.content}</p>
    </article>
  )
})}



            {hasMore && (
              <div className="rv-load-more">
                <button
                  type="button"
                  className="rv-load-more-btn"
                  disabled={loadingMore}
                  onClick={() =>
                    fetchReviews(meta.currentPage + 1, true)
                  }
                >
                  {loadingMore
                    ? 'Đang tải thêm...'
                    : 'Xem thêm đánh giá'}
                </button>
              </div>
            )}
          </div>
          {/* CARD TỔNG KẾT */}
          <div className="rv-summary-card">
            <div className="rv-summary-main">
              <div className="rv-summary-number">
                <span>{avg.toFixed(1)}</span>
                {renderStars(avg)}
                <p>{total} đánh giá</p>
              </div>

              <div className="rv-summary-bars">
                {[5, 4, 3, 2, 1].map(star => {
                  const count =
                    counts[star] ?? counts[String(star)] ?? 0
                  const percent = total ? (count / total) * 100 : 0
                  return (
                    <div className="rv-bar-row" key={star}>
                      <span className="rv-bar-label">{star}★</span>
                      <div className="rv-bar-track">
                        <div
                          className="rv-bar-fill"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="rv-bar-count">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <p className="rv-summary-note">
              Chỉ những khách đã từng thuê phòng mới có thể để lại đánh giá. Điều
              này giúp bạn có cái nhìn thực tế và đáng tin cậy hơn.
            </p>
          </div>

       
       
      </section>
    </main>
  )
}
