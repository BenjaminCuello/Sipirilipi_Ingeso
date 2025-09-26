"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RegistroPage() {
    const [telefono, setTelefono] = useState("");

    function formatTelefono(v: string) {
        // máscara simple: +56 9 1234 5678 (flexible)
        let s = v.replace(/[^\d]/g, "");
        if (!s.startsWith("56")) s = "56" + s;
        s = "+" + s;
        // formateo visual básico
        return s
            .replace(/^(\+56)(\d{0,1})(\d{0,4})(\d{0,4}).*/, (_, a, b, c, d) =>
                [a, b && " " + b, c && " " + c, d && " " + d].filter(Boolean).join("")
            )
            .trim();
    }

    return (
        <section className="mx-auto w-full max-w-4xl rounded-xl border border-border bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold mb-1">Registro</h1>
            <p className="text-sm text-muted mb-6">
                Crea tu cuenta para comprar más rápido y ver el estado de tus pedidos.
            </p>

            <form className="space-y-6">
                {/* Contacto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Email" type="email" required placeholder="tu@email.com" />
                    <Input label="Contraseña" type="password" required placeholder="••••••••" />
                    <Input
                        label="Teléfono"
                        value={telefono}
                        onChange={(e) => setTelefono(formatTelefono(e.target.value))}
                        placeholder="+56 9 1234 5678"
                        required
                    />
                    <Input label="RUT" placeholder="12.345.678-9" required />
                </div>

                {/* Dirección */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="Calle" placeholder="Av. Siempre Viva" required />
                    <Input label="Número" placeholder="742" required />
                    <Input label="Depto / Casa" placeholder="Dpto 12 / Casa B" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

