import type { ReactNode } from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
const fontSans = Inter({ subsets: ["latin"] });
// Cambiado alias "@" por ruta relativa
import { Header } from "../components/common/Header";

export const metadata: Metadata = {
    title: "sipirilipi",
    description: "Ecommerce de componentes y PCs",
};
export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="es">
        <body className={`${fontSans.className} bg-bg text-fg`}>
        <Header />
        <main className="container mx-auto px-4 py-6">{children}</main>
        </body>
        </html>
    );
}
