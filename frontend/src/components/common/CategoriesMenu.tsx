"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import ProductService, { type CatalogCategory } from "@/services/ProductService";

export function CategoriesMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const { data: categories = [] } = useQuery<CatalogCategory[]>({
    queryKey: ["header-categories"],
    queryFn: () => ProductService.listCategories(),
    staleTime: 60_000,
  });

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
      {/* Boton */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-white/25 text-white hover:bg-white/10 transition"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="relative block w-6 h-4">
          <span className="absolute inset-x-0 top-0 h-0.5 bg-white" />
          <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-white" />
          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white" />
        </span>
        <span className="text-sm font-medium">Categorias</span>
        <ChevronDown size={16} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown centrado bajo el boton */}
      {open && (
        <div
          role="menu"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-[340px] rounded-xl border border-[var(--color-border)] bg-white shadow-xl overflow-hidden"
        >
          <div className="px-4 py-3 border-b text-sm font-semibold text-slate-800">Todas las categorias</div>
          <ul className="max-h-[60vh] overflow-y-auto py-2">
            {categories.length === 0 && (
              <li className="px-4 py-2.5 text-[15px] text-slate-500">Sin categorias disponibles</li>
            )}
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate(`/buscar?categoryId=${cat.id}`);
                  }}
                  className="w-full text-left block px-4 py-2.5 text-[15px] text-slate-700 hover:bg-slate-50 hover:text-[var(--color-primary)]"
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

