import { Suspense } from "react"
import HeroSection from "@/components/hero-section"
import Navbar from "@/components/navbar"
import ProductShowcase from "@/components/product-showcase"
import Footer from "@/components/footer"
import PricingSection from "@/components/pricing-section"
import { PricingContent } from "./pricing/page"

function PricingFallback() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="h-12 bg-slate-800 rounded-lg mb-4 animate-pulse"></div>
            <div className="h-6 bg-slate-800 rounded-lg mb-8 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-slate-800 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white overflow-hidden">
      <Navbar />
      <HeroSection />
      <ProductShowcase />
      <div id="pricing-section" data-pricing>
        <Suspense fallback={<PricingFallback />}>
          <PricingContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  )
}

