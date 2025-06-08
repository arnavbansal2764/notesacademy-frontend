import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import React from "react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-16">
        <article className="prose prose-invert bg-slate-800 p-8 rounded-lg shadow-lg text-center">
          <p>
            For any inquiries, please reach out to us at:{" "}
            <a
              href="mailto:contactnotesacademy@gmail.com"
              className="text-blue-400 hover:underline"
            >
              contactnotesacademy@gmail.com
            </a>
          </p>
        </article>
      </main>

      <Footer />
    </div>
  )
}
