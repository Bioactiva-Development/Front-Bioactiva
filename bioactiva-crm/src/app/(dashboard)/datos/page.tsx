'use client'

import { useState } from 'react'
import { ImportarStepper } from '@/components/modules/datos/ImportarStepper'
import { ExportarForm } from '@/components/modules/datos/ExportarForm'
import { PageHeader } from '@/components/layout/PageHeader'

type Tab = 'importar' | 'exportar'

export default function DatosPage() {
    const [tab, setTab] = useState<Tab>('importar')

    return (
        <div className="space-y-6">
            <PageHeader
                titulo="Importar / Exportar"
                descripcion="Gestiona cargas desde Excel y exportaciones filtradas desde una sola vista."
            />

            {/* Tabs */}
            <div className="inline-flex items-center bg-gray-100 rounded-xl p-1 gap-1">
                <button
                    onClick={() => setTab('importar')}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'importar'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Importar
                </button>
                <button
                    onClick={() => setTab('exportar')}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'exportar'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Exportar
                </button>
            </div>

            {/* Contenido */}
            {tab === 'importar' && <ImportarStepper />}
            {tab === 'exportar' && <ExportarForm />}
        </div>
    )
}
