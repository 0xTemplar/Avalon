import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter, Space_Grotesk } from "next/font/google";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <Component {...pageProps} />
    </div>
  );
}
