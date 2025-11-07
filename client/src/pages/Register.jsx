import { useState } from 'react'
import { api } from '../api/axios.js'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const nav = useNavigate()
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [msg,setMsg] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    await api.post('/auth/register',{name,email,password})
    setMsg('Đăng ký thành công. Vui lòng đăng nhập.')
    setTimeout(()=>nav('/login'), 800)
  }

  return (
    <section className="auth">
      <h1 className="page-title">Đăng ký</h1>
      <form onSubmit={submit} className="form">
        {msg && <p className="form__success">{msg}</p>}
        <input className="input" placeholder="Họ tên" value={name} onChange={e=>setName(e.target.value)}/>
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
        <input className="input" type="password" placeholder="Mật khẩu" value={password} onChange={e=>setPassword(e.target.value)}/>
        <button className="btn btn--dark" type="submit">Tạo tài khoản</button>
      </form>
    </section>
  )
}
