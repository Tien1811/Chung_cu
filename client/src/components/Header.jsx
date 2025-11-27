// src/components/Header.jsx
import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import logo from '@/assets/images/logo.png'
import Login from '../pages/Login'
import Register from '../pages/Register'
import UserSettingsModal from '../components/UserSettingsModal' // 🔹 popup cài đặt tài khoản

export default function Header() {
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  const [showSettings, setShowSettings] = useState(false) // popup cài đặt tài khoản

  const [user, setUser] = useState(null)
  const [indicatorStyle, setIndicatorStyle] = useState({})
  const [menuOpen, setMenuOpen] = useState(false)

  const navRef = useRef(null)
  const userMenuRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  const navClass = ({ isActive }) =>
    'nav__link' + (isActive ? ' is-active' : '')

  // ------- Hiệu ứng viên thuốc nav -------
  useEffect(() => {
    const navEl = navRef.current
    if (!navEl) return

    const active = navEl.querySelector('.nav__link.is-active')
    if (!active) {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }))
      return
    }

    const navRect = navEl.getBoundingClientRect()
    const itemRect = active.getBoundingClientRect()

    const left = itemRect.left - navRect.left - 6
    const width = itemRect.width + 12

    setIndicatorStyle({
      '--nav-indicator-left': `${left}px`,
      '--nav-indicator-width': `${width}px`,
      opacity: 1,
    })
  }, [location.pathname])

  // ------- Đọc user từ localStorage + nghe auth:changed -------
  useEffect(() => {
    const loadUser = () => {
      const raw = localStorage.getItem('auth_user')
      setUser(raw ? JSON.parse(raw) : null)
    }

    loadUser()
    window.addEventListener('auth:changed', loadUser)
    return () => window.removeEventListener('auth:changed', loadUser)
  }, [])

  // ------- Đóng dropdown khi click ngoài -------
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  // ------- Logout -------
  const handleLogout = async () => {
    const token = localStorage.getItem('access_token')

    try {
      if (token) {
        await fetch('/api/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        })
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('auth_user')
      setUser(null)
      window.dispatchEvent(new Event('auth:changed'))
      setMenuOpen(false)

      if (location.pathname.startsWith('/admin')) {
        navigate('/')
      }
    }
  }

  // avatar: dùng ảnh nếu backend trả avatar_url, không thì lấy chữ cái đầu tên
  const avatarUrl = user?.avatar_url || null
  const avatarChar = user?.name?.charAt(0)?.toUpperCase() || 'U'

  return (
    <>
      <header className="site-header">
        <div className="container site-header__inner">
          <Link to="/" className="brand">
            <img src={logo} alt="Logo" />
          </Link>

          <nav className="nav" ref={navRef}>
            <span className="nav__indicator" style={indicatorStyle} />
            <NavLink to="/phong-tro" className={navClass}>Phòng trọ</NavLink>
            <NavLink to="/nha-nguyen-can" className={navClass}>Nhà nguyên căn</NavLink>
            <NavLink to="/can-ho" className={navClass}>Căn hộ</NavLink>
            <NavLink to="/ky-tuc-xa" className={navClass}>Ký túc xá</NavLink>
            <NavLink to="/reviews" className={navClass}>Review</NavLink>
            <NavLink to="/blog" className={navClass}>Blog</NavLink>
          </nav>

          <div className="site-header__actions">
            {/* CHƯA ĐĂNG NHẬP */}
            {!user && (
              <>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setShowLogin(true)}
                >
                  Đăng nhập
                </button>

                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setShowRegister(true)}
                >
                  Đăng ký
                </button>
              </>
            )}

            {/* ĐÃ ĐĂNG NHẬP */}
            {user && (
              <div
                className="header-auth-user"
                ref={userMenuRef}
              >
                {/* Avatar (nhấn để mở menu) */}
                <button
                  type="button"
                  className="header-avatar-btn"
                  onClick={() => setMenuOpen((prev) => !prev)}
                >
                  <div className="header-avatar">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={user.name} />
                    ) : (
                      avatarChar
                    )}
                  </div>
                </button>

                {/* Dropdown menu */}
                {menuOpen && (
                  <div className="header-menu">
                    <div className="header-menu__top">
                      <div className="header-menu__avatar">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={user.name} />
                        ) : (
                          avatarChar
                        )}
                      </div>
                      <div>
                        <p className="header-menu__name">{user.name}</p>
                        <p className="header-menu__role">
                          {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                        </p>
                      </div>
                    </div>

                    <div className="header-menu__list">
                      {/* ➜ Cài đặt tài khoản: tên, email, SĐT, mật khẩu, avatar */}
                      <button
                        type="button"
                        className="header-menu__item"
                        onClick={() => {
                          setShowSettings(true)
                          setMenuOpen(false)
                        }}
                      >
                        Cài đặt tài khoản
                      </button>

                      {/* Chỉ admin mới có nút vào khu quản trị */}
                      {user.role === 'admin' && (
                        <button
                          type="button"
                          className="header-menu__item"
                          onClick={() => {
                            navigate('/admin')
                            setMenuOpen(false)
                          }}
                        >
                          Khu vực quản trị
                        </button>
                      )}

                      <button
                        type="button"
                        className="header-menu__item header-menu__item--danger"
                        onClick={handleLogout}
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Popup login / register */}
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
      {showRegister && <Register onClose={() => setShowRegister(false)} />}

      {/* Popup cài đặt tài khoản */}
      {showSettings && user && (
        <UserSettingsModal
          user={user}
          onClose={() => setShowSettings(false)}
          onUpdated={(u) => {
            setUser(u)
            localStorage.setItem('auth_user', JSON.stringify(u))
            window.dispatchEvent(new Event('auth:changed'))
          }}
        />
      )}
    </>
  )
}
