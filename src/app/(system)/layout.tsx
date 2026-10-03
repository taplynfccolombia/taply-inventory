import { AuthGuard } from '@/components/AuthGuard'

export default function SystemLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  )
}
