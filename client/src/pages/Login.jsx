// src/components/Login.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../assets/style/pages/login.css'

export default function Login({ onClose }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Khóa scroll body khi mở 
  useEffect(() => {
    const old = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = old
    }
  }, [])

  const handleOverlayClick = (e) => {
    // click vùng tối bên ngoài => đóng
    if (e.target.classList.contains('login-overlay')) {
      onClose()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.')
      return
    }

    try {
      setLoading(true)

      // TODO: thay bằng API login thật
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const text = await res.text()
      let data = null
      try {
        data = JSON.parse(text)
      } catch {
        data = null
      }

      if (!res.ok) {
        throw new Error(data?.message || 'Đăng nhập thất bại, vui lòng kiểm tra lại.')
      }

      console.log('Login success:', data)
      // TODO: lưu token / user nếu cần

      onClose() // đăng nhập xong đóng popup
    } catch (err) {
      console.error(err)
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-overlay" onClick={handleOverlayClick}>
      <div className="login-overlay__inner">
        <section className="login-card">
          {/* nút X */}
          <button
            type="button"
            className="login-close"
            onClick={onClose}
          >
            x
          </button>

          <h2>Đăng nhập</h2>
          <p className="login-sub">
            Truy cập nhanh vào phòng đã lưu, lịch sử xem và đánh giá của bạn.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <input
                type="email"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <span>Email</span>
            </label>

            <label className="login-field">
              <input
                type="password"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span>Mật khẩu</span>
            </label>

            <div className="login-row">
              <label className="login-remember">
                <input type="checkbox" />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <button
                type="button"
                className="login-link"
                onClick={() => alert('Trang quên mật khẩu chưa làm 😆')}
              >
                Quên mật khẩu?
              </button>
            </div>

            {error && <p className="login-error">{error}</p>}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="login-bottom">
            Chưa có tài khoản?{' '}
            <Link
              to="/register"
              className="login-link"
              onClick={onClose}
            >
              Đăng ký ngay
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}
