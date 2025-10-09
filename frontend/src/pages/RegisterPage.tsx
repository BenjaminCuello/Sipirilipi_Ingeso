import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function formatTelefono(value: string) {
  let digits = value.replace(/[^\d]/g, "");
  if (!digits.startsWith("56")) digits = "56" + digits;
  const formatted = `+${digits}`.replace(
    /^(\+56)(\d{0,1})(\d{0,4})(\d{0,4}).*/,
    (_, a: string, b: string, c: string, d: string) =>
      [a, b && ` ${b}`, c && ` ${c}`, d && ` ${d}`].filter(Boolean).join("")
  );
  return formatted.trim();
}

export default function RegisterPage() {
  const [telefono, setTelefono] = useState("");

  return (
    <section className="mx-auto w-full max-w-4xl rounded-xl border border-border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold mb-1">Registro</h1>
      <p className="text-sm text-muted mb-6">
        Crea tu cuenta para comprar más rápido y ver el estado de tus pedidos.
      </p>

      <form className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Email" type="email" required placeholder="tu@email.com" />
          <Input label="Contraseña" type="password" required placeholder="••••••" />
          <Input
            label="Teléfono"
            value={telefono}
            onChange={(event) => setTelefono(formatTelefono(event.target.value))}
            placeholder="+56 9 1234 5678"
            required
          />
          <Input label="RUT" placeholder="12.345.678-9" required />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input label="Calle" placeholder="Av. Siempre Viva" required />
          <Input label="Número" placeholder="742" required />
          <Input label="Depto / Casa" placeholder="Dpto 12 / Casa B" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Comuna" placeholder="Coquimbo" required />
          <Input label="Región" placeholder="Región de Coquimbo" required />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button as="a" href="/" variant="ghost" className="px-2">
            Cancelar
          </Button>
          <Button type="submit">Crear cuenta</Button>
        </div>
      </form>
    </section>
  );
}
