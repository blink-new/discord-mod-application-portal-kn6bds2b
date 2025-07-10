import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { LoginScreen } from './components/LoginScreen'
import { Dashboard } from './components/Dashboard'
import { Toaster } from 'react-hot-toast'
import './App.css'

interface User {
  id: string
  email: string
  displayName?: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-discord-blurple via-blue-600 to-indigo-700 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-lg font-medium">Loading Discord Portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-discord-blurple via-blue-600 to-indigo-700">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#2C2F33',
            color: '#FFFFFF',
            border: '1px solid #5865F2',
          },
        }}
      />
      {user ? <Dashboard user={user} /> : <LoginScreen />}
    </div>
  )
}

export default App