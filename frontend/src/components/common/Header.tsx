"use client";

import { User, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { LoginSheet } from "@/components/auth/LoginSheet";
import { CategoriesButton } from "@/components/common/CategoriesButton";

export function Header() {
    const [openLogin, setOpenLogin] = useState(false);
    const loginAnchorRef = useRef<HTMLDivElement | null>(null);

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-[var(--color-header)] text-white">
            {/* contenedor más compacto */}
            <div className="w-full max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between gap-6">
                {/* logo */}
                <div className="shrink-0">
                    <Link href="/" className="block" aria-label="Ir a inicio">
                        <Image
                            src="/logo.png"
                            alt="Sipirilipi"
                            width={140}
                            height={36}
                            className="h-10 w-auto"
                            priority
                        />
                    </Link>
                </div>

                {/* buscador minimal */}
                <div className="flex-1 flex justify-center">
                    <div className="relative">
                        <input
                            type="search"
                            name="search"
                            placeholder="Buscar..."
                            className="shadow-lg focus:border-2 border-gray-300 px-5 py-2
                         rounded-xl w-[35rem] transition-all focus:w-[50rem]
                         outline-none bg-white text-gray-900 placeholder-gray-400"
                        />
                        <svg
                            className="w-5 h-5 absolute top-2.5 right-3 text-gray-500"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path
                                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                </div>

                {/* acciones derecha */}
                <nav className="shrink-0 flex items-center gap-4 ml-6">
                    <div className="mr-1">
                        <CategoriesButton />
                    </div>

                    {/* Login */}
                    <div className="relative" ref={loginAnchorRef}>
                        <button
                            onClick={() => setOpenLogin((v) => !v)}
                            className="h-12 w-[150px] rounded-[var(--radius-lg)]
                         text-white border border-white/40
                         hover:bg-white/10 transition"
                        >
                            <div className="h-11 w-[146px] rounded-[12px] flex items-center justify-center gap-2">
                                <User className="text-white" size={18} />
                                <span className="text-sm font-medium">Iniciar sesión</span>
                            </div>
                        </button>

                        <LoginSheet
                            open={openLogin}
                            onClose={() => setOpenLogin(false)}
                            anchorRef={loginAnchorRef}
                        />
                    </div>

                    {/* Carrito */}
                    <Link
                        href={{ pathname: "/carrito" }}
                        className="h-10 w-10 grid place-items-center rounded-full hover:bg-white/10"
                        aria-label="Carrito"
                    >
                        <ShoppingCart />
                    </Link>

                </nav>
            </div>
        </header>
    );
}


