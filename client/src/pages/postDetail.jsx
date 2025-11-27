// src/pages/PostDetail.jsx
import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import '../assets/style/pages/post-detail.css'

export default function PostDetail() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // state cho form đánh giá
  const [ratingInput, setRatingInput] = useState(5)
  const [contentInput, setContentInput] = useState('')
  const [imageFiles, setImageFiles] = useState([])
  const [reviewError, setReviewError] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError('')

        const res = await fetch(`/api/posts/${id}`)

        if (!res.ok) throw new Error('Không tải được thông tin bài đăng.')

        const data = await res.json()
        setPost(data.data || data)
      } catch (err) {
        console.error(err)
        setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  // ====== một số dữ liệu hiển thị mềm dẻo ======
  const mainImage = useMemo(() => {
    if (!post) return ''
    if (post.cover_image) return post.cover_image
    if (post.images && post.images.length > 0) return post.images[0].url
    return 'https://via.placeholder.com/1200x600?text=Apartment'
  }, [post])

  const locationText = useMemo(() => {
    if (!post) return ''
    const parts = [
      post.address,
      post.ward?.name,
      post.district?.name,
      post.province?.name,
    ].filter(Boolean)
    return parts.join(', ')
  }, [post])

  const categoryName = post?.category?.name || 'Tin cho thuê'

  const priceText = post?.price
    ? `${Number(post.price).toLocaleString('vi-VN')} đ/tháng`
    : 'Thỏa thuận'

  const areaText = post?.area ? `${post.area} m²` : ''

  const createdAtText = post?.created_at
    ? new Date(post.created_at).toLocaleString('vi-VN')
    : ''

  const ratingList = post?.reviews || []
  const ratingCount = ratingList.length || post?.reviews_count || 0
  const ratingAvg =
    ratingList.length
      ? ratingList.reduce((sum, r) => sum + (r.rating || 0), 0) /
        ratingList.length
      : post?.reviews_avg || 0

  const amenities = post?.amenities || []
  const envFeatures = post?.environment_features || []

  // chỉ hiển thị tối đa 3 đánh giá gần nhất
  const recentReviews = ratingList.slice(0, 3)

  const renderStars = (value) => {
    const full = Math.round(value || 0)
    return (
      <span className="pd-stars">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={i < full ? 'is-on' : ''}>★</span>
        ))}
      </span>
    )
  }

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 3) {
      alert('Bạn chỉ được chọn tối đa 3 ảnh.')
    }
    setImageFiles(files.slice(0, 3))
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setReviewError('')

    const token = localStorage.getItem('access_token')
    if (!token) {
      alert('Bạn cần đăng nhập để gửi đánh giá.')
      return
    }

    if (!ratingInput || ratingInput < 1 || ratingInput > 5) {
      setReviewError('Vui lòng chọn số sao (1–5).')
      return
    }
    if (!contentInput.trim()) {
      setReviewError('Vui lòng nhập nội dung bình luận.')
      return
    }

    try {
      setSubmittingReview(true)

      const formData = new FormData()
      formData.append('rating', ratingInput)
      formData.append('content', contentInput.trim())
      imageFiles.forEach((file) => {
        formData.append('images[]', file)
      })

      const res = await fetch(`/api/posts/${id}/reviews`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch {
        console.error('RESP TEXT:', text)
        throw new Error('Máy chủ trả về dữ liệu không hợp lệ.')
      }

      if (!res.ok || data.status === false) {
        throw new Error(data.message || 'Không gửi được đánh giá.')
      }

      const newReview = data.data || data.review || data

      setPost((prev) => {
        if (!prev) return prev
        const oldReviews = prev.reviews || []
        const newReviews = [newReview, ...oldReviews]
        return {
          ...prev,
          reviews: newReviews,
          reviews_count: (prev.reviews_count || oldReviews.length) + 1,
        }
      })

      setRatingInput(5)
      setContentInput('')
      setImageFiles([])
    } catch (err) {
      console.error(err)
      setReviewError(err.message || 'Có lỗi khi gửi đánh giá.')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <main className="container container--main pd-page">
        <p>Đang tải dữ liệu phòng...</p>
      </main>
    )
  }

  if (error || !post) {
    return (
      <main className="container container--main pd-page">
        <p className="pd-error">{error || 'Không tìm thấy bài đăng.'}</p>
        <Link to="/" className="pd-link-back">← Quay về trang chủ</Link>
      </main>
    )
  }

  return (
    <main className="container container--main pd-page">
      {/* HERO ẢNH LỚN */}
      <section className="pd-hero">
        <img src={mainImage} alt={post.title} className="pd-hero__img" />
        <div className="pd-hero__overlay" />
        <div className="pd-hero__content">
          <p className="pd-hero__topline">
            {categoryName}
            {post.status === 'published' && (
              <span className="pd-badge">Đang cho thuê</span>
            )}
          </p>
          <h1 className="pd-hero__title">{post.title}</h1>

          <div className="pd-hero__meta">
            <span className="pd-hero__price">{priceText}</span>
            {areaText && <span className="pd-dot">•</span>}
            {areaText && <span>{areaText}</span>}
            {locationText && (
              <>
                <span className="pd-dot">•</span>
                <span>{locationText}</span>
              </>
            )}
          </div>

          <div className="pd-hero__bottom">
            <div className="pd-rating">
              {ratingCount > 0 ? (
                <>
                  {renderStars(ratingAvg)}
                  <span className="pd-rating__number">
                    {ratingAvg.toFixed(1)}/5
                  </span>
                  <span className="pd-rating__count">
                    ({ratingCount} đánh giá)
                  </span>
                  <Link
                    to={`/posts/${post.id}/reviews`}
                    className="pd-link"
                  >
                    Xem chi tiết đánh giá
                  </Link>
                </>
              ) : (
                <span className="pd-rating__empty">
                  Chưa có đánh giá nào
                </span>
              )}
            </div>
            <p className="pd-hero__time">Đăng lúc: {createdAtText}</p>
          </div>
        </div>
      </section>

      {/* LAYOUT 2 CỘT: THÔNG TIN + LIÊN HỆ */}
      <section className="pd-layout">
        {/* CỘT TRÁI: THÔNG TIN CHÍNH */}
        <div className="pd-main">
          {/* GALERY NHỎ */}
          {post.images && post.images.length > 1 && (
            <div className="pd-gallery">
              {post.images.slice(0, 4).map((img) => (
                <button
                  key={img.id}
                  type="button"
                  className="pd-gallery__item"
                  onClick={() => {
                    setPost((prev) => ({
                      ...prev,
                      cover_image: img.url,
                    }))
                  }}
                >
                  <img src={img.url} alt={post.title} />
                </button>
              ))}
            </div>
          )}

          {/* THÔNG TIN CHI TIẾT */}
          <article className="pd-card">
            <h2 className="pd-card__title">Thông tin chi tiết</h2>
            <dl className="pd-info-grid">
              <div>
                <dt>Giá thuê</dt>
                <dd>{priceText}</dd>
              </div>
              <div>
                <dt>Diện tích</dt>
                <dd>{areaText || '—'}</dd>
              </div>
              <div>
                <dt>Loại tin</dt>
                <dd>{categoryName}</dd>
              </div>
              <div>
                <dt>Người đăng</dt>
                <dd>{post.user?.name || '—'}</dd>
              </div>
              <div className="pd-info-wide">
                <dt>Địa chỉ</dt>
                <dd>{locationText || '—'}</dd>
              </div>
            </dl>
          </article>

          {/* MÔ TẢ */}
          {post.content && (
            <article className="pd-card">
              <h2 className="pd-card__title">Mô tả chi tiết</h2>
              <div className="pd-content">{post.content}</div>
            </article>
          )}

          {/* TIỆN ÍCH */}
          {amenities.length > 0 && (
            <article className="pd-card">
              <h2 className="pd-card__title">Tiện ích trong phòng / căn hộ</h2>
              <div className="pd-tags">
                {amenities.map((a) => (
                  <span key={a.id} className="pd-tag">
                    {a.name}
                  </span>
                ))}
              </div>
            </article>
          )}

          {/* MÔI TRƯỜNG XUNG QUANH */}
          {envFeatures.length > 0 && (
            <article className="pd-card">
              <h2 className="pd-card__title">Môi trường xung quanh</h2>
              <ul className="pd-env">
                {envFeatures.map((e) => (
                  <li key={e.id}>{e.name}</li>
                ))}
              </ul>
            </article>
          )}
        </div>

        {/* CỘT PHẢI: LIÊN HỆ + LƯU Ý */}
        <aside className="pd-aside">
          <section className="pd-card pd-contact">
            <h2 className="pd-card__title">Liên hệ đặt phòng</h2>

            <div className="pd-host">
              <div className="pd-host__avatar">
                {(post.user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="pd-host__name">
                  {post.user?.name || 'Chủ nhà'}
                </p>
                {post.user?.email && (
                  <p className="pd-host__meta">{post.user.email}</p>
                )}
              </div>
            </div>

            <button type="button" className="pd-btn pd-btn--primary">
              Gọi điện cho chủ nhà
            </button>
            <button type="button" className="pd-btn pd-btn--ghost">
              Nhắn tin (Zalo / Messenger)
            </button>

            <p className="pd-contact__note">
              Vui lòng nói rõ bạn xem tin trên hệ thống để được ưu tiên hỗ trợ.
            </p>
          </section>

          <section className="pd-card pd-sidebox">
            <h3 className="pd-card__subtitle">Lưu ý khi đi xem phòng</h3>
            <ul className="pd-tips">
              <li>Không chuyển cọc nếu chưa xem phòng trực tiếp.</li>
              <li>
                Kiểm tra hợp đồng rõ ràng về giá, thời hạn và chi phí phát sinh.
              </li>
              <li>
                Chụp ảnh tình trạng phòng trước khi nhận để tránh tranh chấp.
              </li>
            </ul>
          </section>
        </aside>
      </section>

      {/* ====== ĐÁNH GIÁ & BÌNH LUẬN - FULL WIDTH BÊN DƯỚI ====== */}
      <section className="pd-reviews-section">
        <article className="pd-card pd-reviews pd-reviews--full">
          <h2 className="pd-card__title">Đánh giá & bình luận</h2>

          {/* TÓM TẮT + XEM THÊM */}
          <div className="pd-reviews__summary">
            <div>
              {ratingCount > 0 ? (
                <>
                  {renderStars(ratingAvg)}
                  <span className="pd-rating__number">
                    {ratingAvg.toFixed(1)}/5
                  </span>
                  <span className="pd-rating__count">
                    ({ratingCount} đánh giá)
                  </span>
                </>
              ) : (
                <span className="pd-rating__empty">
                  Chưa có đánh giá nào, hãy là người đầu tiên.
                </span>
              )}
            </div>

            {ratingCount > 3 && (
              <Link
                to={`/posts/${post.id}/reviews`}
                className="pd-reviews__more"
              >
                Xem tất cả {ratingCount} đánh giá →
              </Link>
            )}
          </div>

          {/* LIST 3 ĐÁNH GIÁ GẦN NHẤT */}
          {recentReviews.length > 0 && (
            <div className="pd-reviews__list">
              {recentReviews.map((rv) => (
                <div key={rv.id} className="pd-review-item">
                  <div className="pd-review-item__head">
                    <div className="pd-review-item__avatar">
                      {(rv.user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="pd-review-item__name">
                        {rv.user?.name || 'Người dùng'}
                      </p>
                      <div className="pd-review-item__meta">
                        {renderStars(rv.rating)}
                        {rv.created_at && (
                          <span>
                            {new Date(rv.created_at).toLocaleString('vi-VN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {rv.content && (
                    <p className="pd-review-item__content">{rv.content}</p>
                  )}

                  {rv.images && rv.images.length > 0 && (
                    <div className="pd-review-item__images">
                      {rv.images.slice(0, 3).map((img) => (
                        <img
                          key={img.id || img.url}
                          src={img.url}
                          alt="review"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* FORM GỬI ĐÁNH GIÁ */}
          <form className="pd-review-form" onSubmit={handleSubmitReview}>
            <h3 className="pd-card__subtitle">Viết đánh giá của bạn</h3>

            <div className="pd-review-form__row">
              <label>Đánh giá sao</label>
              <div className="pd-review-stars-input">
                {Array.from({ length: 5 }, (_, i) => {
                  const starVal = i + 1
                  return (
                    <button
                      key={starVal}
                      type="button"
                      className={
                        'pd-star-btn' +
                        (starVal <= ratingInput ? ' is-on' : '')
                      }
                      onClick={() => setRatingInput(starVal)}
                    >
                      ★
                    </button>
                  )
                })}
                <span className="pd-review-stars-input__text">
                  {ratingInput} / 5
                </span>
              </div>
            </div>

            <div className="pd-review-form__row">
              <label>Nội dung bình luận</label>
              <textarea
                rows="4"
                value={contentInput}
                onChange={(e) => setContentInput(e.target.value)}
                placeholder="Chia sẻ trải nghiệm thật của bạn về phòng này..."
              />
            </div>

            <div className="pd-review-form__row">
              <label>Ảnh (tối đa 3 ảnh)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
              />
              {imageFiles.length > 0 && (
                <ul className="pd-review-form__files">
                  {imageFiles.map((f, idx) => (
                    <li key={idx}>{f.name}</li>
                  ))}
                </ul>
              )}
            </div>

            {reviewError && (
              <p className="pd-error" style={{ marginTop: 4 }}>
                {reviewError}
              </p>
            )}

            <button
              type="submit"
              className="pd-btn pd-btn--primary"
              disabled={submittingReview}
            >
              {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </form>
        </article>
      </section>
    </main>
  )
}
