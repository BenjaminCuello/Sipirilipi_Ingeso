"use client";

type Props = {
  title: string;
  price: string;
  img?: string;
  onOpen?: () => void;
};

export function ProductCard({ title, price, img, onOpen }: Props) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white overflow-hidden hover:shadow-md transition">
      <button
        type="button"
        onClick={onOpen}
        className="w-full text-left aspect-[4/3] bg-slate-100 grid place-items-center focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      >
        {img ? (
          <img src={img} alt={title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <span className="text-sm text-slate-500">Imagen no disponible</span>
        )}
      </button>
      <div className="p-3">
        <button
          type="button"
          onClick={onOpen}
          className="text-sm font-medium line-clamp-2 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded"
        >
          {title}
        </button>
        <div className="mt-2 text-[var(--color-primary)] font-semibold">{price}</div>
        <button className="mt-3 w-full h-10 rounded-lg border border-[var(--color-border)] hover:bg-slate-50">
          Anadir al carrito
        </button>
      </div>
    </div>
  );
}
