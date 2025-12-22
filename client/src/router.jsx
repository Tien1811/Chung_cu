import { createBrowserRouter, Outlet, Link } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import ChatBot from './components/Chatbot.jsx'

// Public pages
import Rooms from '@/pages/Rooms.jsx'
import Houses from '@/pages/Houses.jsx'
import Apartments from '@/pages/Apartments.jsx'
import Dorms from '@/pages/Dorms.jsx'
import Reviews from '@/pages/Reviews.jsx'
import Blog from '@/pages/Blog.jsx'
import BlogDetail from '@/pages/BlogDetail.jsx'
import ErrorBoundary from '@/components/ErrorBoundary.jsx'
import Homes from '@/pages/Homes.jsx'
import PostDetail from '@/pages/postDetail.jsx'
import ForgotPassword from '@/pages/ForgotPassword.jsx'
import ResetPassword from '@/pages/ResetPassword.jsx'
import Wishlist from '@/pages/Wishlist.jsx'

// Admin
import AdminLayout from './components/AdminLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminPosts from './pages/admin/AdminPosts.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import AdminReviews from './pages/admin/AdminReviews.jsx'
import AdminCategories from './pages/admin/AdminCategories.jsx'
import AdminAmenities from './pages/admin/AdminAmenities.jsx'
import AdminEnvironmentFeatures from './pages/admin/AdminEnvironmentFeatures.jsx'
import AdminLocations from './pages/admin/AdminLocations.jsx'
import AdminSavedPosts from './pages/admin/AdminSavedPosts.jsx'
import AdminPostCreate from './pages/admin/AdminPostCreate.jsx'
import AdminPostEdit from './pages/admin/AdminPostEdit.jsx'
import AdminBlogList from './pages/admin/AdminBlogList'
import AdminBlogCreate from './pages/admin/AdminBlogCreate'
import AdminBlogEdit from './pages/admin/AdminBlogEdit'

// Lessor
import LessorLayout from './pages/lessor/LessorLayout.jsx'
import LessorDashboard from './pages/lessor/LessorDashboard.jsx'
import LessorPosts from './pages/lessor/LessorPosts.jsx'
import LessorPostCreate from './pages/lessor/LessorPostCreate.jsx'
import LessorPostEdit from './pages/lessor/LessorPostEdit.jsx'
import LessorReviews from './pages/lessor/LessorReviews.jsx'
import LessorCategories from './pages/lessor/LessorCategories.jsx'
import LessorAmenities from './pages/lessor/LessorAmenities.jsx'
import LessorAppointments from './pages/lessor/LessorAppointments.jsx'

// ================= LAYOUT =================
function Layout() {
  return (
    <div className="app">
      <Header />
      <main className="container container--main">
        <Outlet />
      </main>
      <Footer />
      <ChatBot />
    </div>
  )
}

// ================= ROUTER =================
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,

    // 🔥 CÁI MÀY THIẾU → FIX UNEXPECTED APPLICATION ERROR
    errorElement: (
      <div style={{ padding: 40 }}>
        <h2>Ứng dụng gặp lỗi</h2>
        <p>Route không tồn tại hoặc dữ liệu bị lỗi.</p>
        <a href="/">← Về trang chủ</a>
      </div>
    ),

    children: [
      { index: '/', element: <Homes /> },

      { path: '/phong-tro', element: <Rooms /> },
      { path: '/nha-nguyen-can', element: <Houses /> },
      { path: '/can-ho', element: <Apartments /> },
      { path: '/ky-tuc-xa', element: <Dorms /> },
      { path: '/reviews', element: <Reviews /> },

      // BLOG
      { path: '/blog', element: <Blog /> },
      { path: '/blog/:slug', element: (
        <ErrorBoundary>
          <BlogDetail />
        </ErrorBoundary>
      ) },


      { path: '/wishlist', element: <Wishlist /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/reset-password', element: <ResetPassword /> },
      { path: '/post/:id', element: <PostDetail /> },

      // 404 UI (không phải error runtime)
      {
        path: '*',
        element: (
          <div style={{ padding: 40 }}>
            <h2>404</h2>
            <p>Trang không tồn tại.</p>
            <Link to="/">← Về trang chủ</Link>
          </div>
        ),
      },
    ],
  },

  // ================= ADMIN =================
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'posts', element: <AdminPosts /> },
      { path: 'posts/create', element: <AdminPostCreate /> },
      { path: 'posts/:id/edit', element: <AdminPostEdit /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'categories', element: <AdminCategories /> },
      { path: 'amenities', element: <AdminAmenities /> },
      { path: 'environment-features', element: <AdminEnvironmentFeatures /> },
      { path: 'locations', element: <AdminLocations /> },
      { path: 'reviews', element: <AdminReviews /> },
      { path: 'saved-posts', element: <AdminSavedPosts /> },
      { path: 'blog-list', element: <AdminBlogList /> },
      { path: 'blog-list/create', element: <AdminBlogCreate /> },
      { path: 'blogs/:id/edit', element: <AdminBlogEdit /> },
    ],
  },

  // ================= LESSOR =================
  {
    path: '/lessor',
    element: <LessorLayout />,
    children: [
      { index: true, element: <LessorDashboard /> },
      { path: 'posts', element: <LessorPosts /> },
      { path: 'posts/create', element: <LessorPostCreate /> },
      { path: 'posts/:id/edit', element: <LessorPostEdit /> },
      { path: 'reviews', element: <LessorReviews /> },
      { path: 'appointments', element: <LessorAppointments /> },
      { path: 'categories', element: <LessorCategories /> },
      { path: 'amenities', element: <LessorAmenities /> },
    ],
  },
])
