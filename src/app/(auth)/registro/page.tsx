"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/schemas/auth";
import { createClient } from "@/lib/supabase/client";
import { safeRedirectTarget } from "@/lib/safeRedirect";

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);
  const searchParams = useSearchParams();
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
      // Recarga completa por la misma razón que en /login, y misma lógica
      // de volver a donde el usuario estaba (?next=).
      const target = safeRedirectTarget(searchParams.get("next"));
      window.location.assign(target);
      return;
    }
    // Confirmación de correo activada: falta que el usuario confirme.
    setConfirmEmailSent(true);
  }

  if (confirmEmailSent) {
    const loginHref = searchParams.get("next")
      ? `/login?next=${encodeURIComponent(searchParams.get("next")!)}`
      : "/login";
    return (
      <div className="w-full max-w-sm text-center">
        <h1 className="mb-4 text-2xl font-extrabold text-ink">Revisa tu correo</h1>
        <p className="text-muted">
          Te enviamos un enlace de confirmación. Ábrelo para activar tu cuenta
          y luego inicia sesión.
        </p>
        <Link href={loginHref} className="mt-6 inline-block font-semibold text-copper hover:text-copper-ink">
          Ir a iniciar sesión →
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-8 text-2xl font-extrabold text-ink">Crear cuenta</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Field label="Nombre completo" error={errors.fullName?.message}>
          <input
            type="text"
            autoComplete="name"
            {...register("fullName")}
            className="w-full rounded-xl bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-copper"
          />
        </Field>

        <Field label="Correo" error={errors.email?.message}>
          <input
            type="email"
            autoComplete="email"
            {...register("email")}
            className="w-full rounded-xl bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-copper"
          />
        </Field>

        <Field label="Contraseña" error={errors.password?.message}>
          <input
            type="password"
            autoComplete="new-password"
            {...register("password")}
            className="w-full rounded-xl bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-copper"
          />
        </Field>

        {serverError && <p className="text-xs text-copper">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-full bg-copper px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-copper-ink disabled:opacity-60"
        >
          {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link
          href={
            searchParams.get("next")
              ? `/login?next=${encodeURIComponent(searchParams.get("next")!)}`
              : "/login"
          }
          className="font-semibold text-copper hover:text-copper-ink"
        >
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
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
      {error && <span className="text-xs text-copper">{error}</span>}
    </label>
  );
}
