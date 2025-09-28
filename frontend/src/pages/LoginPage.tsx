import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiFetch } from "@/lib/api";
import { login } from "@/lib/auth";
import { Input } from "@/components/ui/Input";

const schema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Mínimo 6 caracteres" }),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location.state?.from?.pathname || "/";

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });
  async function onSubmit(values: FormValues) {
    try {
      const res = await apiFetch<{ token: string; user: { id: number; name: string; email: string; role: string } }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      });
      login(res.token);
      navigate(from, { replace: true });
    } catch (e) {
      alert((e as Error).message || "Error de inicio de sesión");
    }
  }

  return (
    <main className="min-h-dvh grid place-items-center bg-slate-50 p-6">
      <div className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-slate-900 text-center">Iniciar sesión</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input type="email" placeholder="tu@email.com" label="Email" {...register("email")} error={errors.email?.message} />
          <Input type="password" placeholder="••••••" label="Contraseña" {...register("password")} error={errors.password?.message} />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 active:scale-95 transition disabled:opacity-50"
          >
            {isSubmitting ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
