"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { apiService } from "@/services/ApiService"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState("")

  const [reg, setReg] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    gender: true,     // true = Male, false = Female
    position: true,   // true = Operator, false = User
    birthdate: "",
  })

  const [passwordStrength, setPasswordStrength] = useState(0)
  const [regErrors, setRegErrors] = useState<Record<string, string>>({})
  const [regLoading, setRegLoading] = useState(false)

  const { login } = useAuth()
  const router = useRouter()

  const calculatePasswordStrength = (pwd: string) => {
    let s = 0
    if (pwd.length >= 8) s += 25
    if (pwd.length >= 12) s += 25
    if (/[A-Z]/.test(pwd)) s += 25
    if (/[0-9!@#$%^&*]/.test(pwd)) s += 25
    return Math.min(s, 100)
  }

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = e.target.value.replace(/\D/g, "").slice(0, 10)
    setReg({ ...reg, phoneNumber: d })
  }

  const handleBirthdateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let d = e.target.value.replace(/\D/g, "").slice(0, 8)
    if (d.length >= 6) d = `${d.slice(0,2)}-${d.slice(2,4)}-${d.slice(4)}`
    else if (d.length >= 4) d = `${d.slice(0,2)}-${d.slice(2)}`
    setReg({ ...reg, birthdate: d })
  }

  const validateLogin = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) return false
    if (loginPassword.length < 8) return false
    return true
  }

  const validateRegister = () => {
    const e: Record<string, string> = {}
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(reg.username)) e.username = "Invalid username"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reg.email)) e.email = "Invalid email"
    if (reg.password.length < 8) e.password = "Password too short"
    if (!/^05\d{8}$/.test(reg.phoneNumber)) e.phoneNumber = "Invalid phone"
    if (!/^\d{2}-\d{2}-\d{4}$/.test(reg.birthdate)) e.birthdate = "Use DD-MM-YYYY"
    setRegErrors(e)
    return Object.keys(e).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateLogin()) return setLoginError("Check email/password")

    setLoginLoading(true)
    try {
      const res = await apiService.login<any>(loginEmail, loginPassword)
      if (res.error || !res.data) throw new Error("Login failed")
      login(res.data)
      router.push("/dashboard")
    } catch {
      setLoginError("Invalid credentials")
    } finally {
      setLoginLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateRegister()) return

    setRegLoading(true)
    try {
      const payload = { ...reg, more: {} }
      const res = await apiService.register<any>(payload)
      if (res.error) throw new Error(res.error.message || "Registration failed")
      login({ username: reg.username, email: reg.email })
      router.push("/dashboard")
    } catch (err: any) {
      setRegErrors({ submit: err.message || "Registration failed" })
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-black dark:via-slate-900 dark:to-black">
      <Link href="/">
        <motion.button
          className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          whileHover={{ x: -6 }}
        >
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </motion.button>
      </Link>

      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-md"
        >
          <div className="rounded-2xl bg-white dark:bg-slate-800 p-8 shadow-2xl">
            <div className="mb-8 flex gap-3">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 rounded-lg py-3 font-bold transition-all ${isLogin ? "bg-blue-600 text-white shadow-lg" : "bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300"}`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 rounded-lg py-3 font-bold transition-all ${!isLogin ? "bg-purple-600 text-white shadow-lg" : "bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300"}`}
              >
                Register
              </button>
            </div>

            {/* LOGIN */}
            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <h1 className="mb-2 text-3xl font-bold">Welcome Back</h1>
                <p className="mb-8 text-gray-600 dark:text-gray-400">Sign in to access your graphs</p>

                <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg border bg-white dark:bg-slate-700 px-4 py-2.5" required />
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Password" className="w-full rounded-lg border bg-white dark:bg-slate-700 px-4 py-2.5 pr-10" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {loginError && <p className="text-red-500 text-sm">{loginError}</p>}

                <button disabled={loginLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">
                  {loginLoading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            ) : (
              /* REGISTER */
              <form onSubmit={handleRegister} className="space-y-5 max-h-96 overflow-y-auto pr-1">
                <h1 className="mb-2 text-3xl font-bold">Create Account</h1>
                <p className="mb-6 text-gray-600 dark:text-gray-400">Join GraphStudio Pro today</p>

                {/* Username */}
                <input value={reg.username} onChange={e => setReg({ ...reg, username: e.target.value })} placeholder="Username" className="w-full rounded-lg border bg-white dark:bg-slate-700 px-4 py-2.5" />
                {regErrors.username && <p className="text-red-500 text-xs">{regErrors.username}</p>}

                {/* Email */}
                <input type="email" value={reg.email} onChange={e => setReg({ ...reg, email: e.target.value })} placeholder="Email" className="w-full rounded-lg border bg-white dark:bg-slate-700 px-4 py-2.5" />
                {regErrors.email && <p className="text-red-500 text-xs">{regErrors.email}</p>}

                {/* Password */}
                <input
                  type="password"
                  value={reg.password}
                  onChange={e => {
                    setReg({ ...reg, password: e.target.value })
                    setPasswordStrength(calculatePasswordStrength(e.target.value))
                  }}
                  placeholder="Password"
                  className="w-full rounded-lg border bg-white dark:bg-slate-700 px-4 py-2.5"
                />
                {regErrors.password && <p className="text-red-500 text-xs">{regErrors.password}</p>}

                {/* Phone */}
                <input value={reg.phoneNumber} onChange={handlePhoneInput} placeholder="Phone (05XXXXXXXXX)" className="w-full rounded-lg border bg-white dark:bg-slate-700 px-4 py-2.5" />
                {regErrors.phoneNumber && <p className="text-red-500 text-xs">{regErrors.phoneNumber}</p>}

                {/* Birthdate */}
                <input value={reg.birthdate} onChange={handleBirthdateInput} placeholder="DD-MM-YYYY" className="w-full rounded-lg border bg-white dark:bg-slate-700 px-4 py-2.5" />
                {regErrors.birthdate && <p className="text-red-500 text-xs">{regErrors.birthdate}</p>}

                {/* Gender Toggle */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Gender</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setReg({ ...reg, gender: true })}
                      className={`flex-1 py-3 rounded-lg font-bold transition-all ${reg.gender ? "bg-blue-600 text-white shadow-lg" : "bg-gray-200 dark:bg-slate-700 text-gray-600"}`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setReg({ ...reg, gender: false })}
                      className={`flex-1 py-3 rounded-lg font-bold transition-all ${!reg.gender ? "bg-pink-600 text-white shadow-lg" : "bg-gray-200 dark:bg-slate-700 text-gray-600"}`}
                    >
                      Female
                    </button>
                  </div>
                </div>

               

                {/* Position Toggle */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Role</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setReg({ ...reg, position: false })}
                      className={`flex-1 py-3 rounded-lg font-bold transition-all ${!reg.position ? "bg-green-600 text-white shadow-lg" : "bg-gray-200 dark:bg-slate-700 text-gray-600"}`}
                    >
                      User
                    </button>
                    <button
                      type="button"
                      onClick={() => setReg({ ...reg, position: true })}
                      className={`flex-1 py-3 rounded-lg font-bold transition-all ${reg.position ? "bg-purple-600 text-white shadow-lg" : "bg-gray-200 dark:bg-slate-700 text-gray-600"}`}
                    >
                      Operator
                    </button>
                  </div>
                </div>

                {regErrors.submit && <p className="text-red-500 text-sm text-center">{regErrors.submit}</p>}

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-lg transition mt-6"
                >
                  {regLoading ? "Creating account..." : "Create Account"}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

AuthPage.displayName = "AuthPage"
