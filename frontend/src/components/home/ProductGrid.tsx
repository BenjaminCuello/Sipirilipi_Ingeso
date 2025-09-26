"use client";
import { ProductCard } from "./ProductCard";

const MOCK = [
    { title: "Mouse Logitech G203 Lightsync RGB", price: "$19.990" },
    { title: "Teclado Mecánico Redragon Kumara K552", price: "$24.990" },
    { title: "SSD NVMe 1TB PCIe 3.0", price: "$46.990" },
    { title: "Monitor 24\" 75Hz IPS", price: "$99.990" },
    { title: "Auriculares JBL Tune 510BT", price: "$29.990" },
    { title: "Gabinete ATX con vidrio templado", price: "$54.990" },
];

export function ProductGrid() {
    return (
        <section className="w-full bg-white">
            <div className="w-full max-w-[1400px] mx-auto px-6 py-6">
                <h2 className="text-xl font-semibold mb-4">Recomendados</h2>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {MOCK.map((p) => (
                        <ProductCard key={p.title} title={p.title} price={p.price} />
                    ))}
                </div>
            </div>
        </section>
    );
}
