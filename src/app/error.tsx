"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="mb-2 text-4xl font-bold tracking-tight">Algo salió mal</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center justify-center rounded-md bg-brand px-6 py-3 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand/90"
      >
        Intentar de nuevo
      </button>
    </main>
  );
}
