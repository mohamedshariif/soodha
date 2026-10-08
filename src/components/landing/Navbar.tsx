"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "../theme-toggle";
import { TextAlignJustify, X } from "lucide-react";

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#showcase", label: "Platform" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
];

export function Navbar() {

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true});
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header  className={`fixed inset-x-0 top-0 z-50 px-4 transition-all duration-300 ${
        isScrolled ? "pt-2" : "pt-4"
      }`}>
      <div className="mx-auto max-w-5xl">

        <div  className={`flex items-center justify-between rounded-full border border-border bg-card/95 shadow-md backdrop-blur-xl transition-all duration-300 ${
            isScrolled ? "px-4 py-2" : "px-5 py-3"
          }`}>
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
              S
            </div>
            <span className="flex items-center gap-1 text-xl font-extrabold tracking-tight text-foreground">
              Soodha
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            <Link
              href="/sign-in"
              className="hidden rounded-full px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted md:inline-flex"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="hidden rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover md:inline-flex"
            >
              Get Started
            </Link>

            <button
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              onClick={() => setIsOpen((open) => !open)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted md:hidden"
            >
              {isOpen ? <X className="h-5 w-5" /> : <TextAlignJustify className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="mt-3 rounded-3xl border border-border bg-card/85 p-2 py-4 shadow-lg backdrop-blur-xl md:hidden">
            <nav className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-full px-4 py-2 text-base text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mx-2 my-2 border-t border-border-subtle" />

            <div className="flex gap-3 p-2">
              <Link
                href="/sign-in"
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-full border border-border py-3 text-center text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-full bg-primary py-3 text-center text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}