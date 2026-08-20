interface FaqQuestion {
  question: string;
  answer: string;
}

interface FaqCategory {
  category: string;
  questions: FaqQuestion[];
}

interface FaqJsonLdProps {
  faqs: FaqCategory[];
}

export default function FaqJsonLd({ faqs }: FaqJsonLdProps) {
  const allQuestions = faqs.flatMap((category) => category.questions);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allQuestions.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
