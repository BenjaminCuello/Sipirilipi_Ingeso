"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const CATEGORIES = [
    "Computadores y Notebooks",
    "Partes y Piezas / Componentes",
    "Tarjetas Gráficas (GPU)",
    "Almacenamiento (SSD / HDD)",
    "Memorias RAM",
    "Fuentes de Poder (PSU)",
    "Placas Madres",
    "Gabinetes y Ventilación",
    "Monitores",
    "Periféricos (Teclado / Mouse / Audio)",
    "Refrigeración (Aire / Líquida)",
    "Redes (Routers / Mesh / Switches)",
];

export function CategoriesMenu() {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement | null>(null);

    // cerrar al hacer click fuera
    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!wrapRef.current) return;
            if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    return (
        <div ref={wrapRef} className="relative">
            {/* Botón */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-md
                   border border-white/25 text-white hover:bg-white/10 transition"
                aria-haspopup="menu"
                aria-expanded={open}
            >
        <span className="relative block w-6 h-4">
          <span className="absolute inset-x-0 top-0 h-0.5 bg-white"></span>
          <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-white"></span>
          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white"></span>
        </span>
                <span className="text-sm font-medium">Categorías</span>
                <ChevronDown size={16} className={`transition ${open ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown centrado bajo el botón */}
            {open && (
                <div
                    role="menu"
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50
                     w-[340px] rounded-xl border border-[var(--color-border)]
                     bg-white shadow-xl overflow-hidden"
                >
                    <div className="px-4 py-3 border-b text-sm font-semibold text-slate-800">
                        Todas las categorías
                    </div>
                    <ul className="max-h-[60vh] overflow-y-auto py-2">
                        {CATEGORIES.map((c) => (
                            <li key={c}>
                                <a
                                    href="#"
                                    className="block px-4 py-2.5 text-[15px] text-slate-700
                             hover:bg-slate-50 hover:text-[var(--color-primary)]"
                                >
                                    {c}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

