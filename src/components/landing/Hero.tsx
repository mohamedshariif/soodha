"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { TrendingUp, TrendingDown, Bell, HandCoins, ArrowRight, CirclePlay, Minus, Wifi, Tv, Receipt, PieChart } from "lucide-react";

const BADGES = [
  {
    icon: TrendingUp,
    title: "Income up",
    desc: "+12% this month",
    position: "-left-6 top-18 sm:-left-6 sm:top-45",
    delay: "0s",
  },
  {
    icon: TrendingDown,
    title: "Expenses down",
    desc: "-8% this month",
    position: "-left-2 top-30 sm:-left-2 sm:top-60",
    delay: "2.5s",
  },
  {
    icon: HandCoins,
    title: "Savings goal",
    desc: "68% funded",
    position: "-left-8 bottom-15 sm:-left-8 sm:bottom-35",
    delay: "2s",
  },
  {
    icon: Bell,
    title: "Bill reminder",
    desc: "Rent due in 3 days",
    position: "-right-8 top-0 sm:-right-8 sm:top-10",
    delay: "2s",
  },
  {
    icon: PieChart,
    title: "Budget on track",
    desc: "92% this month",
    position: "-left-4 bottom-4 sm:-left-15 sm:bottom-15",
    delay: "4s",
  },
  {
    icon: Wifi,
    title: "Internet",
    desc: "bill paid",
    position: "-right-8 top-28 sm:-right-10 sm:top-55",
    delay: "2s",
  },
  {
    icon: Tv,
    title: "Subscription",
    desc: "netflix paid",
    position: "-right-5 bottom-5 sm:-right-22 sm:bottom-40",
    delay: "2.5s",
  },
  {
    icon: Receipt,
    title: "Report",
    desc: "monthly report calculated",
    position: "-right-10 top-40 sm:-right-25 sm:top-70",
    delay: "1.5s",
  },
];

export function Hero() {
  const { resolvedTheme } = useTheme();
  
  const heroImage =
    resolvedTheme === "dark"
      ? "/landing/dashboard-dark.png"
      : "/landing/dashboard-light.png";

  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrollProgress(Math.min(window.scrollY / 400, 1));
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      id="home"
      className="relative overflow-hidden border-b border-border-subtle bg-background pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 60% 50% at 50% 0%, black 40%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 50% at 50% 0%, black 40%, transparent 90%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-10%] h-125 w-200 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[10%] top-[15%] h-75 w-75 rounded-full opacity-10 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
              One Platform,
              <br />
              <span className="relative text-primary inline-block pb-1">
                Total Financial Clarity.
                <svg
                viewBox="0 0 300 20"
                preserveAspectRatio="none"
                className="absolute -bottom-1 left-0 h-3 w-full sm:h-4"
                aria-hidden
              >
                <path
                  d="M2,10 Q40,2 75,10 T150,10 T225,10 T298,10"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  pathLength="1"
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: 1,
                    transition: "stroke-dashoffset 1.1s ease-out 0.4s",
                  }}
                />
              </svg>
              </span>
            </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Soodha helps you track your income, expenses, accounts, bills, savings debts and gives you clear insight <Minus className="inline-flex"/> so you can make better financial decisions and reach your goals.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="group w-full rounded-full bg-primary px-8 py-4 text-sm font-bold
                text-primary-foreground shadow-lg shadow-primary/25
                transition-colors hover:bg-primary-hover sm:w-auto sm:text-base"
            >
              <div className="flex items-center justify-center gap-1">
                Get started for free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-all duration-300"/>
              </div>
            </Link>
            <Link
              href="#showcase"
              className="w-full rounded-full border border-border bg-card px-7 py-4
                text-sm font-semibold text-foreground transition-colors
                hover:bg-muted sm:w-auto sm:text-base"
            >
              <div className="flex items-center justify-center gap-2">
                <CirclePlay className="w-5 h-5"/>
                See how it works
              </div>
            </Link>
          </div>
        </div>

        <div 
          className="relative mx-auto mt-16 max-w-5xl"
          style={{
            transform: `scale(${1 - scrollProgress * 0.12})`,
            opacity: 1 - scrollProgress * 0.5,
          }}
        >
          <div className="relative aspect-5/3 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              <Image
                key={heroImage}
                src={heroImage}
                alt="Soodha dashboard showing income vs expenses and recent activity"
                fill
                className="object-cover"
                priority
              />
          </div>

          {BADGES.map(({ icon: Icon, title, desc, position, delay }) => (
            <div
              key={title}
              className={`absolute ${position} flex animate-[float-card_7s_ease-in-out_infinite] items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2 shadow-lg sm:px-4 sm:py-3`}
              style={{ animationDelay: delay }}
            >
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary/10 text-primary sm:h-8 sm:w-8">
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </span>
              <div>
                <p className="text-[11px] font-semibold text-foreground sm:text-xs">
                  {title}
                </p>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {desc}
                </p>
              </div>
            </div>
          ))}

          <style>{`
            @keyframes float-card {
              0%, 100% { opacity: 0; transform: translateY(12px); }
              15%, 88% { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      </div>
    </section>
  );
}
