import { db } from "../db";
import { websiteProperties, testimonials } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { cache } from "react";
import { env } from "~/env";
import type { TestimonialProps } from "../../lib/data";

const ACCOUNT_ID = 137n;

export const getTestimonialProps = cache(
  async (accountIdArg?: bigint): Promise<TestimonialProps | null> => {
    "use server";
    try {
      const accountId = accountIdArg ?? ACCOUNT_ID;
      const [config] = await db
        .select({ testimonialProps: websiteProperties.testimonialProps })
        .from(websiteProperties)
        .where(eq(websiteProperties.accountId, accountId))
        .limit(1);

      if (!config?.testimonialProps) return null;
      return JSON.parse(config.testimonialProps) as TestimonialProps;
    } catch (error) {
      console.error("Error fetching testimonial props:", error);
      return null;
    }
  },
);

export const getTestimonials = cache(async (accountIdArg?: bigint) => {
  "use server";
  try {
    const accountId = accountIdArg ?? ACCOUNT_ID;
    const testimonialsData = await db
      .select({
        testimonialId: testimonials.testimonialId,
        name: testimonials.name,
        role: testimonials.role,
        content: testimonials.content,
        avatar: testimonials.avatar,
        rating: testimonials.rating,
      })
      .from(testimonials)
      .where(
        and(
          eq(testimonials.accountId, accountId),
          eq(testimonials.isActive, true),
        ),
      )
      .orderBy(testimonials.sortOrder, testimonials.createdAt);

    return testimonialsData;
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return [];
  }
});
