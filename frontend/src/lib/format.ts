const clpFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export function formatCLPFromCents(valueInCents: number): string {
  const cents = Number.isFinite(valueInCents) ? Math.max(0, Math.round(valueInCents)) : 0;
  return clpFormatter.format(cents);
}

export function formatCLP(value: number): string {
  const pesos = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
  return clpFormatter.format(pesos);
}

export function formatQuantity(quantity: number): string {
  const qty = Number.isFinite(quantity) ? Math.max(0, Math.round(quantity)) : 0;
  return qty.toString();
}
