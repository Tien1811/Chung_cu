import { useEffect, useState } from 'react'
import { api } from '../api/axios.js'

export default function AdminPost(){
  const [title,setTitle]=useState('')
  const [price,setPrice]=useState(1500000)
  const [area,setArea]=useState(20)
  const [address,setAddress]=useState('')
  const [categoryId,setCategoryId]=useState('')
  const [images,setImages]=useState(null)
  const [categories,setCategories]=useState([])

  useEffect(()=>{ (async()=>{
    const cats = await api.get('/categories') // cần route này ở backend
    setCategories(cats.data || [])
  })()},[])

  const submit = async (e) => {
    e.preventDefault(); if(!categoryId) return
    const token = localStorage.getItem('token')
    const fd = new FormData()
    fd.append('title', title)
    fd.append('price', String(price))
    fd.append('area', String(area))
    fd.append('address', address)
    fd.append('category_id', String(categoryId))
    if(images) Array.from(images).forEach(f=>fd.append('images[]', f))

    await api.post('/admin/posts', fd, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type':'multipart/form-data' }
    })
    alert('Đăng bài thành công')
  }

  return (
    <section className="admin">
      <h1 className="page-title">Đăng nhà trọ</h1>
      <form className="form form--grid" onSubmit={submit}>
        <input className="input input--full" placeholder="Tiêu đề" value={title} onChange={e=>setTitle(e.target.value)} />
        <div className="form__row">
          <input className="input" type="number" placeholder="Giá (VND)" value={price} onChange={e=>setPrice(+e.target.value)} />
          <input className="input" type="number" placeholder="Diện tích (m²)" value={area} onChange={e=>setArea(+e.target.value)} />
        </div>
        <input className="input input--full" placeholder="Địa chỉ" value={address} onChange={e=>setAddress(e.target.value)} />
        <select className="select input--full" value={categoryId} onChange={e=>setCategoryId(e.target.value)}>
          <option value="">-- Chọn danh mục --</option>
          {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input className="input input--full" type="file" multiple onChange={e=>setImages(e.target.files)} />
        <button className="btn btn--primary" type="submit">Đăng bài</button>
      </form>
    </section>
  )
}
