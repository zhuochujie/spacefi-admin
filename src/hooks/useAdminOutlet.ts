import type { AdminProfile } from '../api'
import { useOutletContext } from 'react-router'

type AdminOutletContext = {
  token: string
  profile: AdminProfile
}

export function useAdminOutlet() {
  return useOutletContext<AdminOutletContext>()
}
