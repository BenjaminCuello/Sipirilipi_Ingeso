"use client";

import { useEffect, useState } from "react";
import ProductService from "@/services/ProductService";
import { useCartStore, type CartState, type CartProduct } from "@/store/cartStore";

const slides = [
  {
    src: "/banners/1.png",
    alt: "Banner Asus TUF Gaming A16",
  },
];

export function HeroCarousel() {
  const [i, setI] = useState(0);

  const addItem = useCartStore((state: CartState) => state.addItem);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setI((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, []);

  const go = (n: number) => {
    if (slides.length <= 1) return;
    setI((p) => (p + n + slides.length) % slides.length);
  };

  const handleBannerClick = async () => {
    try {
      const result = await ProductService.search({ q: "asus tuf gaming a16", limit: 1 });
      const product = result.data[0];
      if (!product) {
        return;
      }

      const cartProduct: CartProduct = {
        id: product.id,
        name: product.name,
        price_cents: product.price_cents,
        image: product.thumbUrl || product.imageUrl || null,
        stock: product.stock,
      };

      addItem(cartProduct, 1);
    } catch (error) {
      console.error("Error al agregar producto desde el banner:", error);
    }
  };

  return (
    <section className="w-full bg-white">
      <div className="w-full max-w-[1400px] mx-auto px-6 py-4">
        <div className="relative h-[280px] sm:h-[360px] rounded-2xl overflow-hidden bg-gradient-to-r from-slate-200 to-slate-100">
          {/* slide */}
          {slides[i]?.src && (
            <img
              src={slides[i].src}
              alt={slides[i].alt}
              className="absolute inset-0 h-full w-full object-cover cursor-pointer"
              onClick={handleBannerClick}
            />
          )}

          {/* flechas */}
          {slides.length > 1 && (
            <>
              <button
                onClick={() => go(-1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 text-white grid place-items-center hover:bg-black/40"
                aria-label="Anterior"
              >
                {"<"}
              </button>
              <button
                onClick={() => go(1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 text-white grid place-items-center hover:bg-black/40"
                aria-label="Siguiente"
              >
                {">"}
              </button>
            </>
          )}

          {/* puntos */}
          {slides.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setI(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    i === idx ? "w-8 bg-white" : "w-2.5 bg-white/60"
                  }`}
                  aria-label={`Ir a slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
