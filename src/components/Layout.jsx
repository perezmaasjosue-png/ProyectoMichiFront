import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, FileText, Calculator, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/facturas', label: 'Facturas', icon: FileText },
  { to: '/cuadre', label: 'Cuadre Bancario', icon: Calculator },
]

function Layout() {
  const { usuario, logout } = useAuth()

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-slate-900 text-white p-4 flex flex-col">
        <h1 className="text-xl font-bold mb-8 px-2">Proyecto Michi</h1>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-700 pt-4 mt-4">
          <p className="text-sm text-slate-300 px-2 mb-1">{usuario?.nombre}</p>
          <p className="text-xs text-slate-500 px-2 mb-3 capitalize">{usuario?.rol}</p>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-red-400 hover:bg-slate-800 transition"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout