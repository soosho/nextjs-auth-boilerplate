"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <main className="flex-grow flex items-center justify-center px-4 sm:px-8 relative overflow-hidden min-h-[calc(100vh-4rem)]">
      {/* Background layers with galaxy effect */}
      <div className="absolute inset-0 bg-[#0d1117]" />
      <div className="absolute inset-0 bg-stars" />
      <div className="absolute inset-0 animate-galaxy" />
      <div className="absolute inset-0 bg-grid-small-white/[0.1] -z-10" />
      
      {/* Enhanced glow effects */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-full h-full bg-gradient-to-b from-[#0d1117] via-[#161b22]/50 to-[#0d1117]" />
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-purple-500/10 blur-[100px] rounded-full" />
        <div className="absolute top-1/4 -translate-y-1/2 left-1/4 -translate-x-1/2 w-1/2 h-1/2 bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 translate-y-1/2 right-1/4 translate-x-1/2 w-1/2 h-1/2 bg-purple-500/5 blur-[120px] rounded-full" />
      </div>
      
      {/* Adjusted astronaut position for mobile */}
      <div className="absolute right-[-20%] md:right-32 top-[45%] -translate-y-1/2 z-[1] opacity-60 pointer-events-none select-none">
        <Image
          src="/images/astronaut.png"
          alt="Floating astronaut"
          width={832}
          height={448}
          className="animate-float scale-[0.35] md:scale-75"
          priority
          style={{ objectFit: 'contain' }}
        />
      </div>
      
      {/* Content layer - adjusted for better mobile display */}
      <motion.div 
        className="container mx-auto max-w-4xl relative z-10 text-center mt-16 md:mt-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="mx-auto max-w-2xl space-y-4 md:space-y-6">
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Welcome to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500">
              Exchange
            </span>
          </motion.h1>
          <motion.p 
            className="text-lg sm:text-xl text-gray-400 px-4 sm:px-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Your secure authentication boilerplate
          </motion.p>
        </div>

        <motion.div 
          className="flex items-center justify-center gap-4 sm:gap-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button size="lg" className="px-4 sm:px-8">
            <Link href="/register">Get Started</Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-gray-700 text-white hover:bg-white/5"
            asChild
          >
            <Link href="/login">Sign In</Link>
          </Button>
        </motion.div>
      </motion.div>
    </main>
  )
}