import HeroSection from "@/components/hero-section"
import Navbar from "@/components/navbar"
import ProductShowcase from "@/components/product-showcase"
import Footer from "@/components/footer"
import PricingSection from "@/components/pricing-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white overflow-hidden">
      <Navbar />
      <HeroSection />
      <ProductShowcase />
      <PricingSection />
      <Footer />
    </main>
  )
}

