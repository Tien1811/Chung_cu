// src/pages/ForgotPassword.jsx
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../assets/style/pages/login.css' // nếu bạn dùng chung file css đăng nhập

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const location = useLocation()
  const navigate = useNavigate()

  // Trang trước khi login (truyền từ Login.jsx khi bấm "Quên mật khẩu?")
  const from = location.state?.from || '/'

  // Khóa scroll khi mở trang quên mật khẩu
  useEffect(() => {
    const old = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = old
    }
  }, [])

  // Bấm nút X -> quay về trang trước khi login
  const handleClose = () => {
    navigate(from, { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError('Vui lòng nhập email.')
      return
    }

    try {
      setLoading(true)

      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const text = await res.text()
      let data = null
      try {
        data = JSON.parse(text)
      } catch {
        data = null
      }

      if (!res.ok || data?.status === false) {
        if (res.status === 422 && data?.errors) {
          const firstError =
            Object.values(data.errors)[0]?.[0] ||
            'Lỗi xác thực dữ liệu.'
          throw new Error(firstError)
        }
        throw new Error(
          data?.message ||
            'Không thể gửi mã OTP, vui lòng thử lại.'
        )
      }

      setSuccess(
        data?.message ||
          'Mã OTP đã được gửi đến email của bạn (hết hạn sau 15 phút).'
      )

      // ✅ Sau khi gửi OTP thành công, chuyển sang trang nhập OTP + mật khẩu mới
      setTimeout(() => {
        // gửi kèm email qua query để ResetPassword.jsx tự điền
        navigate(
          `/reset-password?email=${encodeURIComponent(email)}`,
          { replace: true }
        )
      }, 1500)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-overlay">
      <div className="forgot-overlay__inner">
        <section className="auth-card forgot-card">
          {/* nút X để đóng trang quên mật khẩu */}
          <button
            type="button"
            className="forgot-close"
            onClick={handleClose}
          >
            ×
          </button>

          <h1 className="auth-title">Quên mật khẩu</h1>
          <p className="auth-subtitle">
            Nhập email bạn đã dùng để đăng ký tài khoản. Hệ thống sẽ gửi mã OTP 6 số vào email của bạn để đặt lại mật khẩu.
          </p>

          <form onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                placeholder="nhapemail@vidu.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            {error && <p className="auth-error">{error}</p>}
            {success && <p className="auth-success">{success}</p>}

            <button
              type="submit"
              className="auth-btn auth-btn--primary"
              disabled={loading}
            >
              {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
