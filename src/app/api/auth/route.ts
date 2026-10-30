export const runtime = 'nodejs'

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const password = body.password

    const masterPassword = process.env.ADMIN_PASSWORD || 'taply2026'

    if (password === masterPassword) {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    return NextResponse.json({ success: false, error: 'Contraseña incorrecta' }, { status: 401 })
  } catch {
    return NextResponse.json({ success: false, error: 'Solicitud inválida' }, { status: 400 })
  }
}
