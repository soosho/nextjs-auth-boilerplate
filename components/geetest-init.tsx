"use client"

import Script from "next/script"

export function GeetestInit() {
  return (
    <>
      <Script
        src="https://static.geetest.com/v4/gt4.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://static.geevisit.com/v4/bypass.js"
        strategy="beforeInteractive"
      />
    </>
  )
}