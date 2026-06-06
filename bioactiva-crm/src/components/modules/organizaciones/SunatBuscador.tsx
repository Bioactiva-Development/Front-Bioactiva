'use client'

import { useState } from 'react'
import { Search, X, Loader2, FileText, CheckCircle } from 'lucide-react'
import { useSunat } from '@/hooks/organizaciones/useOrganizaciones'
import { SunatRucResult, SunatNombreResult } from '@/types/organizacion.types'

interface SunatBuscadorProps {
  onSeleccionar: (data: SunatRucResult) => void
  onCerrar:      () => void
  modoConsulta?: boolean
}

type TabType = 'ruc' | 'nombre'

export function SunatBuscador({ onSeleccionar, onCerrar, modoConsulta = false}: Readonly<SunatBuscadorProps>) {
  const [tab,            setTab]            = useState<TabType>('ruc')
  const [inputRuc,       setInputRuc]       = useState('')
  const [inputNombre,    setInputNombre]    = useState('')
  const [cargandoRuc,    setCargandoRuc]    = useState<string | null>(null)

  const {
    loadingRuc,
    loadingNombre,
    errorSunat,
    resultadoRuc,
    resultadosNombre,
    consultarPorRuc,
    consultarPorNombre,
    limpiar,
  } = useSunat()

  const handleBuscarRuc = async () => {
    if (inputRuc.length !== 11) return
    await consultarPorRuc(inputRuc)
  }

  const handleBuscarNombre = async () => {
    if (inputNombre.trim().length < 3) return
    await consultarPorNombre(inputNombre.trim())
  }

  const handleSeleccionarNombre = async (item: SunatNombreResult) => {
    if (modoConsulta) {
      setCargandoRuc(item.ruc)
      await consultarPorRuc(item.ruc)
      setCargandoRuc(null)
      setTab('ruc')
    } else {
      onSeleccionar({
        ruc:            item.ruc,
        nombre:         item.nombre,
        nombreCompleto: item.nombre,
        ubicacion:      item.ubicacion,
      })
    }
  }

  const handleCambiarTab = (nuevaTab: TabType) => {
    setTab(nuevaTab)
    limpiar()
    setInputRuc('')
    setInputNombre('')
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Cerrar modal"
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onCerrar}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCerrar() }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Validador SUNAT</h2>
          <button
            onClick={onCerrar}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600
              hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pt-5 shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => handleCambiarTab('ruc')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors
                ${tab === 'ruc'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
            >
              RUC
            </button>
            <button
              onClick={() => handleCambiarTab('nombre')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors
                ${tab === 'nombre'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
            >
              Razón social
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">

          {tab === 'ruc' && (
            <>
              <p className="text-sm text-gray-500">
                Ingresa un{' '}
                <span className="font-semibold text-gray-700">
                  RUC válido de 11 dígitos
                </span>{' '}
                para obtener la ficha SUNAT completa.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputRuc}
                  onChange={(e) => {
                    const val = e.target.value.replaceAll(/\D/g, '').slice(0, 11)
                    setInputRuc(val)
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleBuscarRuc()}
                  placeholder="Ej: 20464993879"
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-emerald-200
                    bg-white text-gray-900 text-sm outline-none focus:border-emerald-400
                    transition-colors placeholder:text-gray-400"
                />
                <button
                  onClick={handleBuscarRuc}
                  disabled={inputRuc.length !== 11 || loadingRuc}
                  className="w-12 h-12 rounded-xl bg-emerald-50 hover:bg-emerald-100
                    disabled:opacity-40 disabled:cursor-not-allowed
                    flex items-center justify-center text-emerald-600 transition-colors"
                >
                  {loadingRuc
                    ? <Loader2 size={18} className="animate-spin" />
                    : <Search size={18} />
                  }
                </button>
              </div>

              {resultadoRuc && (
                <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/30 space-y-3">

                  <div className="flex items-center gap-2 flex-wrap">
                    {resultadoRuc.estado && (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                        ${resultadoRuc.estado === 'ACTIVO'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-600'
                        }`}>
                        {resultadoRuc.estado}
                      </span>
                    )}
                    {resultadoRuc.condicion && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full
                        bg-blue-50 text-blue-600">
                        {resultadoRuc.condicion}
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                      RUC
                    </p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">
                      {resultadoRuc.ruc}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                      Razón social
                    </p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {resultadoRuc.nombre}
                    </p>
                  </div>

                  {resultadoRuc.nombreCompleto && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                        Nombre comercial
                      </p>
                      <p className="text-sm text-gray-700 mt-0.5">
                        {resultadoRuc.nombreCompleto}
                      </p>
                    </div>
                  )}

                  {resultadoRuc.ubicacion && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                        Domicilio fiscal
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {resultadoRuc.ubicacion}
                      </p>
                    </div>
                  )}

                  {resultadoRuc.actividades && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                        Actividad(es) económica(s)
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-line">
                        {resultadoRuc.actividades}
                      </p>
                    </div>
                  )}

                  {!modoConsulta && (
                    <button
                      onClick={() => onSeleccionar(resultadoRuc)}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600
                        hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl
                        text-sm transition-colors mt-2"
                    >
                      <CheckCircle size={16} />
                      Usar estos datos
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {tab === 'nombre' && (
            <>
              <p className="text-sm text-gray-500">
                Ingresa el{' '}
                <span className="font-semibold text-gray-700">
                  nombre o razón social
                </span>{' '}
                para buscar coincidencias en SUNAT.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputNombre}
                  onChange={(e) => setInputNombre(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBuscarNombre()}
                  placeholder="Ej: Altomayo, Backus..."
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-emerald-200
                    bg-white text-gray-900 text-sm outline-none focus:border-emerald-400
                    transition-colors placeholder:text-gray-400"
                />
                <button
                  onClick={handleBuscarNombre}
                  disabled={inputNombre.trim().length < 3 || loadingNombre}
                  className="w-12 h-12 rounded-xl bg-emerald-50 hover:bg-emerald-100
                    disabled:opacity-40 disabled:cursor-not-allowed
                    flex items-center justify-center text-emerald-600 transition-colors"
                >
                  {loadingNombre
                    ? <Loader2 size={18} className="animate-spin" />
                    : <Search size={18} />
                  }
                </button>
              </div>

              {resultadosNombre.length > 0 && (
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  {resultadosNombre.map((item, index) => {
                    const esteItem  = cargandoRuc === item.ruc
                    const otroItem  = cargandoRuc !== null && !esteItem
                    return (
                      <button
                        key={item.ruc}
                        onClick={() => !cargandoRuc && handleSeleccionarNombre(item)}
                        disabled={!!cargandoRuc}
                        className={`w-full flex items-center justify-between px-4 py-3
                          transition-colors text-left
                          ${index !== 0 ? 'border-t border-gray-50' : ''}
                          ${esteItem ? 'bg-emerald-50' : ''}
                          ${otroItem ? 'opacity-40' : 'hover:bg-emerald-50'}
                          ${cargandoRuc ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {item.nombre}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            RUC: {item.ruc}
                            {item.ubicacion && ` · ${item.ubicacion}`}
                          </p>
                        </div>
                        {esteItem ? (
                          <Loader2 size={16} className="animate-spin text-emerald-600 shrink-0 ml-2" />
                        ) : (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                            shrink-0 ml-2
                            ${item.estado === 'ACTIVO'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-600'
                            }`}>
                            {item.estado}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {errorSunat && (
            <div className="bg-red-50 border border-red-200 text-red-700
              text-sm rounded-xl px-4 py-3">
              {errorSunat}
            </div>
          )}

          {!loadingRuc && !loadingNombre && !errorSunat &&
           !resultadoRuc && resultadosNombre.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <FileText size={24} className="text-emerald-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-emerald-600">
                  Sin resultados aún
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">
                  {tab === 'ruc'
                    ? 'Busca por un RUC válido de 11 dígitos para ver la ficha SUNAT completa con todos sus datos registrales.'
                    : 'Ingresa al menos 3 caracteres para buscar coincidencias.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}