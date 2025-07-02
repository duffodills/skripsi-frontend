import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "src/components/Navbar";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      {/* Terapkan font Inter ke seluruh aplikasi */}
      <div className={inter.className}>
        <Navbar />
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}
