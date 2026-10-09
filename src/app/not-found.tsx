import type { Metadata } from "next";
import Link from "next/link";
import Footer from "~/components/footer";

export const metadata: Metadata = {
  title: "Página no encontrada",
  description: "La página que buscas no existe o ha sido eliminada.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="mb-2 text-6xl font-bold tracking-tight">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-muted-foreground">
          Página no encontrada
        </h2>
        <p className="mb-8 max-w-md text-muted-foreground">
          Lo sentimos, la página que buscas no existe o ha sido eliminada.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-brand px-6 py-3 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand/90"
          >
            Volver al inicio
          </Link>
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Contactar
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
