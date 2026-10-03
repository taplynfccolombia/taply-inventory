// Contraseña por defecto del sistema
const DEFAULT_PASSWORD = 'taply2026'

function getPassword(): string {
  if (typeof window === 'undefined') return DEFAULT_PASSWORD
  return localStorage.getItem('taply_custom_password') ?? DEFAULT_PASSWORD
}

export function checkAuth(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('taply_auth') === 'true'
}

export function login(password: string): boolean {
  if (password === getPassword()) {
    localStorage.setItem('taply_auth', 'true')
    return true
  }
  return false
}

export function logout(): void {
  localStorage.removeItem('taply_auth')
}
