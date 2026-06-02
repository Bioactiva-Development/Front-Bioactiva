import { Suspense } from 'react'
import { AcceptInvitationForm } from '@/components/modules/auth/AcceptInvitationForm'

export const metadata = {
    title: 'Aceptar invitación | BioActiva CRM',
}

export default function AcceptInvitationPage() {
    return (
        <Suspense>
            <AcceptInvitationForm />
        </Suspense>
    )
}
