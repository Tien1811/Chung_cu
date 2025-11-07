import { useEffect, useState } from 'react'
import { api } from '../api/axios.js'
import FilterBar from '../components/FilterBar.jsx'
import PostCard from '../components/PostCard.jsx'

export default function ListingBase({ category, title }){
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [params, setParams] = useState({})

  const load = async (p = {}) => {
    setLoading(true)
    const res = await api.get('/posts', { params: { category, ...p } })
    setPosts(res.data.data || res.data || [])
    setLoading(false)
  }

  useEffect(()=>{ load(params) }, [category])

  return (
    <section className="listing">
      <h1 className="page-title">{title}</h1>
      <FilterBar onChange={(s)=>{ setParams(s); load(s) }} />
      {loading ? <p>Đang tải...</p> : (
        posts.length ? (
          <div className="grid">
            {posts.map(p => <PostCard key={p.id} post={p} />)}
          </div>
        ) : <p>Không có kết quả.</p>
      )}
    </section>
  )
}
