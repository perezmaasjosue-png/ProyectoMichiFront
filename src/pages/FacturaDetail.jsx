import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, Save, CheckCircle2, XCircle, Trash2 } from 'lucide-react'
import api from '../services/api'
import EstadoBadge from '../components/EstadoBadge'
import { formatearFechaHora } from '../utils/format'
import { useAuth } from '../context/AuthContext'

const URL_IMAGENES = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '')

function FacturaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()

  const [factura, setFactura] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [motivoRechazo, setMotivoRechazo] = useState('')

  const [form, setForm] = useState({
    numeroFactura: '',
    monto: '',
    montoIva: '',
    proveedor: '',
    fecha: '',
    bancoNombre: '',
    bancoCuenta: '',
    tipoTransaccion: '',
    notas: '',
    descripcion: '',
  })

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get(`/facturas/${id}`)
        setFactura(res.data)
        const m = res.data.datosManuales || {}
        setForm({
          numeroFactura: m.numeroFactura || res.data.numeroFactura || '',
          monto: m.monto ?? res.data.monto ?? '',
          montoIva: res.data.montoIva ?? '',
          proveedor: m.proveedor || '',
          fecha: res.data.fecha ? res.data.fecha.slice(0, 10) : '',
          bancoNombre: res.data.banco?.nombre || '',
          bancoCuenta: res.data.banco?.numeroCuenta || '',
          tipoTransaccion: res.data.banco?.tipoTransaccion || '',
          notas: res.data.notas || '',
          descripcion: m.descripcion || '',
        })
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar la factura')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [id])

  const cambiar = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const guardar = async () => {
    setGuardando(true)
    setError('')
    setExito('')
    try {
      const body = {
        numeroFactura: form.numeroFactura,
        monto: form.monto ? Number(form.monto) : undefined,
        montoIva: form.montoIva ? Number(form.montoIva) : undefined,
        proveedor: form.proveedor,
        descripcion: form.descripcion,
        fecha: form.fecha || undefined,
        banco: {
          nombre: form.bancoNombre,
          numeroCuenta: form.bancoCuenta,
          tipoTransaccion: form.tipoTransaccion,
        },
        notas: form.notas,
      }
      const res = await api.put(`/facturas/${id}`, body)
      setFactura(res.data)
      setExito('Datos guardados correctamente')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const validar = async () => {
    setError('')
    setExito('')
    try {
      const res = await api.put(`/facturas/${id}/validar`)
      setFactura(res.data)
      setExito('Factura validada para el cuadre')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al validar')
    }
  }

  const rechazar = async () => {
    if (!motivoRechazo) {
      setError('Debes escribir el motivo de rechazo')
      return
    }
    setError('')
    setExito('')
    try {
      const res = await api.put(`/facturas/${id}/rechazar`, { motivo: motivoRechazo })
      setFactura(res.data)
      setExito('Factura rechazada')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al rechazar')
    }
  }

  const eliminar = async () => {
    if (!window.confirm('¿Eliminar esta factura? Esta acción no se puede deshacer.')) return
    try {
      await api.delete(`/facturas/${id}`)
      navigate('/facturas')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar')
    }
  }

  if (cargando) {
    return <p className="text-center text-slate-500 mt-10">Cargando...</p>
  }

  if (!factura) {
    return <p className="text-center text-slate-500 mt-10">{error}</p>
  }

  const esPendiente = factura.estado === 'pendiente'
  const esAdmin = usuario?.rol === 'admin'

  return (
    <div>
      <Link to="/facturas" className="text-blue-600 hover:underline flex items-center gap-2 mb-4 text-sm">
        <ArrowLeft size={16} /> Volver a facturas
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Factura {factura.numeroFactura || factura.datosManuales?.numeroFactura || '(sin número)'}
        </h1>
        <EstadoBadge estado={factura.estado} />
      </div>

      {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg mb-4">{error}</p>}
      {exito && <p className="text-emerald-700 bg-emerald-50 p-3 rounded-lg mb-4">{exito}</p>}

      {esPendiente && (
        <div className="bg-amber-50 border border-amber-300 text-amber-800 p-4 rounded-xl mb-6 flex items-start gap-3">
          <AlertTriangle size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Factura pendiente de revisión manual</p>
            <p className="text-sm">
              {factura.ocrData?.imagenBorrosa
                ? 'La imagen fue detectada como borrosa o ilegible. Revisa la foto y completa los datos a mano.'
                : `El OCR no alcanzó la confianza mínima (${Math.round(factura.ocrData?.confianza || 0)}%). Revisa los datos.`}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold mb-4">Imagen de la factura</h2>
          {factura.imageUrl ? (
            <a href={`${URL_IMAGENES}${factura.imageUrl}`} target="_blank" rel="noreferrer">
              <img
                src={`${URL_IMAGENES}${factura.imageUrl}`}
                alt="Factura"
                className="w-full rounded-lg border border-slate-200"
              />
            </a>
          ) : (
            <p className="text-slate-500 text-sm">Esta factura fue creada manualmente, sin imagen.</p>
          )}

          <div className="mt-4 text-sm space-y-1 text-slate-600">
            <p>
              <span className="font-medium">Recibido:</span> {formatearFechaHora(factura.fechaRecepcion)}
            </p>
            <p>
              <span className="font-medium">Remitente:</span> {factura.remitente?.nombre || 'Desconocido'} (
              {factura.remitente?.numeroTelefono || 'sin teléfono'})
            </p>
            <div className="border-t pt-3 mt-3">
              <p className="font-medium text-slate-800 mb-1">Análisis OCR:</p>
              <p>
                Nitidez:{' '}
                {factura.ocrData?.imagenBorrosa ? (
                  <span className="text-amber-600 font-medium">Borrosa</span>
                ) : (
                  Math.round(factura.ocrData?.nitidez || 0)
                )}
              </p>
              <p>Confianza: {Math.round(factura.ocrData?.confianza || 0)}%</p>
              {factura.ocrData?.camposDetectados && (
                <pre className="bg-slate-50 p-3 rounded-lg text-xs mt-2 overflow-auto">
                  {JSON.stringify(factura.ocrData.camposDetectados, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold mb-4">Datos (llenado manual)</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Número de factura</label>
              <input
                name="numeroFactura"
                value={form.numeroFactura}
                onChange={cambiar}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                placeholder="00123"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Proveedor</label>
              <input
                name="proveedor"
                value={form.proveedor}
                onChange={cambiar}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Nombre proveedor"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Monto (Q)</label>
              <input
                name="monto"
                type="number"
                step="0.01"
                value={form.monto}
                onChange={cambiar}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">IVA (Q)</label>
              <input
                name="montoIva"
                type="number"
                step="0.01"
                value={form.montoIva}
                onChange={cambiar}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Fecha</label>
              <input
                name="fecha"
                type="date"
                value={form.fecha}
                onChange={cambiar}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Tipo de transacción</label>
              <input
                name="tipoTransaccion"
                value={form.tipoTransaccion}
                onChange={cambiar}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Transferencia / Cheque"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Banco</label>
              <input
                name="bancoNombre"
                value={form.bancoNombre}
                onChange={cambiar}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Nombre del banco"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Número de cuenta</label>
              <input
                name="bancoCuenta"
                value={form.bancoCuenta}
                onChange={cambiar}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Cuenta"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-slate-600 mb-1">Descripción</label>
              <input
                name="descripcion"
                value={form.descripcion}
                onChange={cambiar}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Descripción opcional"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-slate-600 mb-1">Notas</label>
              <textarea
                name="notas"
                value={form.notas}
                onChange={cambiar}
                rows={2}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Notas internas"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={guardar}
              disabled={guardando}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition disabled:opacity-50 text-sm"
            >
              <Save size={16} /> Guardar datos
            </button>
            <button
              onClick={validar}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition text-sm"
            >
              <CheckCircle2 size={16} /> Validar para cuadre
            </button>
            {esAdmin && (
              <>
                <div className="flex items-center gap-2">
                  <input
                    value={motivoRechazo}
                    onChange={(e) => setMotivoRechazo(e.target.value)}
                    placeholder="Motivo de rechazo"
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-48"
                  />
                  <button
                    onClick={rechazar}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition text-sm"
                  >
                    <XCircle size={16} /> Rechazar
                  </button>
                </div>
                <button
                  onClick={eliminar}
                  className="flex items-center gap-2 text-red-600 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-50 transition text-sm"
                >
                  <Trash2 size={16} /> Eliminar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FacturaDetail