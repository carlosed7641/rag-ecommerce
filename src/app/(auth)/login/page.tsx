"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth";
import { createClient } from "@/lib/supabase/client";
import { safeRedirectTarget } from "@/lib/safeRedirect";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      setServerError(
        error.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos."
          : error.message,
      );
      return;
    }
    // Recarga completa (no router.push): así el servidor y el navegador
    // arrancan con las cookies de sesión ya escritas, sin depender de que
    // Next.js invalide una versión en caché de la página pedida sin sesión.
    // Vuelve a donde el usuario estaba (?next=) si venía de una redirección
    // del proxy, o a /cuenta si entró a /login directamente.
    const target = safeRedirectTarget(searchParams.get("next"));
    window.location.assign(target);
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-8 text-2xl font-extrabold text-ink">Iniciar sesión</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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
            autoComplete="current-password"
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
          {isSubmitting ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        ¿No tienes cuenta?{" "}
        <Link
          href={
            searchParams.get("next")
              ? `/registro?next=${encodeURIComponent(searchParams.get("next")!)}`
              : "/registro"
          }
          className="font-semibold text-copper hover:text-copper-ink"
        >
          Regístrate
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
