import { Poppins } from "next/font/google";
import { getMetadata } from "@/lib/getMetadata";
import Providers from "./components/Providers";
import Script from "next/script";

const GA_ID = "G-GRSTHJ7MXH";

const _metadataInfo = {
  title: "Basenames | Register your .base.eth name for Warplet",
  description:
    "Register your .base.eth name easily through this Farcaster mini-app",
  images: "https://basenames.apoorv.xyz/opengraph-image.png",
  icon: "https://basenames.apoorv.xyz/logo.png",
};

const frame = {
  version: "next",
  imageUrl: "https://basenames.apoorv.xyz/opengraph-image.png",
  button: {
    title: "Register Basename",
    action: {
      type: "launch_frame",
      name: "Basenames",
      url: "https://basenames.apoorv.xyz",
      splashImageUrl: "https://basenames.apoorv.xyz/logo.png",
      splashBackgroundColor: "#2563EB",
    },
  },
};

export const metadata = {
  ...getMetadata(_metadataInfo),
  other: {
    "fc:frame": JSON.stringify(frame),
  },
};

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
  return (
    <html lang="en" className={poppins.className}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
