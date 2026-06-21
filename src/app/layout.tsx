import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
});

export const metadata: Metadata = {
  title: "Minha Figurinha da Copa 2026",
  description:
    "Crie uma figurinha exclusiva e personalizada no estilo Copa do Mundo 2026 e veja o resultado antes de pagar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${anton.variable} bg-site text-slate-950 antialiased`}>
        {children}
      </body>
    </html>
  );
}
