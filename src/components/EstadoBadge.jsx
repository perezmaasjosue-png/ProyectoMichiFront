import React from 'react'

const estilos = {
  pendiente: 'bg-amber-100 text-amber-800 border-amber-300',
  procesada: 'bg-blue-100 text-blue-800 border-blue-300',
  validada: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  rechazada: 'bg-red-100 text-red-800 border-red-300',
}

const etiquetas = {
  pendiente: 'Pendiente',
  procesada: 'Procesada',
  validada: 'Validada',
  rechazada: 'Rechazada',
}

function EstadoBadge({ estado }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${estilos[estado] || 'bg-gray-100 text-gray-700 border-gray-300'}`}
    >
      {etiquetas[estado] || estado}
    </span>
  )
}

export default EstadoBadge