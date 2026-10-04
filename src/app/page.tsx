import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProductShowcase } from "@/components/landing/ProductShowcase";
import { Features } from "@/components/landing/Features";
import { CTA } from "@/components/landing/CTA";
/* import { CTA } from "@/components/landing/cta-last"; */
import { Footer } from "@/components/landing/Footer";

export default function homePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main>
        <Hero />
        <ProductShowcase />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}