// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import "@/assets/style/pages/admin.css"

const API_BASE_URL =
  (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000") + "/api"

// ================== SAFE JSON ==================
async function safeJson(res) {
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

// ================== FIX AVATAR FUNCTION ==================
function getAvatar(user) {
  return (
    user?.avatar_url ||
    user?.avatar ||
    user?.profile?.avatar_url ||
    "../src/assets/images/default-avatar.png"
  )
}

function normalizeErrorMessage(err) {
  const msg = String(err?.message || err)
  if (msg.includes("Unexpected token") && msg.includes("<")) {
    return "API trả HTML 404/500 — không parse JSON được."
  }
  return msg
}

export default function AdminDashboard() {
  const token = localStorage.getItem("access_token")

  const [adminUser, setAdminUser] = useState(null)
  const avatarUrl = getAvatar(adminUser)

  const [stats, setStats] = useState({
    total_posts: 0,
    total_users: 0,
    total_reviews: 0,
    total_saved: 0,
  })
  const [selectedRequest, setSelectedRequest] = useState(null)

  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])

  const [status, setStatus] = useState("all")
  const [categoryId, setCategoryId] = useState("")
  const [q, setQ] = useState("")
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [lessorRequests, setLessorRequests] = useState([])
  const [lessorLoading, setLessorLoading] = useState(false)
  const [lessorError, setLessorError] = useState("")

  const [menuOpen, setMenuOpen] = useState(false)

  // ================== LOAD ADMIN USER ==================
  useEffect(() => {
    ; (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        const data = await safeJson(res)
        if (res.ok) setAdminUser(data?.data || data)

      } catch (err) {
        console.log("Không load được admin user")
      }
    })()
  }, [token])

  // ================== LOAD STATS ==================
  useEffect(() => {
    ; (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = await safeJson(res)
        if (res.ok) setStats({ ...stats, ...(data?.data || data) })

      } catch (err) {
        console.error("Lỗi stats:", err)
      }
    })()
  }, [token])

  // ================== LOAD CATEGORIES ==================
  useEffect(() => {
    ; (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/categories`)
        const data = await safeJson(res)
        if (res.ok) setCategories(data?.data || data)

      } catch {
        console.error("Lỗi categories")
      }
    })()
  }, [])

  // ================== LOAD POSTS ==================
  useEffect(() => {
    ; (async () => {
      try {
        setLoading(true)
        setError("")

        const params = new URLSearchParams()
        if (status !== "all") params.set("status", status)
        if (categoryId) params.set("category_id", categoryId)
        if (q.trim()) params.set("q", q.trim())
        params.set("page", page)

        const res = await fetch(`${API_BASE_URL}/admin/posts?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = await safeJson(res)
        if (!res.ok) throw new Error(data?.message)

        setPosts(data?.data || [])
        setLastPage(data?.meta?.last_page || 1)

      } catch (err) {
        setError(normalizeErrorMessage(err))
      } finally {
        setLoading(false)
      }
    })()
  }, [status, categoryId, q, page, token])

  // ================== LOAD LESSOR REQUESTS ==================
  useEffect(() => {
    ; (async () => {
      try {
        setLessorLoading(true)

        const res = await fetch(`${API_BASE_URL}/admin/lessor-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = await safeJson(res)
        if (!res.ok) throw new Error(data?.message)

        setLessorRequests(data?.data || data)

      } catch (err) {
        setLessorError(normalizeErrorMessage(err))
      } finally {
        setLessorLoading(false)
      }
    })()
  }, [token])

  // ================== POST ACTION ==================
  const handleToggleStatus = async (postId, currentStatus) => {
    const next = currentStatus === "published" ? "hidden" : "published"
    if (!confirm(`Chuyển sang ${next}?`)) return

    try {
      const res = await fetch(`${API_BASE_URL}/admin/posts/${postId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: next }),
      })

      const data = await safeJson(res)
      if (!res.ok) throw new Error(data?.message)

      setPosts(prev =>
        prev.map(p =>
          p.id === postId ? { ...p, status: next } : p
        )
      )

    } catch (err) {
      alert(err.message)
    }
  }

  const handleApprovePost = async (postId) => {
    if (!confirm("Duyệt bài?")) return

    try {
      const res = await fetch(`${API_BASE_URL}/admin/posts/${postId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "published" }),
      })

      const data = await safeJson(res)
      if (!res.ok) throw new Error(data?.message)

      setPosts(prev =>
        prev.map(p =>
          p.id === postId ? { ...p, status: "published" } : p
        )
      )

    } catch (err) {
      alert(err.message)
    }
  }

  const handleDeletePost = async (postId) => {
    if (!confirm("Xoá bài?")) return

    try {
      const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await safeJson(res)
      if (!res.ok) throw new Error(data?.message)

      setPosts(prev => prev.filter(p => p.id !== postId))

    } catch (err) {
      alert(err.message)
    }
  }

  // ================== LESSOR REQUEST ACTION ==================
  const handleLessorAction = async (id, action) => {
    let url = `${API_BASE_URL}/admin/lessor-requests/${id}/${action}`;
    let method = "POST";
    if (action === "delete") method = "DELETE";

    if (!confirm("Chắc chắn?")) return;

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || "Lỗi không xác định");

      // ==========================
      // 🔥 FIX QUAN TRỌNG NHẤT
      // Xoá yêu cầu khỏi danh sách ngay lập tức
      // ==========================
      setLessorRequests(prev =>
        prev.filter(r => r.id !== id)
      );

      // 🔥 Tự đóng modal
      setSelectedRequest(null);

    } catch (err) {
      alert(err.message);
    }
  };


  const resetFilters = () => {
    setStatus("all")
    setCategoryId("")
    setQ("")
    setPage(1)
  }

  // ======================================================
  // ===================== RETURN UI ======================
  // ======================================================

  return (
    <div className="admin-page">

      {/* ================= MOBILE TOPBAR ================= */}
      <div className="admin-mobile-topbar">
        <div className="admin-mobile-avatar">
          <img className="avatar-big" src={avatarUrl} alt="" />
        </div>

        <div className="admin-mobile-menu-btn" onClick={() => setMenuOpen(true)}>
          <svg width="26" height="26" stroke="#fff" strokeWidth="2">
            <path d="M3 6h20M3 13h20M3 20h20" />
          </svg>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      <div className={`admin-mobile-menu ${menuOpen ? "is-open" : ""}`}>
        <div className="admin-mobile-menu-close" onClick={() => setMenuOpen(false)}>
          ×
        </div>

        <div className="admin-mobile-userbox">
          <img className="avatar-big" src={avatarUrl} />
          <p className="name">{adminUser?.name || "Admin"}</p>
          <p className="email">{adminUser?.email}</p>
        </div>

        <a href="/admin" className="admin-menu__link">Dashboard</a>
        <a href="/admin/posts" className="admin-menu__link">Bài đăng</a>
        <a href="/admin/users" className="admin-menu__link">Người dùng</a>
        <a href="/admin/lessor" className="admin-menu__link">Yêu cầu Lessor</a>
        <a href="/" className="admin-menu__link">Trang chủ</a>
      </div>

      {/* ================= DESKTOP HEADER ================= */}
      <header className="admin-header">
        <div>
          <h1>Bảng điều khiển</h1>
          <p>Quản lý toàn bộ hệ thống.</p>
        </div>

        <div className="admin-header__actions">
          <Link to="/admin/posts/create" className="admin-btn admin-btn--primary">
            + Đăng bài mới
          </Link>
        </div>
      </header>

      {/* ================= STATS ================= */}
      <section className="admin-stats">
        <div className="admin-stat">
          <p className="admin-stat__label">Tổng bài đăng</p>
          <p className="admin-stat__value">{stats.total_posts}</p>
        </div>

        <div className="admin-stat">
          <p className="admin-stat__label">Người dùng</p>
          <p className="admin-stat__value">{stats.total_users}</p>
        </div>

        <div className="admin-stat">
          <p className="admin-stat__label">Đánh giá</p>
          <p className="admin-stat__value">{stats.total_reviews}</p>
        </div>

        <div className="admin-stat">
          <p className="admin-stat__label">Bài đã lưu</p>
          <p className="admin-stat__value">{stats.total_saved}</p>
        </div>
      </section>

      {/* ================= POSTS TABLE ================= */}
      <section className="admin-section">
        <div className="admin-section__head">
          <h2>Danh sách bài đăng</h2>

          <div className="admin-filters">
            <input
              className="admin-input"
              placeholder="Tìm theo tiêu đề…"
              value={q}
              onChange={e => {
                setQ(e.target.value)
                setPage(1)
              }}
            />

            <select
              className="admin-input"
              value={categoryId}
              onChange={e => {
                setCategoryId(e.target.value)
                setPage(1)
              }}
            >
              <option value="">Tất cả loại phòng</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="admin-input"
              value={status}
              onChange={e => {
                setStatus(e.target.value)
                setPage(1)
              }}
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ duyệt</option>
              <option value="published">Hiển thị</option>
              <option value="hidden">Ẩn</option>
            </select>

            <button className="admin-btn admin-btn--ghost" onClick={resetFilters}>
              Xoá lọc
            </button>
          </div>
        </div>

        {error && <p className="admin-error">{error}</p>}
        {loading && <p className="admin-loading">Đang tải…</p>}

        {!loading && !error && (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tiêu đề</th>
                    <th>Giá / Diện tích</th>
                    <th>Địa chỉ</th>
                    <th>Loại</th>
                    <th>Chủ phòng</th>
                    <th>Trạng thái</th>
                    <th>Ngày đăng</th>
                    <th>Hành động</th>
                  </tr>
                </thead>

                <tbody>
                  {posts.length === 0 && (
                    <tr>
                      <td colSpan="9" className="admin-empty">
                        Không có bài đăng.
                      </td>
                    </tr>
                  )}

                  {posts.map(post => (
                    <tr key={post.id}>
                      <td>#{post.id}</td>

                      <td className="admin-td-title">
                        <Link className="admin-link" to={`/post/${post.id}`} target="_blank">
                          {post.title}
                        </Link>
                      </td>

                      <td>
                        {post.price?.toLocaleString("vi-VN")} ₫
                        <div className="admin-td-sub">{post.area} m²</div>
                      </td>

                      <td>
                        {post.address}
                        <div className="admin-td-sub">
                          {post.ward?.name}, {post.district?.name}, {post.province?.name}
                        </div>
                      </td>

                      <td>{post.category?.name}</td>

                      <td>
                        {post.user?.name}
                        <div className="admin-td-sub">{post.user?.email}</div>
                      </td>

                      <td>
                        <span className={`admin-badge admin-badge--${post.status}`}>
                          {post.status}
                        </span>
                      </td>

                      <td>
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>

                      <td className="admin-td-actions" >
                        {post.status === "pending" ? (
                          <>
                            <button
                              className="admin-link"
                              onClick={() => handleApprovePost(post.id)}
                            >
                              Duyệt
                            </button>

                            <button
                              className="admin-link admin-link--danger"
                              onClick={() => handleDeletePost(post.id)}
                            >
                              Xoá
                            </button>
                          </>
                        ) : (
                          <>
                            <Link className="admin-link" to={`/admin/posts/${post.id}/edit`}>
                              Sửa
                            </Link>

                            <button
                              className="admin-link admin-link--danger"
                              onClick={() => handleToggleStatus(post.id, post.status)}
                            >
                              {post.status === "published" ? "Ẩn" : "Hiển thị"}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-paging">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                ‹ Trước
              </button>
              <span>
                Trang {page} / {lastPage}
              </span>
              <button disabled={page >= lastPage} onClick={() => setPage(p => p + 1)}>
                Sau ›
              </button>
            </div>
          </>
        )}
      </section>

      {/* ================= LESSOR REQUESTS ================= */}
      <section className="admin-section">
        <h2>Yêu cầu trở thành người cho thuê</h2>

        {lessorError && <p className="admin-error">{lessorError}</p>}
        {lessorLoading && <p className="admin-loading">Đang tải…</p>}

        {!lessorLoading && !lessorError && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Ngày sinh</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                  <th>Hành động</th>
                </tr>
              </thead>

              <tbody>
                {lessorRequests.length === 0 && (
                  <tr>
                    <td colSpan="8" className="admin-empty">
                      Không có yêu cầu nào.
                    </td>
                  </tr>
                )}

                {lessorRequests.map(req => (
                  <tr key={req.id}>
                    <td>#{req.id}</td>

                    <td>
                      {req.full_name || req.user?.name}
                      <div className="admin-td-sub">User ID: {req.user_id}</div>
                    </td>

                    <td>{req.email}</td>

                    <td>{req.phone_number}</td>

                    <td>{new Date(req.date_of_birth).toLocaleDateString("vi-VN")}</td>

                    <td>
                      <span className={`admin-badge admin-badge--${req.status}`}>
                        {req.status}
                      </span>
                    </td>

                    <td>{new Date(req.created_at).toLocaleString("vi-VN")}</td>
                    <td>
                      <div className="admin-td-actions">
                        <button
                        style={{
                          padding: "6px 12px",
                          border: "1px solid #007bff",
                          background: "transparent",
                          color: "#007bff",
                          borderRadius: "6px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                          onClick={() => setSelectedRequest(req)}
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </section>

      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>

            <button className="modal-close" onClick={() => setSelectedRequest(null)}>×</button>

            <h2>Thông tin yêu cầu #{selectedRequest.id}</h2>

            <p><b>Họ tên:</b> {selectedRequest.full_name}</p>
            <p><b>Email:</b> {selectedRequest.email}</p>
            <p><b>Số điện thoại:</b> {selectedRequest.phone_number}</p>
            <p><b>Ngày sinh:</b> {new Date(selectedRequest.date_of_birth).toLocaleDateString("vi-VN")}</p>
            <p><b>Trạng thái:</b> {selectedRequest.status}</p>
            <p><b>Ngày gửi:</b> {(selectedRequest.created_at)}</p>
            
            <div className="cccd-preview-wrapper">
              <div>
                <p>CCCD mặt trước</p>
                <img className="cccd-large" src={selectedRequest.cccd_front_url} />
              </div>

              <div>
                <p>CCCD mặt sau</p>
                <img className="cccd-large" src={selectedRequest.cccd_back_url} />
              </div>
            </div>

            <div className="modal-actions">
            {selectedRequest.status === "pending" && (
              <>              
              <button
                className="admin-btn admin-btn--primary"
                onClick={() => handleLessorAction(selectedRequest.id, "approve")}
              >
                Duyệt
              </button>

              <button
                className="admin-btn admin-btn--warning"
                onClick={() => handleLessorAction(selectedRequest.id, "reject")}
              >
                Từ chối
              </button>
              </>
            )}
            
              <button
                className="admin-btn admin-btn--danger"
                onClick={() => handleLessorAction(selectedRequest.id, "delete")}
              >
                Xoá
              </button>
            </div>

          </div>
        </div>
      )}

    </div>

  )
}
