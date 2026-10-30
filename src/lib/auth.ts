import { supabase } from '@/lib/supabase'

export async function loginWithSupabase(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Error al conectar' }
  }
}

export async function logout(): Promise<void> {
  try {
    await supabase.auth.signOut()
    localStorage.removeItem('taply_authenticated')
    localStorage.removeItem('taply_auth_expiry')
  } catch {}
}

export async function changePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (newPassword.length < 6) return { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres.' }
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Error al actualizar contraseña' }
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch {
    return null
  }
}
