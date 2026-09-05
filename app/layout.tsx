import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tidy Tiling Ltd | Professional Tiling Services',
  description: 'Professional bathroom, kitchen, floor, wall and renovation tiling services in New Zealand.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
