import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UsuarioItem } from '@/components/modules/control-acceso/UsuarioItem'
import { Invitacion } from '@/types/usuario.types'
import { EstadoToken, RolUsuario } from '@/types/enums'

const baseInvite: Invitacion = {
  id: 1,
  correo: 'usuario@test.com',
  rol: RolUsuario.Trabajador,
  estado: EstadoToken.Pendiente,
  expires_at: '2025-04-15T10:00:00Z',
  consumed_at: null,
  created_at: '2025-03-15T10:00:00Z',
}

describe('modules/control-acceso/UsuarioItem', () => {
  it('renders email', () => {
    render(<UsuarioItem invitacion={baseInvite} onRevoke={jest.fn()} isRevoking={false} />)
    expect(screen.getByText('usuario@test.com')).toBeInTheDocument()
  })

  it('renders first character as avatar', () => {
    render(<UsuarioItem invitacion={baseInvite} onRevoke={jest.fn()} isRevoking={false} />)
    expect(screen.getByText('U')).toBeInTheDocument()
  })

  it('shows Pendiente badge', () => {
    render(<UsuarioItem invitacion={baseInvite} onRevoke={jest.fn()} isRevoking={false} />)
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
  })

  it('shows Aceptada badge for consumed', () => {
    const consumed: Invitacion = { ...baseInvite, estado: EstadoToken.Consumido, consumed_at: '2025-03-20T10:00:00Z' }
    render(<UsuarioItem invitacion={consumed} onRevoke={jest.fn()} isRevoking={false} />)
    expect(screen.getByText('Aceptada')).toBeInTheDocument()
  })

  it('shows Expirada badge for expired', () => {
    const expired: Invitacion = { ...baseInvite, estado: EstadoToken.Expirado }
    render(<UsuarioItem invitacion={expired} onRevoke={jest.fn()} isRevoking={false} />)
    expect(screen.getByText('Expirada')).toBeInTheDocument()
  })

  it('shows Revocada badge for revoked', () => {
    const revoked: Invitacion = { ...baseInvite, estado: EstadoToken.Revocado }
    render(<UsuarioItem invitacion={revoked} onRevoke={jest.fn()} isRevoking={false} />)
    expect(screen.getByText('Revocada')).toBeInTheDocument()
  })

  it('shows Trabajador rol badge', () => {
    render(<UsuarioItem invitacion={baseInvite} onRevoke={jest.fn()} isRevoking={false} />)
    expect(screen.getByText('Trabajador')).toBeInTheDocument()
  })

  it('shows Administrador rol badge', () => {
    const adminInvite: Invitacion = { ...baseInvite, rol: RolUsuario.Administrador }
    render(<UsuarioItem invitacion={adminInvite} onRevoke={jest.fn()} isRevoking={false} />)
    expect(screen.getByText('Administrador')).toBeInTheDocument()
  })

  it('shows revoke button for pending invitations', () => {
    render(<UsuarioItem invitacion={baseInvite} onRevoke={jest.fn()} isRevoking={false} />)
    expect(screen.getByTitle('Revocar invitación')).toBeInTheDocument()
  })

  it('hides revoke button for non-pending invitations', () => {
    const consumed: Invitacion = { ...baseInvite, estado: EstadoToken.Consumido }
    render(<UsuarioItem invitacion={consumed} onRevoke={jest.fn()} isRevoking={false} />)
    expect(screen.queryByTitle('Revocar invitación')).not.toBeInTheDocument()
  })

  it('calls onRevoke when revoke button is clicked', async () => {
    const onRevoke = jest.fn()
    render(<UsuarioItem invitacion={baseInvite} onRevoke={onRevoke} isRevoking={false} />)
    await userEvent.click(screen.getByTitle('Revocar invitación'))
    expect(onRevoke).toHaveBeenCalledWith(1)
  })

  it('disables revoke button while revoking', () => {
    render(<UsuarioItem invitacion={baseInvite} onRevoke={jest.fn()} isRevoking={true} />)
    const btn = screen.getByTitle('Revocar invitación')
    expect(btn).toBeDisabled()
    expect(btn.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('formats created_at date', () => {
    render(<UsuarioItem invitacion={baseInvite} onRevoke={jest.fn()} isRevoking={false} />)
    expect(screen.getByText(/15 mar/i)).toBeInTheDocument()
  })

  it('shows expiration date for pending invitations', () => {
    render(<UsuarioItem invitacion={baseInvite} onRevoke={jest.fn()} isRevoking={false} />)
    expect(screen.getByText(/15 abr/i)).toBeInTheDocument()
  })

  it('shows acceptance date for consumed invitations', () => {
    const consumed: Invitacion = { ...baseInvite, estado: EstadoToken.Consumido, consumed_at: '2025-03-20T10:00:00Z' }
    render(<UsuarioItem invitacion={consumed} onRevoke={jest.fn()} isRevoking={false} />)
    expect(screen.getByText(/20 mar/i)).toBeInTheDocument()
  })
})
