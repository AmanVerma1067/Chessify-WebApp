import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Chessify AI',
  description: 'A Chess-Engine Powered by AI',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
          <head>
        <link rel="icon" href="/favicon.ico" />
        {/* Optional other icon types */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
