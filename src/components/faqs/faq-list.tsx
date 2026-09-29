"use client";

import { useEffect, useState } from "react";
import type { FaqCategory } from "~/server/queries/website-config";
import {
  announceReady,
  readPreviewMessage,
  slice,
} from "~/lib/preview-patch";

/** Slice names the editor sends. Order matters: the first is the bare shape. */
const KEYS = ["faqsProps"] as const;

/**
 * The accordion list on /faqs.
 *
 * Split out of `FaqsContent` — which is a server component and so could never
 * follow an edit — for one reason: the CRM's FAQs tab renders this very page in
 * its preview, and until now every change to a question sat invisible until the
 * agency reloaded the frame.
 *
 * `live` is what keeps that cost off the public site: the real page renders the
 * same markup with no listener attached.
 */
export function FaqList({
  initial,
  fallback,
  live = false,
}: {
  /** The account's own FAQs. Empty when it has never configured any. */
  initial: FaqCategory[];
  /** Built-in set shown when the account has none of its own. */
  fallback: FaqCategory[];
  live?: boolean;
}) {
  const [categories, setCategories] = useState<FaqCategory[]>(
    initial.length > 0 ? initial : fallback,
  );

  useEffect(() => {
    if (!live) return;
    announceReady();
    const onMessage = (e: MessageEvent) => {
      const msg = readPreviewMessage(e.data, "faqs");
      if (!msg) return;
      const next = slice<FaqCategory[]>(msg.patch, "faqsProps", KEYS);
      if (!Array.isArray(next)) return;
      // Emptying the list is a real edit, and the page's own rule is that no
      // account FAQs means the built-in set — so mirror it rather than
      // rendering a blank page the visitor would never see.
      setCategories(next.length > 0 ? next : fallback);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [live, fallback]);

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      {categories.map((category, categoryIndex) => (
        <div key={categoryIndex}>
          <h2 className="mb-6 text-2xl font-bold tracking-tight">
            {category.category}
          </h2>

          <div className="space-y-4">
            {category.questions.map((faq, faqIndex) => (
              <details key={faqIndex} className="group border-b pb-4">
                <summary className="cursor-pointer select-none list-none">
                  <div className="flex items-center justify-between py-2">
                    <h3 className="pr-4 text-base font-medium leading-relaxed sm:text-lg">
                      {faq.question}
                    </h3>
                    <span className="flex-shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180">
                      &#9662;
                    </span>
                  </div>
                </summary>
                <div className="pt-2">
                  <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
