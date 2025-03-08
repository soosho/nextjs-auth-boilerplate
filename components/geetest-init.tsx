"use client"

import Script from "next/script"

export function GeetestInit() {
  return (
    <>
      <Script
        src="/geetest/gt4.js"
        strategy="beforeInteractive"
      />
    </>
  )
}