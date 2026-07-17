import type { Metadata, Viewport } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const publicUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://colmeiaeducacao.com";

export const metadata: Metadata = {
  metadataBase: new URL(publicUrl),
  title: {
    default: "Colmeia Educação Financeira | Planejador",
    template: "%s | Colmeia Educação Financeira",
  },
  description:
    "Planejador financeiro local-first para organizar contas, gastos, orçamentos e metas com clareza.",
  applicationName: "Colmeia Educação Financeira",
  manifest: basePath + "/manifest.webmanifest",
  icons: {
    icon: [
      {
        url: basePath + "/favicon.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
      {
        url: basePath + "/icon-192.png",
        type: "image/png",
        sizes: "192x192",
      },
    ],
    shortcut: basePath + "/favicon.svg",
    apple: [
      {
        url: basePath + "/icon-192.png",
        type: "image/png",
        sizes: "192x192",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Colmeia",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "Colmeia Educação Financeira",
    description: "Seu dinheiro, com mais clareza.",
    images: [
      {
        url: basePath + "/og.png",
        width: 1536,
        height: 1024,
        alt: "Colmeia Educação Financeira — seu dinheiro, com mais clareza.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Colmeia Educação Financeira",
    description: "Seu dinheiro, com mais clareza.",
    images: [basePath + "/og.png"],
  },
  other: {
    "theme-color": "#F8BF4D",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F8BF4D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
