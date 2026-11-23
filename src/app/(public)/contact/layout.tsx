import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact | Fleurs Gourmandes 54',
  description: 'Contactez-nous pour toute demande.'
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
