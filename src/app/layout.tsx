import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SYNC 2026",
  description:
    "Companheiro do participante no SYNC 2026 — Conferência Universitária de Empreendedorismo. 22 de agosto, iFood HQ.",
  icons: {
    icon: "/brand/symbol.png",
    apple: "/brand/symbol.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#18212B",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={GeistSans.variable}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
