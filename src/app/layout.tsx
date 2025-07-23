import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgroConecta - Marketplace Agrícola Colombiano",
  description: "Conectando directamente campesinos con compradores. Elimina intermediarios y promueve el comercio justo en Colombia.",
  keywords: "agricultura, campesinos, marketplace, Colombia, productos agrícolas, comercio justo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
