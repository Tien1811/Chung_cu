import { useState } from 'react'
import { api, setToken } from '../api/axios.js'
import { useNavigate } from 'react-router-dom'


export default function Login(){
  const nav = useNavigate()
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [err,setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault(); setErr('')
    try {
      const r = await api.post('/auth/login',{email,password})
      localStorage.setItem('token', r.data.token)
      setToken(r.data.token)
      nav('/')
    } catch {
      setErr('Sai thông tin đăng nhập')
    }
  }

  return (
    <section className="auth">
      <h1 className="page-title">Đăng nhập</h1>
      <form onSubmit={submit} className="form">
        {err && <p className="form__error">{err}</p>}
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
        <input className="input" type="password" placeholder="Mật khẩu" value={password} onChange={e=>setPassword(e.target.value)}/>
        <button className="btn btn--dark" type="submit">Đăng nhập</button>
      </form>
    </section>
  )
}
