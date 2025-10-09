"use client";

type Props = {
  title: string;
  price: string;
  img?: string;
};

export function ProductCard({ title, price, img }: Props) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white overflow-hidden hover:shadow-md transition">
      <div className="aspect-[4/3] bg-slate-100 grid place-items-center">
        {/* si no hay imagen todavía */}
        {img ? (
          <img src={img} alt={title} className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm text-slate-500">Imagen</span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium line-clamp-2">{title}</h3>
        <div className="mt-2 text-[var(--color-primary)] font-semibold">{price}</div>
        <button className="mt-3 w-full h-10 rounded-lg border border-[var(--color-border)] hover:bg-slate-50">Añadir al carrito</button>
      </div>
    </div>
  );
}

