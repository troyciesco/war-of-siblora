import "../styles/index.scss"
import type { AppProps } from "next/app"
import { AuthContextProvider } from "~/contexts/useAuth"

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthContextProvider>
      <Component {...pageProps} />
    </AuthContextProvider>
  )
}

export default MyApp
