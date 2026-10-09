"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { registerPageView } from "~/server/actions/page-views";

const SESSION_KEY = "page-views-counted";

function alreadyCounted(): string[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    // sessionStorage bloqueado o contenido corrupto: se cuenta y ya está.
    return [];
  }
}

/**
 * Cuenta una visita a cada página de la web. No pinta nada: la cifra es para
 * la agencia, que la ve en el CRM, no para quien visita la web. Va en el
 * layout para que una página nueva se cuente sin acordarse de montarlo.
 *
 * Volver a la misma página en la misma pestaña no vuelve a contar: queda
 * apuntada en sessionStorage. No es una defensa contra quien quiera inflarlo,
 * pero evita el caso real —abrir una ficha, volver al listado y entrar otra
 * vez— que convertiría la cifra en ruido.
 *
 * Dentro de un marco (el editor de la web en el CRM) no cuenta.
 */
export function PageViewBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || window.self !== window.top) return;
    const counted = alreadyCounted();
    if (counted.includes(pathname)) return;

    void registerPageView(pathname).then((ok) => {
      if (!ok) return;
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify([...alreadyCounted(), pathname]));
      } catch {
        // Sin almacenamiento: como mucho se cuenta de más al volver.
      }
    });
  }, [pathname]);

  return null;
}
