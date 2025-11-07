export default function PostCard({ post }){
  const img = (post.images && post.images[0] && post.images[0].url) || 'https://picsum.photos/seed/rental/640/480'
  return (
    <article className="card">
      <div className="card__media">
        <img src={img} alt={post.title}/>
      </div>
      <div className="card__body">
        <h3 className="card__title" title={post.title}>{post.title}</h3>
        <p className="card__price">{(post.price||0).toLocaleString()} ₫/tháng</p>
        <p className="card__meta">{post.area} m² · {post.address}</p>
      </div>
    </article>
  )
}
