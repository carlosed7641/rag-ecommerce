"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/schemas/auth";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterInput) {
    setServerError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { full_name: values.fullName } },
    });
    if (error) {
      setServerError(error.message);
      return;
    }
    if (data.session) {
      // Confirmación de correo desactivada en el proyecto: ya hay sesión.
      // Recarga completa por la misma razón que en /login.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- intencional
      window.location.assign("/cuenta");
      return;
    }
    // Confirmación de correo activada: falta que el usuario confirme.
    setConfirmEmailSent(true);
  }

  if (confirmEmailSent) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 md:px-8 text-center">
        <h1 className="mb-4 font-display text-2xl font-semibold text-ink">
          Revisa tu correo
        </h1>
        <p className="text-muted">
          Te enviamos un enlace de confirmación. Ábrelo para activar tu cuenta
          y luego inicia sesión.
        </p>
        <Link href="/login" className="mt-6 inline-block text-copper hover:text-copper-ink">
          Ir a iniciar sesión →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 md:px-8">
      <h1 className="mb-8 font-display text-2xl font-semibold text-ink">
        Crear cuenta
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Field label="Nombre completo" error={errors.fullName?.message}>
          <input
            type="text"
            autoComplete="name"
            {...register("fullName")}
            className="w-full rounded border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-copper"
          />
        </Field>

        <Field label="Correo" error={errors.email?.message}>
          <input
            type="email"
            autoComplete="email"
            {...register("email")}
            className="w-full rounded border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-copper"
          />
        </Field>

        <Field label="Contraseña" error={errors.password?.message}>
          <input
            type="password"
            autoComplete="new-password"
            {...register("password")}
            className="w-full rounded border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-copper"
          />
        </Field>

        {serverError && (
          <p className="font-mono text-xs text-copper">{serverError}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded border border-copper bg-copper px-6 py-3 text-sm font-semibold text-[#faf6f1] transition-colors hover:bg-copper-ink disabled:opacity-60"
        >
          {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-6 font-mono text-xs text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-copper hover:text-copper-ink">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[0.68rem] uppercase tracking-wider text-muted">
        {label}
      </span>
      {children}
      {error && <span className="font-mono text-xs text-copper">{error}</span>}
    </label>
  );
}
