"use client";

import { ChakraProvider } from "@/providers/ChakraProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "@/config/wagmi";
import { useState, useEffect } from "react";
import { Poppins } from "next/font/google";
import { sdk } from "@/lib/farcaster";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    const init = async () => {
      try {
        await sdk.actions.ready();
      } catch (error) {
        console.error("Error initializing Farcaster:", error);
      }
    };

    init();
  }, []);

  return (
    <html lang="en" className={poppins.className}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </head>
      <body>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <ChakraProvider>{children}</ChakraProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
