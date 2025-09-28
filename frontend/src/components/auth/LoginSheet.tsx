"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";


type AnchorRef =
    | React.RefObject<HTMLDivElement>
    | React.MutableRefObject<HTMLDivElement | null>;

type Props = {
    open: boolean;
    onClose: () => void;
    anchorRef: AnchorRef; // ⬅ aquí el cambio
};

export function LoginSheet({ open, onClose, anchorRef }: Props) {
    const panelRef = useRef<HTMLDivElement>(null);
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!open) return;
            const panel = panelRef.current;
            const anchor = anchorRef.current;
            const target = e.target as Node;
            if (panel && !panel.contains(target) && anchor && !anchor.contains(target)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, [open, onClose, anchorRef]);

    // Posicionamiento centrado respecto al botón
    const style: React.CSSProperties = {
        position: "absolute",
        top: "100%",
        left: "50%",
        transform: "translate(-50%, 12px)",
        zIndex: 50,
    };

    if (!open) return null;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        // Placeholder: muestra error para vista
        setShowError(true);
    }

    return (
        <div ref={panelRef} style={style}
             className="w-[360px] rounded-xl border border-border bg-white shadow-xl p-4">
            <h3 className="text-lg font-semibold mb-2">Iniciar sesión</h3>

            {showError && (
                <div className="mb-3 text-sm text-red-600">
                    Credenciales inválidas. Inténtalo de nuevo.
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
                <Input type="email" placeholder="tu@email.com" label="Email" required />
                <Input type="password" placeholder="••••••••" label="Contraseña" required />

                <div className="flex items-center justify-between pt-1">
                    <a href="/cuenta/recuperar" className="text-sm text-primary hover:underline">
                        Olvidé mi contraseña
                    </a>
                    <Button type="submit">Iniciar sesión</Button>
                </div>
            </form>

            <div className="mt-4 border-t border-border pt-3 text-sm">
                ¿No tienes cuenta?{" "}
                <a href="/cuenta/registro" className="text-primary hover:underline">
                    Registrarme
                </a>
            </div>
        </div>
    );
}
