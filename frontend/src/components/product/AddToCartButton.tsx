"use client";

import { type ReactNode, useMemo } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCartStore, type CartProduct, type CartState, type CartItem } from "@/store/cartStore";

type Props = {
  product: CartProduct;
  quantity?: number;
  className?: string;
  variant?: "primary" | "outline" | "ghost";
  children?: ReactNode;
};

export function AddToCartButton({
  product,
  quantity = 1,
  className,
  variant = "outline",
  children,
}: Props) {
  const addItem = useCartStore((state: CartState) => state.addItem);
  const currentQuantity = useCartStore((state: CartState) => {
    const entry = state.items.find((item: CartItem) => item.id === product.id);
    return entry?.quantity ?? 0;
  });

  const label: ReactNode = useMemo(() => {
    if (children != null) return children;
    if (currentQuantity > 0) {
      return `En el carrito (${currentQuantity})`;
    }
    return "Agregar al carrito";
  }, [children, currentQuantity]);

  const icon = currentQuantity > 0 ? <Check size={16} className="mr-2" /> : <ShoppingCart size={16} className="mr-2" />;

  return (
    <Button
      type="button"
      onClick={() => addItem(product, quantity)}
      className={className}
      variant={variant}
    >
      {icon}
      {label}
    </Button>
  );
}
