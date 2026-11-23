import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Commander | Fleurs Gourmandes 54',
  description: 'Commandez votre bouquet de cupcakes.'
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
