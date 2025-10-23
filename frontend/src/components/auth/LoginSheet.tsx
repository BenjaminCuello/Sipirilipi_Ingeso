"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiFetch } from "@/lib/api";
import { login, TOKEN_KEY } from "@/lib/auth";

type AnchorRef = React.RefObject<HTMLDivElement> | React.MutableRefObject<HTMLDivElement | null>;

type Props = {
  open: boolean;
  onClose: () => void;
  anchorRef: AnchorRef;
};

const schema = z.object({
  email: z.string().email({ message: "Email invalido" }),
  password: z.string().min(6, { message: "Minimo 6 caracteres" }),
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
      const res = await apiFetch<{
        token?: string;
        user?: { id: number; name?: string; email: string; role: "ADMIN" | "SELLER" | "CUSTOMER" };
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      });

      if (!res.token) {
        throw new Error("Respuesta sin token");
      }

      let finalUser = res.user;
      if (!finalUser) {
        localStorage.setItem(TOKEN_KEY, res.token);
        try {
          finalUser = await apiFetch<{ id: number; name?: string; email: string; role: "ADMIN" | "SELLER" | "CUSTOMER" }>(
            "/auth/me",
            { auth: true }
          );
        } catch (meError) {
          localStorage.removeItem(TOKEN_KEY);
          throw meError;
        }
      }

      login(res.token, finalUser);
      reset();
      onClose();
    } catch (err) {
      const msg = (err as Error).message || "Error de inicio de sesion";
      setServerError(msg);
    }
  }

  function goToAdminLogin() {
    onClose();
    window.location.href = "/login";
  }

  return (
    <div ref={panelRef} style={style} className="w-[360px] rounded-xl border border-border bg-white shadow-xl p-4">
      <h3 className="text-lg font-semibold mb-2">Iniciar sesion</h3>

      {serverError && <div className="mb-3 text-sm text-red-600">{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <Input type="email" placeholder="tu@email.com" label="Email" {...register("email")} error={errors.email?.message} />
        <Input type="password" placeholder="********" label="Contrasena" {...register("password")} error={errors.password?.message} />

        <div className="flex items-center justify-between pt-1">
          <a href="/recuperar" className="text-sm text-primary hover:underline">
            Olvide mi contrasena
          </a>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Iniciar sesion"}
          </Button>
        </div>
      </form>

      <div className="mt-4 border-t border-border pt-3 text-sm space-y-2">
        <p>
          ¿No tienes cuenta? <a href="/registro" className="text-primary hover:underline">Registrarme</a>
        </p>
        <button
          onClick={goToAdminLogin}
          className="w-full text-left text-sm text-indigo-600 hover:underline"
        >
          Iniciar sesión como administrador
        </button>
      </div>
    </div>
  );
}
