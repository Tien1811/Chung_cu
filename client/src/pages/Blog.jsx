import { useEffect, useState } from 'react'
import { api } from '../api/axios.js'

export default function Blog(){
  const [items, setItems] = useState([])
  useEffect(()=>{ (async()=>{ const r = await api.get('/blog'); setItems(r.data.data || r.data || []) })() },[])
  return (
    <section>
      <h1 className="page-title">Blog</h1>
      <div className="grid">
        {items.map(b=>(
          <article key={b.id} className="card">
            {b.cover && <div className="card__media"><img src={b.cover} alt={b.title}/></div>}
            <div className="card__body">
              <h3 className="card__title">{b.title}</h3>
              <p className="card__meta">{b.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
