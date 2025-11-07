import { useEffect, useState } from 'react'
import { api } from '../api/axios.js'

export default function Reviews(){
  const [items, setItems] = useState([])
  useEffect(()=>{ (async()=>{ const r = await api.get('/reviews'); setItems(r.data || []) })() },[])
  return (
    <section>
      <h1 className="page-title">Review</h1>
      <div className="stack">
        {items.map(i=>(
          <div key={i.id} className="panel">
            <div className="panel__head">
              <span className="rating">{'★'.repeat(i.rating||0)}{'☆'.repeat(5-(i.rating||0))}</span>
              <span className="panel__title">{i.post?.title || 'Bài đăng'}</span>
            </div>
            <p className="panel__text">{i.content}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
