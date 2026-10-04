import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function CTA() {
  return (
    <section className="bg-background px-4 pb-8 pt-20 sm:px-6 sm:pb-12 lg:px-8">
      <div
        className="relative mx-auto max-w-6xl overflow-hidden rounded-t-4xl border-x border-t border-border bg-card px-6 pb-32 pt-20 text-center sm:px-12 sm:pb-40 sm:pt-24"
        style={{
          maskImage: "linear-gradient(to bottom, black 0%, black 65%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 65%, transparent 100%)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px)",
            backgroundSize: "56px 100%",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 90%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 90%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-105 w-190 -translate-x-1/2 -translate-y-1/3 rounded-full opacity-25 blur-3xl dark:opacity-15"
          style={{
            background:
              "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)",
          }}
        />

        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Are you ready to take control of your money?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
            Track income, expenses, and debts, and get a clear plan forward
            with Soodha.
          </p>

          <Link
            href="/sign-up"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:text-base"
          >
            Start now
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
