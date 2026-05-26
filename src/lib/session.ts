const TOKEN_KEY = 'admin-web-token'
export const AUTH_EXPIRED_EVENT = 'admin-web-auth-expired'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) ?? ''
}

export function storeToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function notifyAuthExpired() {
  clearStoredToken()
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
}
