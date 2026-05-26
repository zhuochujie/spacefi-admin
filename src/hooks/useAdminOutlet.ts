import { useOutletContext } from 'react-router'

type AdminOutletContext = {
  token: string
}

export function useAdminOutlet() {
  return useOutletContext<AdminOutletContext>()
}
