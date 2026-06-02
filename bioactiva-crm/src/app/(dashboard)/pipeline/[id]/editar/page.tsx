'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function LeadEditarRedirectPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()

  useEffect(() => {
    if (!params.id) return
    router.replace(`/pipeline/${params.id}?accion=editar`)
  }, [params.id, router])

  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex items-center gap-3 text-gray-400">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Abriendo edición...</span>
      </div>
    </div>
  )
}
