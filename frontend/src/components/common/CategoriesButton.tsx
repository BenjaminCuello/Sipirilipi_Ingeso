"use client";

import Link from "next/link";

export function CategoriesButton() {
    return (
        <Link
            href="/categorias"
            aria-label="Ver categorías"
            className="group inline-flex items-center gap-3 h-12 px-4 rounded-md
                 border border-white/20 text-white
                 hover:bg-white/10 transition"
        >
            {/* Icono hamburguesa */}
            <span className="relative block w-7 h-5">
        <span className="absolute inset-x-0 top-0 h-0.5 bg-white transition-transform duration-300 group-hover:translate-x-1" />
        <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-white transition-all duration-300 group-hover:scale-x-75" />
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white transition-transform duration-300 group-hover:-translate-x-1" />
      </span>

            {/* Texto dentro del mismo botón */}
            <span className="text-sm font-medium">Categorías</span>
        </Link>
    );
}
