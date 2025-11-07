// src/router.jsx
import { createBrowserRouter, Outlet } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Rooms from './pages/Rooms.jsx'
import Houses from './pages/Houses.jsx'
import Apartments from './pages/Apartments.jsx'
import Dorms from './pages/Dorms.jsx'
import Reviews from './pages/Reviews.jsx'
import Blog from './pages/Blog.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import AdminPost from './pages/AdminPost.jsx'
import Homes from './pages/Homes.jsx'

function Layout(){
  return (
    <div className="app">
      <Header />
      <main className="container container--main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Homes/> },
      { path: '/phong-tro', element: <Rooms/> },
      { path: '/nha-nguyen-can', element: <Houses/> },
      { path: '/can-ho', element: <Apartments/> },
      { path: '/ky-tuc-xa', element: <Dorms/> },
      { path: '/reviews', element: <Reviews/> },
      { path: '/blog', element: <Blog/> },
      { path: '/login', element: <Login/> },
      { path: '/register', element: <Register/> },
      { path: '/admin/dang-bai', element: <AdminPost/> },
    ]
  }
])
