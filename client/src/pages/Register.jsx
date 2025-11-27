// src/components/Register.jsx
import { useEffect, useState } from 'react'
import '../assets/style/pages/register.css'

export default function Register({ onClose }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone_number: '',           // 💡 THÊM: đúng với backend
    password: '',
    password_confirmation: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Khóa scroll body khi mở popup
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

    const {
      name,
      email,
      phone_number,
      password,
      password_confirmation,
    } = form

    // ===== VALIDATE TRƯỚC 1 LẦN Ở FE =====
    if (
      !name.trim() ||
      !email.trim() ||
      !phone_number.trim() ||
      !password.trim() ||
      !password_confirmation.trim()
    ) {
      setError('Vui lòng nhập đầy đủ tất cả các trường.')
      return
    }

    if (!/^0[0-9]{9}$/.test(phone_number)) {
      setError('Số điện thoại phải có 10 số và bắt đầu bằng 0 (vd: 0901234567).')
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

      /**
       * GỌI API:
       *  POST /api/register  -> AuthController@register
       *
       * Body gửi lên:
       *  { name, email, phone_number, password, password_confirmation }
       *
       * Response thành công:
       *  {
       *    status: true,
       *    message: "Đăng ký thành công",
       *    access_token: "...",
       *    token_type: "Bearer",
       *    user: { ... }
       *  }
       *
       * Lỗi validate (422):
       *  { status: false, message: "Lỗi xác thực dữ liệu", errors: { field: [...] } }
       */
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(form),
      })

      const text = await res.text()
      let data = null
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error('Máy chủ trả về dữ liệu không hợp lệ.')
      }

      if (!res.ok || data.status === false) {
        // Nếu là lỗi validate 422 -> show lỗi đầu tiên
        if (res.status === 422 && data.errors) {
          const firstError =
            Object.values(data.errors)[0]?.[0] || 'Lỗi xác thực dữ liệu'
          throw new Error(firstError)
        }

        throw new Error(data.message || 'Đăng ký thất bại, vui lòng kiểm tra lại.')
      }

      // === ĐĂNG KÝ THÀNH CÔNG ===
      setSuccess('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.')

      // (tuỳ bạn) Nếu muốn auto đăng nhập luôn thì có thể lưu token:
      // localStorage.setItem('access_token', data.access_token)
      // localStorage.setItem('auth_user', JSON.stringify(data.user))

      // Đóng popup sau 1s
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
            Đăng ký để tham gia cùng APARTMENTS AND CONDOMINIUMS lựa chọn cho
            mình nơi ở an toàn, phù hợp nhé!
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

            {/* 💡 THÊM TRƯỜNG SĐT KHỚP phone_number CỦA BACKEND */}
            <label className="reg-field">
              <input
                type="text"
                name="phone_number"
                placeholder=" "
                value={form.phone_number}
                onChange={handleChange}
              />
              <span>Số điện thoại</span>
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
              onClick={onClose} // sau này bạn có thể đóng + mở LoginModal luôn
            >
              Đăng nhập
            </button>
          </p>
        </section>
      </div>
    </div>
  )
}
