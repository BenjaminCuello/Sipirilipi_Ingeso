"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
    { src: "/banners/1.jpg", alt: "Banner 1" },
    { src: "/banners/2.jpg", alt: "Banner 2" },
    { src: "/banners/3.jpg", alt: "Banner 3" },
];

export function HeroCarousel() {
    const [i, setI] = useState(0);

    // autoplay suave (puedes quitarlo si no lo quieres)
    useEffect(() => {
        const id = setInterval(() => setI((p) => (p + 1) % slides.length), 5000);
        return () => clearInterval(id);
    }, []);

    const go = (n: number) =>
        setI((p) => (p + n + slides.length) % slides.length);

    return (
        <section className="w-full bg-white">
            <div className="w-full max-w-[1400px] mx-auto px-6 py-4">
                <div className="relative h-[280px] sm:h-[360px] rounded-2xl overflow-hidden bg-gradient-to-r from-slate-200 to-slate-100">
                    {/* slide */}
                    {slides[i]?.src && (
                        <Image
                            src={slides[i].src}
                            alt={slides[i].alt}
                            fill
                            className="object-cover"
                            priority
                        />
                    )}

                    {/* flechas */}
                    <button
                        onClick={() => go(-1)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 text-white grid place-items-center hover:bg-black/40"
                        aria-label="Anterior"
                    >
                        ‹
                    </button>
                    <button
                        onClick={() => go(1)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 text-white grid place-items-center hover:bg-black/40"
                        aria-label="Siguiente"
                    >
                        ›
                    </button>

                    {/* puntos */}
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
                </div>
            </div>
        </section>
    );
}
