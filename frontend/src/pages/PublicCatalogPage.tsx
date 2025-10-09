import { Header } from "@/components/common/Header";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { ProductGrid } from "@/components/home/ProductGrid";

export default function PublicCatalogPage() {
  return (
    <main className="min-h-dvh bg-white">
      <Header />
      <HeroCarousel />
      <ProductGrid />
    </main>
  );
}

