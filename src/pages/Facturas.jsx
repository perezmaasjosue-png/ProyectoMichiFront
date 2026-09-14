import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AlertTriangle, Eye } from 'lucide-react'
import api from '../services/api'
import EstadoBadge from '../components/EstadoBadge'
import { formatearMoneda, formatearFechaHora } from '../utils/format'

const estadosFiltro = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'procesada', label: 'Procesada' },
  { value: 'validada', label: 'Validada' },
  { value: 'rechazada', label: 'Rechazada' },
]

function Facturas() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [facturas, setFacturas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const estado = searchParams.get('estado') || ''
  const desde = searchParams.get('desde') || ''
  const hasta = searchParams.get('hasta') || ''
  const numeroFactura = searchParams.get('numeroFactura') || ''

  const cargar = async () => {
    setCargando(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (estado) params.set('estado', estado)
      if (desde) params.set('desde', desde)
      if (hasta) params.set('hasta', hasta)
      if (numeroFactura) params.set('numeroFactura', numeroFactura)
      const res = await api.get(`/facturas${params.toString() ? `?${params}` : ''}`)
      setFacturas(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar facturas')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [estado, desde, hasta, numeroFactura])

  const actualizarFiltro = (clave, valor) => {
    const nuevos = new URLSearchParams(searchParams)
    if (valor) {
      nuevos.set(clave, valor)
    } else {
      nuevos.delete(clave)
    }
    setSearchParams(nuevos)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Facturas</h1>
        <Link
          to="/facturas/nueva"
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition text-sm"
        >
          + Nueva factura manual
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Estado</label>
          <select
            value={estado}
            onChange={(e) => actualizarFiltro('estado', e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          >
            {estadosFiltro.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Desde</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => actualizarFiltro('desde', e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => actualizarFiltro('hasta', e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs text-slate-500 mb-1">Número de factura</label>
          <input
            type="text"
            value={numeroFactura}
            onChange={(e) => actualizarFiltro('numeroFactura', e.target.value)}
            placeholder="Buscar..."
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg mb-4">{error}</p>}

      {cargando ? (
        <p className="text-center text-slate-500 mt-10">Cargando...</p>
      ) : facturas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-slate-500">
          No hay facturas con estos filtros
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-6 py-3">Factura</th>
                <th className="px-6 py-3">Remitente</th>
                <th className="px-6 py-3">Monto</th>
                <th className="px-6 py-3">Recibido</th>
                <th className="px-6 py-3">Nitidez</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {facturas.map((f) => (
                <tr key={f._id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium">
                    {f.numeroFactura || f.datosManuales?.numeroFactura || 'Sin número'}
                  </td>
                  <td className="px-6 py-3">{f.remitente?.nombre || f.remitente?.numeroTelefono || '-'}</td>
                  <td className="px-6 py-3">{formatearMoneda(f.monto)}</td>
                  <td className="px-6 py-3">{formatearFechaHora(f.fechaRecepcion)}</td>
                  <td className="px-6 py-3">
                    {f.ocrData?.imagenBorrosa ? (
                      <span className="flex items-center gap-1 text-amber-600 text-xs">
                        <AlertTriangle size={13} /> Borrosa
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">
                        {Math.round(f.ocrData?.nitidez || 0)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <EstadoBadge estado={f.estado} />
                  </td>
                  <td className="px-6 py-3">
                    <Link
                      to={`/facturas/${f._id}`}
                      className="text-blue-600 hover:underline flex items-center gap-1 text-xs"
                    >
                      <Eye size={14} /> Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Facturas