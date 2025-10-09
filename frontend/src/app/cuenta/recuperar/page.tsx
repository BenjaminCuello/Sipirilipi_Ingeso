"use client";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RecuperarPage() {
    return (
        <section className="mx-auto w-full max-w-2xl rounded-xl border border-border bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold mb-1">Recupera el acceso a tu cuenta</h1>
            <p className="text-sm text-muted mb-6">
                Ingresa tu email para recuperar el acceso a tu cuenta.
            </p>

            <form className="space-y-4">
                <Input type="email" label="Email" placeholder="tu@email.com" required />
                <div className="flex items-center justify-end">
                    <Button type="submit">Continuar</Button>
                </div>
            </form>

            <div className="mt-6">
                <a href="/" className="text-sm text-primary hover:underline">Volver</a>
            </div>
        </section>
    );
}
