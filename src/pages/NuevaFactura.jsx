import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import api from '../services/api'

const estadoInicial = {
  numeroFactura: '',
  monto: '',
  montoIva: '',
  proveedor: '',
  fecha: '',
  bancoNombre: '',
  bancoCuenta: '',
  tipoTransaccion: '',
  descripcion: '',
  notas: '',
}

function NuevaFactura() {
  const navigate = useNavigate()
  const [form, setForm] = useState(estadoInicial)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const cambiar = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setError('')
    try {
      const res = await api.post('/facturas', {
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
      })
      navigate(`/facturas/${res.data._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la factura')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to="/facturas" className="text-blue-600 hover:underline flex items-center gap-2 mb-4 text-sm">
        <ArrowLeft size={16} /> Volver a facturas
      </Link>
      <h1 className="text-2xl font-bold mb-6">Nueva factura manual</h1>

      {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg mb-4">{error}</p>}

      <form onSubmit={guardar} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Número de factura</label>
            <input name="numeroFactura" value={form.numeroFactura} onChange={cambiar} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="00123" />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Proveedor</label>
            <input name="proveedor" value={form.proveedor} onChange={cambiar} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Nombre proveedor" />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Monto (Q)</label>
            <input name="monto" type="number" step="0.01" value={form.monto} onChange={cambiar} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">IVA (Q)</label>
            <input name="montoIva" type="number" step="0.01" value={form.montoIva} onChange={cambiar} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Fecha</label>
            <input name="fecha" type="date" value={form.fecha} onChange={cambiar} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Tipo de transacción</label>
            <input name="tipoTransaccion" value={form.tipoTransaccion} onChange={cambiar} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Transferencia / Cheque" />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Banco</label>
            <input name="bancoNombre" value={form.bancoNombre} onChange={cambiar} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Nombre del banco" />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Número de cuenta</label>
            <input name="bancoCuenta" value={form.bancoCuenta} onChange={cambiar} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Cuenta" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-slate-600 mb-1">Descripción</label>
            <input name="descripcion" value={form.descripcion} onChange={cambiar} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Descripción opcional" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-slate-600 mb-1">Notas</label>
            <textarea name="notas" value={form.notas} onChange={cambiar} rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Notas internas" />
          </div>
        </div>

        <button
          type="submit"
          disabled={guardando}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition disabled:opacity-50 text-sm"
        >
          <Save size={16} /> Guardar factura
        </button>
      </form>
    </div>
  )
}

export default NuevaFactura