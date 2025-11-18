import { HeroCarousel } from "@/components/home/HeroCarousel";
import { ProductGrid } from "@/components/home/ProductGrid";
import { Footer } from "@/components/common/Footer";

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <ProductGrid />
      <Footer />
    </>
  );
}
