'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function Redirector() {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const token = searchParams.get('token')
        router.replace(token ? `/accept-invitation?token=${encodeURIComponent(token)}` : '/accept-invitation')
    }, [router, searchParams])

    return null
}

export default function ActivatePage() {
    return <Suspense><Redirector /></Suspense>
}
