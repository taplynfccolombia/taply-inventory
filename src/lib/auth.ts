const DEFAULT_PASSWORD = 'taply2026'
const STORAGE_KEY = 'taply_custom_password'
const AUTH_KEY = 'taply_authenticated'
const AUTH_EXPIRY_KEY = 'taply_auth_expiry'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 días en ms

function getPassword(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_PASSWORD
  } catch {
    return DEFAULT_PASSWORD
  }
}

export function login(password: string): boolean {
  if (password === getPassword()) {
    try {
      const expiry = Date.now() + SESSION_DURATION
      localStorage.setItem(AUTH_KEY, 'true')
      localStorage.setItem(AUTH_EXPIRY_KEY, String(expiry))
    } catch {}
    return true
  }
  return false
}

export function checkAuth(): boolean {
  try {
    const auth = localStorage.getItem(AUTH_KEY)
    const expiry = localStorage.getItem(AUTH_EXPIRY_KEY)
    if (auth !== 'true') return false
    if (expiry && Date.now() > Number(expiry)) {
      logout()
      return false
    }
    // Renovar sesión si está activo
    const newExpiry = Date.now() + SESSION_DURATION
    localStorage.setItem(AUTH_EXPIRY_KEY, String(newExpiry))
    return true
  } catch {
    return false
  }
}

export function logout(): void {
  try {
    localStorage.removeItem(AUTH_KEY)
    localStorage.removeItem(AUTH_EXPIRY_KEY)
  } catch {}
}

export function changePassword(currentPassword: string, newPassword: string): { success: boolean; error?: string } {
  if (currentPassword !== getPassword()) return { success: false, error: 'La contraseña actual es incorrecta.' }
  if (newPassword.length < 6) return { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres.' }
  try {
    localStorage.setItem(STORAGE_KEY, newPassword)
    return { success: true }
  } catch {
    return { success: false, error: 'Error al guardar la contraseña.' }
  }
}

export function getPasswordStatus(): { isDefault: boolean; hasExpiry: boolean; expiryDate: Date | null } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const expiry = localStorage.getItem(AUTH_EXPIRY_KEY)
    return {
      isDefault: !stored || stored === DEFAULT_PASSWORD,
      hasExpiry: !!expiry,
      expiryDate: expiry ? new Date(Number(expiry)) : null,
    }
  } catch {
    return { isDefault: true, hasExpiry: false, expiryDate: null }
  }
}
