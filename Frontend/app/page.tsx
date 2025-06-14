import ChessGame from "@/components/chess-game"
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <main className="min-h-screen bg-gray-900 transition-colors duration-300">
        <ChessGame />
      </main>
    </ThemeProvider>
  )
}
