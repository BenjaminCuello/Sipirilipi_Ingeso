"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiFetch } from "@/lib/api";
import { login } from "@/lib/auth";

type AnchorRef = React.RefObject<HTMLDivElement> | React.MutableRefObject<HTMLDivElement | null>;

type Props = {
  open: boolean;
  onClose: () => void;
  anchorRef: AnchorRef;
};

const schema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Mínimo 6 caracteres" }),
});

type FormValues = z.infer<typeof schema>;

export function LoginSheet({ open, onClose, anchorRef }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [serverError, setServerError] = useState<string | null>(null);

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

  const style: React.CSSProperties = {
    position: "absolute",
    top: "100%",
    left: "50%",
    transform: "translate(-50%, 12px)",
    zIndex: 50,
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (!open) return null;

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const res = await apiFetch<{ token: string; user: { id: number; name: string; email: string; role: string } }>(
        "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify(values),
        }
      );
      login(res.token);
      reset();
      onClose();
    } catch (err) {
      const msg = (err as Error).message || "Error de inicio de sesión";
      setServerError(msg);
    }
  }

  return (
    <div ref={panelRef} style={style} className="w-[360px] rounded-xl border border-border bg-white shadow-xl p-4">
      <h3 className="text-lg font-semibold mb-2">Iniciar sesión</h3>

      {serverError && <div className="mb-3 text-sm text-red-600">{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <Input type="email" placeholder="tu@email.com" label="Email" {...register("email")} error={errors.email?.message} />
        <Input type="password" placeholder="••••••" label="Contraseña" {...register("password")} error={errors.password?.message} />

        <div className="flex items-center justify-between pt-1">
          <a href="/cuenta/recuperar" className="text-sm text-primary hover:underline">
            Olvidé mi contraseña
          </a>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Entrando…" : "Iniciar sesión"}
          </Button>
        </div>
      </form>

      <div className="mt-4 border-t border-border pt-3 text-sm">
        ¿No tienes cuenta? <a href="/registro" className="text-primary hover:underline">Registrarme</a>
      </div>
    </div>
  );
}
