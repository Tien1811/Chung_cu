// src/pages/PostReviewsPage.jsx
import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import '../assets/style/pages/review.css'

export default function PostReviewsPage() {
  const { id: postId } = useParams() // route: /posts/:id/reviews
  const [post, setPost] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // form state
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  // ==== load post + reviews ====
  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError('')

        const [postRes, reviewsRes] = await Promise.all([
          fetch(`/api/posts/${postId}`),
          fetch(`/api/posts/${postId}/reviews`),
        ])

        if (!postRes.ok) throw new Error('Không tải được bài đăng')
        if (!reviewsRes.ok) throw new Error('Không tải được đánh giá')

        const postData = await postRes.json()
        const reviewsData = await reviewsRes.json()

        setPost(postData.data || postData)        // tùy cấu trúc API
        setReviews(reviewsData.data || reviewsData)
      } catch (err) {
        console.error(err)
        setError(err.message || 'Có lỗi xảy ra')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [postId])

  // ==== tính tổng quan rating ====
  const summary = useMemo(() => {
    if (!reviews.length) {
      return {
        avg: 0,
        total: 0,
        counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      }
    }

    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    let sum = 0
    reviews.forEach((r) => {
      const rt = Number(r.rating) || 0
      if (rt >= 1 && rt <= 5) {
        counts[rt]++
        sum += rt
      }
    })
    const total = reviews.length
    const avg = total ? sum / total : 0
    return { avg, total, counts }
  }, [reviews])

  const renderStars = (value) => {
    const full = Math.round(value)
    return (
      <span className="rv-stars">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={i < full ? 'is-on' : ''}>★</span>
        ))}
      </span>
    )
  }

  // ==== submit review ====
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    if (!content.trim()) {
      setFormError('Vui lòng nhập nội dung cảm nhận.')
      return
    }

    try {
      setSubmitting(true)

      const res = await fetch(`/api/posts/${postId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization: `Bearer ${token}` // nếu dùng Sanctum/JWT thì thêm
        },
        body: JSON.stringify({
          rating,
          content,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Không gửi được đánh giá')
      }

      const newReview = await res.json()

    
      setReviews((prev) => [newReview.data || newReview, ...prev])
      setContent('')
      setRating(5)
      setFormSuccess('Cảm ơn bạn đã đánh giá!')
    } catch (err) {
      console.error(err)
      setFormError(err.message || 'Có lỗi xảy ra khi gửi đánh giá')
    } finally {
      setSubmitting(false)
    }
  }

  // hiển thị
  if (loading) {
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

  return (
    <main className="container container--main rv-page">
      {/* header bài đăng */}
      <header className="rv-header">
        <div>
          <p className="rv-breadcrumb">
            <Link to="/" className="rv-link">Trang chủ</Link>
            <span> / </span>
            <Link to={`/posts/${postId}`} className="rv-link">Chi tiết phòng</Link>
            <span> / Đánh giá</span>
          </p>
          <h1 className="rv-title">
            Đánh giá &amp; trải nghiệm
          </h1>
          {post && (
            <p className="rv-post-title">
              Cho bài đăng: <span>{post.title}</span>
            </p>
          )}
        </div>
      </header>

      <section className="rv-layout">
        {/* trái: tổng quan + danh sách */}
        <div className="rv-main">
          <div className="rv-summary-card">
            <div className="rv-summary-main">
              <div className="rv-summary-number">
                <span>{summary.avg.toFixed(1)}</span>
                {renderStars(summary.avg)}
                <p>{summary.total} đánh giá</p>
              </div>

              <div className="rv-summary-bars">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = summary.counts[star] || 0
                  const percent = summary.total
                    ? (count / summary.total) * 100
                    : 0
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
              Chỉ những khách đã từng thuê phòng mới có thể để lại đánh giá. Điều này
              giúp bạn có cái nhìn thực tế và đáng tin cậy hơn.
            </p>
          </div>

          {/* danh sách review */}
          <div className="rv-list">
            {reviews.length === 0 && (
              <p className="rv-empty">
                Chưa có đánh giá nào cho bài đăng này. Hãy là người đầu tiên chia sẻ
                trải nghiệm của bạn!
              </p>
            )}

            {reviews.map((r) => (
              <article key={r.id} className="rv-item">
                <header className="rv-item-head">
                  <div className="rv-item-user">
                    <div className="rv-avatar">
                      {(r.user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="rv-item-name">
                        {r.user?.name || 'Người dùng ẩn danh'}
                      </p>
                      <p className="rv-item-time">
                        {new Date(r.created_at || Date.now()).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className="rv-item-rating">
                    {renderStars(r.rating)}
                    <span className="rv-item-rating-number">{r.rating}/5</span>
                  </div>
                </header>
                <p className="rv-item-content">{r.content}</p>
              </article>
            ))}
          </div>
        </div>

        {/* phải: form gửi đánh giá */}
        <aside className="rv-aside">
          <form className="rv-form" onSubmit={handleSubmit}>
            <h2>Gửi đánh giá của bạn</h2>

            <label className="rv-field">
              <span>Chọn số sao</span>
              <div className="rv-rating-chooser">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={
                      'rv-rating-chooser__btn' +
                      (star <= rating ? ' is-on' : '')
                    }
                    onClick={() => setRating(star)}
                  >
                    ★
                  </button>
                ))}
                <span className="rv-rating-chooser__text">
                  {rating} / 5
                </span>
              </div>
            </label>

            <label className="rv-field">
              <span>Chia sẻ cảm nhận của bạn</span>
              <textarea
                rows="5"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Phòng có tiện nghi không, khu vực an ninh thế nào, chủ nhà thân thiện chứ..."
              />
            </label>

            {formError && <p className="rv-form-error">{formError}</p>}
            {formSuccess && <p className="rv-form-success">{formSuccess}</p>}

            <button type="submit" className="rv-submit-btn" disabled={submitting}>
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
            <p className="rv-form-hint">
              Bằng việc gửi đánh giá, bạn đồng ý với quy định cộng đồng và điều khoản
              sử dụng của hệ thống.
            </p>
          </form>
        </aside>
      </section>
    </main>
  )
}
