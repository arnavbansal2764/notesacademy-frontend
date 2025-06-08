import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import React from "react"

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16">
        <article className="prose prose-invert bg-slate-800 p-8 rounded-lg shadow-lg">
          <p>Thank you for shopping on https://notesacademy.in</p>

          <h2>Non-tangible irrevocable goods (“Digital products”)</h2>
          <p>
            We do not issue refunds for non-tangible irrevocable goods (“digital products”) once the order is
            confirmed and the product is sent/allocated to you.
          </p>
          <p>
            We recommend contacting us for assistance if you experience any issues receiving or downloading our
            products.
          </p>

          <h2>Contact us for any issues</h2>
          <ul>
            <li>
              By email:{" "}
              <a
                href="mailto:contactnotesinstitute@gmail.com"
                className="text-blue-400 hover:underline"
              >
                contactnotesinstitute@gmail.com
              </a>
            </li>
          </ul>
        </article>
      </main>

      <Footer />
    </div>
  )
}
