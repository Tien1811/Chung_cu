import { useState } from 'react'

export default function FilterBar({ onChange }){
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('new')

  return (
    <div className="filterbar">
      <input className="input" value={q} onChange={e=>setQ(e.target.value)} placeholder="Từ khóa, địa chỉ..."/>
      <select className="select" value={sort} onChange={(e)=>setSort(e.target.value)}>
        <option value="new">Mới nhất</option>
        <option value="priceAsc">Giá tăng dần</option>
        <option value="priceDesc">Giá giảm dần</option>
      </select>
      <button className="btn btn--dark" onClick={()=>onChange({q,sort})}>Tìm ngay</button>
      <button className="btn btn--ghost" onClick={()=>{ setQ(''); setSort('new'); onChange({}); }}>Đặt lại</button>
    </div>
  )
}
