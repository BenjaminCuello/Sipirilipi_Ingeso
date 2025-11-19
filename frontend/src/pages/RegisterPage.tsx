import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";

const registerSchema = z.object({
  name: z.string().min(3, { message: "Ingresa tu nombre completo" }),
  email: z.string().email({ message: "Email invalido" }),
  password: z.string().min(6, { message: "Minimo 6 caracteres" }),
  phone: z.string().min(10, { message: "Telefono invalido" }),
  rut: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  unit: z.string().optional(),
  comuna: z.string().optional(),
  region: z.string().optional(),
});

type FormValues = z.infer<typeof registerSchema>;

function formatTelefono(value: string) {
  let digits = value.replace(/[^\d]/g, "");
  if (digits.length === 0) return "";
  if (!digits.startsWith("56")) digits = "56" + digits;
  const formatted = `+${digits}`.replace(
    /^(\+56)(\d{0,1})(\d{0,4})(\d{0,4}).*/,
    (_, a: string, b: string, c: string, d: string) =>
      [a, b && ` ${b}`, c && ` ${c}`, d && ` ${d}`].filter(Boolean).join("")
  );
  return formatted.trim();
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      rut: "",
      street: "",
      number: "",
      unit: "",
      comuna: "",
      region: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    try {
      await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
        }),
      });
      navigate("/", { replace: true });
    } catch (error) {
      setSubmitError((error as Error)?.message ?? "No pudimos crear tu cuenta");
    }
  }

  return (
    <section className="mx-auto w-full max-w-4xl rounded-xl border border-border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold mb-1">Registro</h1>
      <p className="text-sm text-muted mb-6">
        Crea tu cuenta para comprar más rápido y ver el estado de tus pedidos.
      </p>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input
              label="Nombre completo"
              placeholder="Juan Pérez"
              autoComplete="name"
              {...register("name")}
              error={errors.name?.message}
            />
          </div>
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            {...register("email")}
            error={errors.email?.message}
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••"
            autoComplete="new-password"
            {...register("password")}
            error={errors.password?.message}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <Input
                label="Teléfono"
                placeholder="+56 9 1234 5678"
                inputMode="tel"
                {...field}
                value={field.value ?? ""}
                onChange={(event) => field.onChange(formatTelefono(event.target.value))}
                error={errors.phone?.message}
              />
            )}
          />
          <Input
            label="RUT"
            placeholder="12.345.678-9"
            autoComplete="off"
            {...register("rut")}
            error={errors.rut?.message}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            label="Calle"
            placeholder="Av. Siempre Viva"
            autoComplete="address-line1"
            {...register("street")}
            error={errors.street?.message}
          />
          <Input
            label="Número"
            placeholder="742"
            autoComplete="address-line2"
            {...register("number")}
            error={errors.number?.message}
          />
          <Input
            label="Depto / Casa"
            placeholder="Dpto 12 / Casa B"
            autoComplete="address-line3"
            {...register("unit")}
            error={errors.unit?.message}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Comuna"
            placeholder="Coquimbo"
            autoComplete="address-level2"
            {...register("comuna")}
            error={errors.comuna?.message}
          />
          <Input
            label="Región"
            placeholder="Región de Coquimbo"
            autoComplete="address-level1"
            {...register("region")}
            error={errors.region?.message}
          />
        </div>

        {submitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{submitError}</div>}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button as="a" href="/" variant="ghost" className="px-2">
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </div>
      </form>
    </section>
  );
}
