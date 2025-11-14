// src/components/Header.jsx
import { useState, useEffect, useRef} from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import logo from '@/assets/images/logo.png'
import Login from '../pages/Login'   // 💡 THÊM COMPONENT NÀY (bước 2)
import Register from '../pages/Register'

export default function Header() {
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  const navRef = useRef(null)
  const location = useLocation()
  const [indicatorStyle, setIndicatorStyle] = useState({})

  const navClass = ({ isActive }) =>
    'nav__link' + (isActive ? ' is-active' : '')

//cập nhật vị trí của hiệu ứng viên thuốc
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
//----//

  return (
    <>
      <header className="site-header">
        <div className="container site-header__inner">
          <Link to="/" className="brand">
            <img src={logo} alt="Logo" />
          </Link>

          <nav className="nav" ref={navRef}>
            {/* hiệu ứng viên thuốc */}
            <span
              className="nav__indicator"
              style={indicatorStyle}
            />
            <NavLink to="/phong-tro" className={navClass}>Phòng trọ</NavLink>
            <NavLink to="/nha-nguyen-can" className={navClass}>Nhà nguyên căn</NavLink>
            <NavLink to="/can-ho" className={navClass}>Căn hộ</NavLink>
            <NavLink to="/ky-tuc-xa" className={navClass}>Ký túc xá</NavLink>
            <NavLink to="/reviews" className={navClass}>Review</NavLink>
            <NavLink to="/blog" className={navClass}>Blog</NavLink>
          </nav>

          <div className="site-header__actions">
            {/* Đăng nhập: mở popup, KHÔNG chuyển trang */}
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setShowLogin(true)}
            >
              Đăng nhập
            </button>

             {/* Đăng ký: mở popup, KHÔNG chuyển trang */}
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setShowRegister(true)}
            >
              Đăng ký
            </button>
          </div>
        </div>
      </header>

      {/* Popup login nổi giữa màn hình */}
      {showLogin && (
        <Login onClose={() => setShowLogin(false)} />
      )}
        {showRegister && (
        <Register onClose={() => setShowRegister(false)} />
      )}
      
    </>
  )
}
