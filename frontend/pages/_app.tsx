import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Inter, Space_Grotesk } from 'next/font/google';
import { PrivyProvider } from '@privy-io/react-auth';
import { etherlinkTestnet } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // Create wagmi config
  const wagmiConfig = React.useMemo(() => {
    return createConfig({
      chains: [etherlinkTestnet],
      transports: {
        [etherlinkTestnet.id]: http(),
      },
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
          config={{
            appearance: {
              theme: 'dark',
              accentColor: '#00ff88',
              // logo: 'https://i.imghippo.com/files/LO2505Ww.pn',
            },

            embeddedWallets: {
              createOnLogin: 'users-without-wallets',
            },

            supportedChains: [etherlinkTestnet],

            loginMethods: ['email', 'google', 'twitter', 'wallet'],
          }}
        >
          <div className={`${inter.variable} ${spaceGrotesk.variable}`}>
            <Component {...pageProps} />
            <ToastContainer
              position="top-right"
              autoClose={false}
              newestOnTop={false}
              closeOnClick={true}
              rtl={false}
              pauseOnFocusLoss={false}
              draggable={false}
              pauseOnHover={false}
              hideProgressBar={true}
            />
          </div>
        </PrivyProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
