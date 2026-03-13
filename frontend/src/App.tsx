import React from 'react'
import { io } from 'socket.io-client'

const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000')

export default function App(){
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">1724 Notes Share - Frontend (Prototype)</h1>
      <p className="mt-4">Socket.IO connected: {String(!!socket)}</p>
    </div>
  )
}
