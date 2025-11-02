import { Header } from "@/components/common/Header";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { ProductGrid } from "@/components/home/ProductGrid";

export default function PublicCatalogPage() {
  return (
    <main className="min-h-dvh bg-white">
      <Header />
      <HeroCarousel />
      <section className="w-full bg-white">
        <div className="w-full max-w-[1400px] mx-auto px-6 py-6">
          <ProductGrid />
        </div>
      </section>
    </main>
  );
}
