export default function Footer(){
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p>© {new Date().getFullYear()} Trọ Mới Clone</p>
        <div className="site-footer__links">
          <a href="#">Điều khoản</a>
          <a href="#">Chính sách</a>
          <a href="#">Liên hệ</a>
        </div>
      </div>
    </footer>
  )
}
