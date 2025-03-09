"use client"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/home/Hero"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0d1117]">
      <Navbar />
      <Hero />
      <Footer />
    </div>
  )
}
