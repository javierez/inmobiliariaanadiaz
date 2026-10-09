import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

/**
 * Minimal Markdown renderer for CRM-authored copy (website_config text fields).
 *
 * Agencies paste text with light Markdown into the CRM, so a plain {text} render
 * leaks literal `###` and `**` onto the page. This covers the subset they
 * actually use — headings, bold, italic, links, bullet lists, blank-line
 * paragraphs — and renders anything else verbatim. Builds React nodes rather
 * than HTML strings, so untrusted copy can never inject markup.
 */

// Emphasis spans may wrap a single newline (agencies break lines inside a bold
// sentence), so these are not anchored to one line.
const INLINE_TOKEN =
  /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|\[[^\]\n]+\]\([^)\s]+\))/g;

/** Turns a paragraph's single newlines into hard line breaks. */
function withBreaks(text: string, key: string): ReactNode[] {
  return text
    .split("\n")
    .flatMap((line, i) =>
      i === 0 ? [line] : [<br key={`${key}-br${i}`} />, line],
    );
}

function renderInline(text: string, key: string): ReactNode[] {
  return text.split(INLINE_TOKEN).map((part, i) => {
    const k = `${key}-${i}`;
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={k}>{withBreaks(part.slice(2, -2), k)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={k}>{withBreaks(part.slice(1, -1), k)}</em>;
    if (part.startsWith("_") && part.endsWith("_"))
      return <em key={k}>{withBreaks(part.slice(1, -1), k)}</em>;
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link)
      return (
        <a
          key={k}
          href={link[2]}
          className="underline underline-offset-2 hover:no-underline"
        >
          {link[1]}
        </a>
      );
    return <span key={k}>{withBreaks(part, k)}</span>;
  });
}

const BULLET = /^\s*[-*]\s+/;

export function RichText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const blocks = text.trim().split(/\n{2,}/);

  return (
    <div className={cn("space-y-4", className)}>
      {blocks.map((raw, i) => {
        const block = raw.trim();
        if (!block) return null;
        const key = `b${i}`;

        const heading = /^(#{1,6})\s+(.*)$/.exec(block);
        if (heading) {
          return (
            <p
              key={key}
              className="text-left text-base font-medium text-foreground sm:text-lg"
            >
              {renderInline(heading[2]!, key)}
            </p>
          );
        }

        const lines = block.split("\n");
        if (lines.every((l) => BULLET.test(l))) {
          return (
            <ul key={key} className="list-disc space-y-1 pl-5 text-left">
              {lines.map((l, j) => (
                <li key={`${key}-${j}`}>
                  {renderInline(l.replace(BULLET, ""), `${key}-${j}`)}
                </li>
              ))}
            </ul>
          );
        }

        return <p key={key}>{renderInline(block, key)}</p>;
      })}
    </div>
  );
}
