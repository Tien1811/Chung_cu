import { Link, NavLink } from 'react-router-dom';
import logo from '@/assets/images/logo.png';

export default function Header(){
  const navClass = ({isActive}) => "nav__link" + (isActive ? " is-active" : "")
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="brand"><img src={logo} alt="Logo" /></Link>
        <nav className="nav">
           
          <NavLink to="/phong-tro" className={navClass}>Phòng trọ</NavLink>
          <NavLink to="/nha-nguyen-can" className={navClass}>Nhà nguyên căn</NavLink>
          <NavLink to="/can-ho" className={navClass}>Căn hộ</NavLink>
          <NavLink to="/ky-tuc-xa" className={navClass}>Ký túc xá</NavLink>
          <NavLink to="/reviews" className={navClass}>Review</NavLink>
          <NavLink to="/blog" className={navClass}>Blog</NavLink>
        </nav>
        <div className="site-header__actions">
          <NavLink to="/login" className="btn btn--ghost">Đăng nhập</NavLink>
          <NavLink to="/register" className="btn btn--dark">Đăng ký</NavLink>
        </div>
      </div>
    </header>
  )
}
