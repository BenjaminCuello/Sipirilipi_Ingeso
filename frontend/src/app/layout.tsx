import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
const fontSans = Inter({ subsets: ["latin"] });
import { Header } from "@/components/common/Header";
import { CategoriesButton } from "@/components/common/CategoriesButton";
export const metadata: Metadata = {
    title: "sipirilipi",
    description: "Ecommerce de componentes y PCs",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
        <body className={`${fontSans.className} bg-bg text-fg`}>
        <Header />
        <CategoriesButton />
        <main className="container mx-auto px-4 py-6">{children}</main>
        </body>
        </html>
    );
}
