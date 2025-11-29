// src/components/UserSettingsModal.jsx
import { useEffect, useState } from 'react'

export default function UserSettingsModal({ user, onClose, onUpdated }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    current_password: '',            // mật khẩu hiện tại
    new_password: '',                // mật khẩu mới
    new_password_confirmation: '',   // nhập lại mật khẩu mới
  })

  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // khoá scroll body khi mở
  useEffect(() => {
    const old = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = old
    }
  }, [])

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('settings-overlay')) {
      onClose()
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Nếu user muốn đổi mật khẩu
    const wantChangePassword =
      form.current_password || form.new_password || form.new_password_confirmation

    if (wantChangePassword) {
      if (!form.current_password) {
        setError('Vui lòng nhập mật khẩu hiện tại.')
        return
      }
      if (!form.new_password || form.new_password.length < 6) {
        setError('Mật khẩu mới phải có ít nhất 6 ký tự.')
        return
      }
      if (form.new_password !== form.new_password_confirmation) {
        setError('Mật khẩu xác nhận không khớp.')
        return
      }
    }

    try {
      setLoading(true)

      const token = localStorage.getItem('access_token')
      if (!token) throw new Error('Bạn chưa đăng nhập.')

      const authHeaders = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      }
      const jsonHeaders = {
        ...authHeaders,
        'Content-Type': 'application/json',
      }

      let updatedUser = user

      /** 1. Cập nhật thông tin cơ bản: name, email, phone_number */
      const resProfile = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: jsonHeaders,
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone_number: form.phone_number,
        }),
      })

      const textProfile = await resProfile.text()
      let dataProfile
      try {
        dataProfile = JSON.parse(textProfile)
      } catch {
        throw new Error('Máy chủ (profile) trả về dữ liệu không hợp lệ.')
      }

      if (!resProfile.ok || dataProfile.status === false) {
        if (resProfile.status === 422 && dataProfile.errors) {
          const firstError =
            Object.values(dataProfile.errors)[0]?.[0] ||
            'Lỗi xác thực dữ liệu khi cập nhật thông tin.'
          throw new Error(firstError)
        }
        throw new Error(dataProfile.message || 'Cập nhật thông tin thất bại.')
      }

      const userFromProfile = dataProfile.data || dataProfile.user || updatedUser
      updatedUser = { ...updatedUser, ...userFromProfile }

      /** 2. Nếu có chọn avatar thì gọi API upload avatar riêng */
      if (avatarFile) {
        const formData = new FormData()
        formData.append('avatar', avatarFile)

        const resAvatar = await fetch('/api/user/profile/avatar', {
          method: 'POST',
          headers: authHeaders,
          body: formData,
        })

        const textAvatar = await resAvatar.text()
        let dataAvatar
        try {
          dataAvatar = JSON.parse(textAvatar)
        } catch {
          throw new Error('Máy chủ (avatar) trả về dữ liệu không hợp lệ.')
        }

        if (!resAvatar.ok || dataAvatar.status === false) {
          if (resAvatar.status === 422 && dataAvatar.errors) {
            const firstError =
              Object.values(dataAvatar.errors)[0]?.[0] ||
              'Lỗi xác thực dữ liệu khi cập nhật avatar.'
            throw new Error(firstError)
          }
          throw new Error(dataAvatar.message || 'Cập nhật avatar thất bại.')
        }
        const userFromAvatar =
          dataAvatar.user || dataAvatar.data || updatedUser

        updatedUser = { ...updatedUser, ...userFromAvatar }
        setAvatarPreview(userFromAvatar.avatar_url || avatarPreview)

        const avatarUrl =
          dataAvatar.avatar_url ||
          dataAvatar.data?.avatar_url ||
          updatedUser.avatar_url

        updatedUser = { ...updatedUser, avatar_url: avatarUrl }
      }

      /** 3. Nếu có nhập mật khẩu → gọi API đổi mật khẩu */
      if (wantChangePassword) {
        const resPwd = await fetch('/api/user/change-password', {
          method: 'PUT',
          headers: jsonHeaders,
          body: JSON.stringify({
            current_password: form.current_password,
            new_password: form.new_password,
            new_password_confirmation: form.new_password_confirmation,
          }),
        })

        const textPwd = await resPwd.text()
        let dataPwd
        try {
          dataPwd = JSON.parse(textPwd)
        } catch {
          throw new Error('Máy chủ (password) trả về dữ liệu không hợp lệ.')
        }

        if (!resPwd.ok || dataPwd.status === false) {
          if (resPwd.status === 422 && dataPwd.errors) {
            const firstError =
              Object.values(dataPwd.errors)[0]?.[0] ||
              'Lỗi xác thực dữ liệu khi đổi mật khẩu.'
            throw new Error(firstError)
          }
          throw new Error(
            dataPwd.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.'
          )
        }
      }

      setSuccess('Cập nhật tài khoản thành công.')
      onUpdated(updatedUser)

      setTimeout(() => {
        onClose()
      }, 800)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="settings-overlay" onClick={handleOverlayClick}>
      <div className="settings-overlay__inner">
        <section className="settings-card">
          {/* nút X */}
          <button
            type="button"
            className="settings-close"
            onClick={onClose}
          >
            ×
          </button>

          <h2 className="settings-title">Cài đặt tài khoản</h2>
          <p className="settings-sub">
            Bạn có thể đổi thông tin cá nhân, mật khẩu và ảnh đại diện tại đây.
          </p>

          <form className="settings-form" onSubmit={handleSubmit}>
            {/* Avatar */}
            <div className="settings-avatar-block">
              <div className="settings-avatar-preview">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" />
                ) : (
                  <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                )}
              </div>
              <label className="settings-avatar-btn">
                Đổi ảnh đại diện
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Tên */}
            <label className="settings-field">
              <span>Họ và tên</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </label>

            {/* Email */}
            <label className="settings-field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </label>

            {/* Số điện thoại */}
            <label className="settings-field">
              <span>Số điện thoại</span>
              <input
                type="text"
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
              />
            </label>

            {/* Nhóm mật khẩu */}
            <div className="settings-field-group">
              <label className="settings-field">
                <span>Mật khẩu hiện tại</span>
                <input
                  type="password"
                  name="current_password"
                  value={form.current_password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu hiện tại nếu muốn đổi"
                />
              </label>

              <label className="settings-field">
                <span>Mật khẩu mới (tuỳ chọn)</span>
                <input
                  type="password"
                  name="new_password"
                  value={form.new_password}
                  onChange={handleChange}
                  placeholder="Để trống nếu không đổi"
                />
              </label>

              <label className="settings-field">
                <span>Nhập lại mật khẩu mới</span>
                <input
                  type="password"
                  name="new_password_confirmation"
                  value={form.new_password_confirmation}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu mới"
                />
              </label>
            </div>

            {error && <p className="settings-error">{error}</p>}
            {success && <p className="settings-success">{success}</p>}

            <div className="settings-actions">
              <button
                type="button"
                className="settings-btn settings-btn--ghost"
                onClick={onClose}
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="settings-btn settings-btn--primary"
                disabled={loading}
              >
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
