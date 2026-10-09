import type { Metadata } from "next";
import { Button } from "~/components/ui/button";
import { seedDatabase } from "./actions";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function SandboxPage() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Seed Function</h1>
          <form action={seedDatabase} className="flex flex-col gap-4">
            <div className="rounded-lg bg-muted p-4">
              <pre className="overflow-x-auto text-sm">
                <code>{`// This will seed the database with properties`}</code>
              </pre>
            </div>
            <Button type="submit" className="w-full">
              Seed Database
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
