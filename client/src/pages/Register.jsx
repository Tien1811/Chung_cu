// src/components/Register.jsx
import { useEffect, useState } from 'react'
import '../assets/style/pages/register.css'

export default function Register({ onClose }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // khóa scroll body khi mở 
  useEffect(() => {
    const old = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = old
    }
  }, [])

  const handleOverlayClick = (e) => {
    // click vùng tối bên ngoài => đóng
    if (e.target.classList.contains('register-overlay')) {
      onClose()
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const { name, email, password, password_confirmation } = form

    if (!name.trim() || !email.trim() || !password.trim() || !password_confirmation.trim()) {
      setError('Vui lòng nhập đầy đủ tất cả các trường.')
      return
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.')
      return
    }

    if (password !== password_confirmation) {
      setError('Mật khẩu nhập lại không khớp.')
      return
    }

    try {
      setLoading(true)

      // Gửi đúng cấu trúc theo bảng users (name, email, password, password_confirmation)
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const text = await res.text()
      let data = null
      try {
        data = JSON.parse(text)
      } catch {
        data = null
      }

      if (!res.ok) {
        throw new Error(data?.message || 'Đăng ký thất bại, vui lòng kiểm tra lại.')
      }

      setSuccess('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.')
      // Đăng ký xong đóng popup sau 1s
      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-overlay" onClick={handleOverlayClick}>
      <div className="register-overlay__inner">
        <section className="register-card">
          {/* nút X */}
          <button
            type="button"
            className="register-close"
            onClick={onClose}
          >
            x
          </button>

          <h2 className="register-title">Tạo tài khoản</h2>
          <p className="register-sub">
            Đăng ký để lưu phòng yêu thích, xem lịch sử và viết đánh giá phòng trọ.
          </p>

          <form className="reg-form" onSubmit={handleSubmit}>
            <label className="reg-field">
              <input
                type="text"
                name="name"
                placeholder=" "
                value={form.name}
                onChange={handleChange}
              />
              <span>Họ và tên</span>
            </label>

            <label className="reg-field">
              <input
                type="email"
                name="email"
                placeholder=" "
                value={form.email}
                onChange={handleChange}
              />
              <span>Email</span>
            </label>

            <label className="reg-field">
              <input
                type="password"
                name="password"
                placeholder=" "
                value={form.password}
                onChange={handleChange}
              />
              <span>Mật khẩu</span>
            </label>

            <label className="reg-field">
              <input
                type="password"
                name="password_confirmation"
                placeholder=" "
                value={form.password_confirmation}
                onChange={handleChange}
              />
              <span>Nhập lại mật khẩu</span>
            </label>

            {error && <p className="reg-error">{error}</p>}
            {success && <p className="reg-success">{success}</p>}

            <button
              type="submit"
              className="reg-submit"
              disabled={loading}
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          <p className="reg-bottom">
            Đã có tài khoản?{' '}
            <button
              type="button"
              className="reg-link"
              onClick={onClose}  /* nếu muốn, sau này bạn có thể gọi thêm mở LoginModal tại đây */
            >
              Đăng nhập
            </button>
          </p>
        </section>
      </div>
    </div>
  )
}
