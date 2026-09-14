import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Download, FileText, Settings2 } from 'lucide-react'
import api from '../services/api'
import { formatearMoneda, formatearFecha } from '../utils/format'

const hoy = () => {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

const haceUnMes = () => {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return d.toISOString().slice(0, 10)
}

function Cuadre() {
  const [desde, setDesde] = useState(haceUnMes())
  const [hasta, setHasta] = useState(hoy())
  const [banco, setBanco] = useState('')
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [descargando, setDescargando] = useState(false)
  const [error, setError] = useState('')

  const cargar = async () => {
    setCargando(true)
    setError('')
    try {
      const params = new URLSearchParams({ desde, hasta })
      if (banco) params.set('banco', banco)
      const res = await api.get(`/facturas/cuadre?${params}`)
      setDatos(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar el cuadre')
      setDatos(null)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const descargarPDF = async () => {
    setDescargando(true)
    setError('')
    try {
      const params = new URLSearchParams({ desde, hasta })
      if (banco) params.set('banco', banco)
      const res = await api.get(`/facturas/cuadre/pdf?${params}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `cuadre_${desde}_${hasta}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      const mensaje =
        err.response?.data?.message ||
        (err.response?.data instanceof Blob
          ? 'Error del servidor al generar el PDF'
          : 'No se pudo generar el PDF. Revisa si hay facturas pendientes.')
      setError(typeof mensaje === 'string' ? mensaje : 'Error al generar el PDF')
    } finally {
      setDescargando(false)
    }
  }

  const bloqueado = datos?.bloqueadoPorPendientes

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Cuadre Bancario</h1>

      {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg mb-4">{error}</p>}

      <div className="bg-white p-4 rounded-xl shadow-sm mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Desde</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Banco</label>
          <input
            type="text"
            value={banco}
            onChange={(e) => setBanco(e.target.value)}
            placeholder="Nombre del banco"
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={cargar}
          disabled={cargando}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition disabled:opacity-50 text-sm"
        >
          {cargando ? 'Cargando...' : 'Consultar'}
        </button>
      </div>

      {bloqueado && (
        <div className="bg-amber-50 border border-amber-300 text-amber-800 p-4 rounded-xl mb-6 flex items-start gap-3">
          <AlertTriangle size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">
              Cuadre bloqueado: hay {datos.resumen.cantidadPendientes} factura(s) pendiente(s)
            </p>
            <p className="text-sm mb-3">
              No se puede generar el PDF del cuadre hasta que todas las facturas pendientes sean
              revisadas y completadas manualmente.
            </p>
            <ul className="space-y-1">
              {datos.pendientes.map((f) => (
                <li key={f._id}>
                  <Link
                    to={`/facturas/${f._id}`}
                    className="inline-flex items-center gap-1.5 text-sm bg-white border border-amber-300 rounded-lg px-3 py-1.5 hover:bg-amber-100 transition"
                  >
                    <Settings2 size={14} />
                    Revisar factura {f.numeroFactura || '(sin número)'} - recibida{' '}
                    {formatearFecha(f.fechaRecepcion)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {cargando ? (
        <p className="text-center text-slate-500 mt-10">Cargando...</p>
      ) : datos ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <p className="text-sm text-slate-500">Facturas incluidas</p>
              <p className="text-2xl font-bold">{datos.resumen.cantidadIncluidas}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <p className="text-sm text-slate-500">Monto total</p>
              <p className="text-2xl font-bold">{formatearMoneda(datos.resumen.montoTotal)}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <p className="text-sm text-slate-500">Gran total (con IVA)</p>
              <p className="text-2xl font-bold">{formatearMoneda(datos.resumen.granTotal)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b font-semibold">Facturas del período</div>
            {datos.incluidas.length === 0 ? (
              <p className="p-6 text-slate-500 text-center">No hay facturas procesadas en el período</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-left">
                  <tr>
                    <th className="px-6 py-3">#</th>
                    <th className="px-6 py-3">Factura</th>
                    <th className="px-6 py-3">Monto</th>
                    <th className="px-6 py-3">IVA</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {datos.incluidas.map((f) => (
                    <tr key={f._id}>
                      <td className="px-6 py-3">{f.index}</td>
                      <td className="px-6 py-3 font-medium">{f.numeroFactura}</td>
                      <td className="px-6 py-3">{formatearMoneda(f.monto)}</td>
                      <td className="px-6 py-3">{formatearMoneda(f.iva)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={descargarPDF}
              disabled={descargando || bloqueado}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition text-sm ${
                bloqueado
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
              title={bloqueado ? 'Hay facturas pendientes, revisa antes de generar el cuadre' : 'Generar PDF'}
            >
              <Download size={16} />
              {descargando ? 'Generando...' : 'Generar PDF del cuadre'}
            </button>
            {bloqueado && (
              <span className="text-sm text-amber-700 flex items-center gap-1">
                <FileText size={14} /> Deshabilitado por facturas pendientes
              </span>
            )}
          </div>
        </>
      ) : (
        <p className="text-center text-slate-500 mt-10">Sin datos para mostrar</p>
      )}
    </div>
  )
}

export default Cuadre