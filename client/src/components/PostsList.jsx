// src/pages/PostsList.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../assets/style/pages/posts-list.css' // nếu có

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

function normalizeImageUrl(source) {
  if (!source) return ''
  if (typeof source === 'string') return source
  if (source.main_image_url) return source.main_image_url
  if (source.full_url) return source.full_url
  if (source.url) return source.url
  if (source.secure_url) return source.secure_url
  if (source.file) {
    if (source.file.url) return source.file.url
    if (source.file.secure_url) return source.file.secure_url
  }
  if (source.image_url) return source.image_url
  if (source.path) return source.path
  return ''
}

export default function PostsList() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError('')
        const res = await fetch(`${API_BASE_URL}/posts`)
        if (!res.ok) throw new Error('Không tải được danh sách bài đăng')

        const data = await res.json()
        setPosts(data.data || data)
      } catch (err) {
        setError(err.message || 'Có lỗi xảy ra')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <p>Đang tải...</p>
  if (error) return <p style={{ color: '#fecaca' }}>{error}</p>

  return (
    <main className="container container--main">
      {posts.map((post) => {
        // BACKEND đã gửi post.main_image_url rồi
        const thumb =
          post.main_image_url ||
          post.thumbnail_url ||
          normalizeImageUrl(post.thumbnail) ||
          'https://via.placeholder.com/400x240?text=No+Image'

        const priceText = post.price
          ? `${Number(post.price).toLocaleString('vi-VN')} đ/tháng`
          : 'Thỏa thuận'

        return (
          <article key={post.id} className="post-card">
            <Link to={`/posts/${post.id}`} className="post-card__thumb">
              <img src={thumb} alt={post.title} />
            </Link>

            <div className="post-card__body">
              <p className="post-card__category">
                {post.category?.name || 'Tin cho thuê'}
              </p>
              <h3 className="post-card__title">
                <Link to={`/posts/${post.id}`}>{post.title}</Link>
              </h3>
              <p className="post-card__price">{priceText}</p>
            </div>
          </article>
        )
      })}
    </main>
  )
}
