// src/pages/admin/AdminLayout.jsx
import { NavLink, Outlet, Link } from 'react-router-dom'
import '@/assets/style/pages/admin.css'

export default function AdminLayout() {
  const navClass = ({ isActive }) =>
    'admin-menu__link' + (isActive ? ' is-active' : '')

  return (
    <div className="admin-shell">
      {/* ========== SIDEBAR TRÁI ========== */}
      <aside className="admin-sidebar">
        {/* logo + tên khu vực admin */}
        <div className="admin-sidebar__brand">
          <div className="admin-logo-circle">A</div>
          <div>
            <h1>Admin panel</h1>
            <p>Apartments &amp; Condominiums</p>
          </div>
        </div>

        {/* nhóm 1: Chung cư / Phòng trọ */}
        <div className="admin-sidebar__group">
          <p className="admin-menu__title">Chung cư / Phòng trọ</p>

          <NavLink end to="/admin" className={navClass}>
            Tổng quan
          </NavLink>

          <NavLink to="/admin/posts" className={navClass}>
            Bài đăng (posts)
          </NavLink>

          <NavLink to="/admin/users" className={navClass}>
            Người dùng (users)
          </NavLink>

          <NavLink to="/admin/reviews" className={navClass}>
            Đánh giá (reviews)
          </NavLink>
        </div>

        {/* nhóm 2: danh mục hệ thống */}
        <div className="admin-sidebar__group">
          <p className="admin-menu__title">Danh mục hệ thống</p>

          <NavLink to="/admin/categories" className={navClass}>
            Danh mục (categories)
          </NavLink>

          <NavLink to="/admin/amenities" className={navClass}>
            Tiện ích (amenities)
          </NavLink>

          <NavLink
            to="/admin/environment-features"
            className={navClass}
          >
            Môi trường xung quanh
          </NavLink>

          <NavLink to="/admin/locations" className={navClass}>
            Địa lý (provinces / districts / wards)
          </NavLink>

          <NavLink to="/admin/saved-posts" className={navClass}>
            Bài đã lưu (saved_posts)
          </NavLink>
        </div>

        {/* dưới cùng: back + info nhỏ */}
        <div className="admin-sidebar__bottom">
          <Link to="/" className="admin-menu__back">
            ← Về trang người dùng
          </Link>
          <p className="admin-sidebar__meta">
            © 2025 · Admin · A&amp;C
          </p>
        </div>
      </aside>

      {/* ========== MAIN PHẢI ========== */}
      <section className="admin-main">
        {/* thanh top nhỏ cho khu admin, có thể dùng cho thông tin user / nút logout sau này */}
        <header className="admin-main__topbar">
          <div>
            <h2>Khu vực quản trị</h2>
            <p>Quản lý chung cư, phòng trọ và các danh mục hệ thống.</p>
          </div>
         
        </header>

        {/* TẤT CẢ CÁC TRANG: AdminDashboard, AdminPosts... sẽ hiển thị ở đây */}
        <Outlet />
      </section>
    </div>
  )
}
