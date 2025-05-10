import { CreatePitchDeck } from "@/app/components/createPitchdeck"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme_provider"

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <main>
        <CreatePitchDeck />
        <Toaster />
      </main>
    </ThemeProvider>
  )
}

