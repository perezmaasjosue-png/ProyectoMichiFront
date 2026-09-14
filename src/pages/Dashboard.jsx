import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Clock, FileText, Eye } from 'lucide-react'
import api from '../services/api'
import EstadoBadge from '../components/EstadoBadge'
import { formatearMoneda, formatearFechaHora } from '../utils/format'

function Dashboard() {
  const [facturas, setFacturas] = useState([])
  const [pendientes, setPendientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargar = async () => {
      try {
        const [todas, pend] = await Promise.all([
          api.get('/facturas?limit=10'),
          api.get('/facturas/pendientes'),
        ])
        setFacturas(todas.data)
        setPendientes(pend.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar datos')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  const procesadas = facturas.filter((f) => f.estado === 'procesada' || f.estado === 'validada')
  const montoTotal = procesadas.reduce((acc, f) => acc + (f.monto || 0), 0)

  const stats = [
    {
      label: 'Facturas pendientes',
      valor: pendientes.length,
      icon: Clock,
      color: 'bg-amber-100 text-amber-700',
    },
    {
      label: 'Facturas procesadas',
      valor: procesadas.length,
      icon: CheckCircle2,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Monto total procesado',
      valor: formatearMoneda(montoTotal),
      icon: FileText,
      color: 'bg-blue-100 text-blue-700',
    },
  ]

  if (cargando) {
    return <div className="text-center text-slate-500 mt-20">Cargando...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg mb-4">{error}</p>}

      {pendientes.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 text-amber-800 p-4 rounded-xl mb-6 flex items-start gap-3">
          <AlertTriangle size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">
              Tienes {pendientes.length} factura(s) pendiente(s) de revisión
            </p>
            <p className="text-sm">
              No podrás generar el cuadre bancario hasta revisarlas. Revisa la imagen y completa los
              datos manualmente.
            </p>
            <Link to="/facturas?estado=pendiente" className="text-sm underline font-medium mt-1 inline-block">
              Ir a revisarlas
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.valor}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold">Últimas facturas recibidas</h2>
          <Link to="/facturas" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            Ver todas <Eye size={14} />
          </Link>
        </div>

        {facturas.length === 0 ? (
          <p className="p-6 text-slate-500 text-center">Aún no hay facturas</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-6 py-3">Factura</th>
                <th className="px-6 py-3">Remitente</th>
                <th className="px-6 py-3">Monto</th>
                <th className="px-6 py-3">Recibido</th>
                <th className="px-6 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {facturas.map((f) => (
                <tr key={f._id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium">{f.numeroFactura || f.datosManuales?.numeroFactura || 'Sin número'}</td>
                  <td className="px-6 py-3">{f.remitente?.nombre || f.remitente?.numeroTelefono || '-'}</td>
                  <td className="px-6 py-3">{formatearMoneda(f.monto)}</td>
                  <td className="px-6 py-3">{formatearFechaHora(f.fechaRecepcion)}</td>
                  <td className="px-6 py-3">
                    <Link to={`/facturas/${f._id}`}>
                      <EstadoBadge estado={f.estado} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Dashboard