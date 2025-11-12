"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Loader2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LoginSheet } from "@/components/auth/LoginSheet";
import { CategoriesMenu } from "@/components/common/CategoriesMenu";
import { isAuthenticated, logout, hasRole } from "@/lib/auth";
import { useCartStore } from "@/store/cartStore";
import ProductService, { type CatalogProduct } from "@/services/ProductService";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { MiniCart } from "@/components/cart/MiniCart";

type HeaderProps = {
  initialQuery?: string;
};

export function Header({ initialQuery = "" }: HeaderProps) {
  const [openLogin, setOpenLogin] = useState(false);
  const [search, setSearch] = useState(initialQuery);
  const [focused, setFocused] = useState(false);
  const loginAnchorRef = useRef<HTMLDivElement | null>(null);
  const inputWrapperRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const authed = isAuthenticated();
  const syncFromServer = useCartStore((s) => s.syncFromServer);
  const serverLoaded = useCartStore((s) => s.serverLoaded ?? false);
  const canManage = hasRole("ADMIN", "SELLER");

  useEffect(() => {
    setSearch(initialQuery);
  }, [initialQuery]);

  // sync carrito con backend si hay sesion y no se ha hecho
  useEffect(() => {
    if (authed && !serverLoaded) {
      void syncFromServer();
    }
  }, [authed, serverLoaded, syncFromServer]);

  const debouncedSearch = useDebouncedValue(search, 250);

  const { data: suggestions = [], isFetching: loadingSuggestions } = useQuery({
    queryKey: ["search-suggestions", debouncedSearch],
    queryFn: () => ProductService.suggestions(debouncedSearch.trim(), 5),
    enabled: debouncedSearch.trim().length > 1,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!inputWrapperRef.current) return;
      if (!inputWrapperRef.current.contains(event.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setFocused(false);
  }, [location.key]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = search.trim();
    if (!value) return;
    navigate(`/buscar?q=${encodeURIComponent(value)}`);
    setFocused(false);
  };

  const handleSuggestionClick = (product: CatalogProduct) => {
    setFocused(false);
    setSearch(product.name);
    navigate(`/producto/${product.id}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-header)] text-white">
      <div className="w-full max-w-[1400px] mx-auto px-6 py-3 flex items-center gap-6">
        <div className="shrink-0">
          <Link to="/" className="block" aria-label="Ir a inicio">
            <img src="/logo.png" alt="Sipirilipi" width={140} height={36} className="h-10 w-auto" />
          </Link>
        </div>

        <div className="shrink-0 ml-15">
          <CategoriesMenu />
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex justify-center">
          <div ref={inputWrapperRef} className="relative w-full max-w-[34rem]">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="Buscar productos..."
              className="shadow-lg focus:border-2 border-gray-300 px-5 py-2 rounded-xl w-full transition-all focus:w-full outline-none bg-white text-gray-900 placeholder-gray-400"
            />
            <button
              type="submit"
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label="Buscar"
            >
              <svg className="w-5 h-5" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" fill="none">
                <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            </button>

            {focused && (
              <div className="absolute left-0 right-0 mt-2 bg-white text-gray-900 rounded-xl border border-gray-200 shadow-lg">
                {loadingSuggestions ? (
                  <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Buscando sugerencias...
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-600">Escribe al menos dos letras para ver sugerencias.</div>
                ) : (
                  <ul className="py-2">
                    {suggestions.map((product) => (
                      <li key={product.id}>
                        <button
                          type="button"
                          onClick={() => handleSuggestionClick(product)}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-100 transition flex flex-col"
                        >
                          <span className="text-sm font-medium text-gray-900">{product.name}</span>
                          {product.category?.name && (
                            <span className="text-xs text-gray-500">{product.category.name}</span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-500">
                  Presiona Enter para ver todos los resultados.
                </div>
              </div>
            )}
          </div>
        </form>

        <nav className="shrink-0 flex items-center gap-4">
          {authed ? (
            <>
              {canManage && (
                <button
                  onClick={() => navigate('/panel/products')}
                  className="h-10 px-4 rounded-[var(--radius-lg)] text-white border border-white/40 hover:bg-white/10 transition"
                >
                  <div className="h-9 flex items-center justify-center gap-2">
                    <span className="text-sm font-medium">Ir a productos</span>
                  </div>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="h-10 px-4 rounded-[var(--radius-lg)] text-white border border-white/40 hover:bg-white/10 transition"
              >
                <div className="h-9 flex items-center justify-center gap-2">
                  <User className="text-white" size={18} />
                  <span className="text-sm font-medium">Cerrar sesion</span>
                </div>
              </button>
            </>
          ) : (
            <div className="relative" ref={loginAnchorRef}>
              <button
                onClick={() => setOpenLogin((v) => !v)}
                className="h-10 px-4 rounded-[var(--radius-lg)] text-white border border-white/40 hover:bg-white/10 transition"
              >
                <div className="h-9 flex items-center justify-center gap-2">
                  <User className="text-white" size={18} />
                  <span className="text-sm font-medium">Iniciar sesion</span>
                </div>
              </button>

              <LoginSheet open={openLogin} onClose={() => setOpenLogin(false)} anchorRef={loginAnchorRef} />
            </div>
          )}

          <MiniCart />
        </nav>
      </div>
    </header>
  );
}
