import { NextResponse } from "next/server"
import { createHmac } from 'crypto'

interface GeetestCaptcha {
  lot_number: string
  captcha_output: string
  pass_token: string
  gen_time: string
}

async function verifyGeetest(captcha: GeetestCaptcha) {
  try {
    const sign_token = createHmac('sha256', process.env.GEETEST_KEY!)
      .update(captcha.lot_number)
      .digest('hex')

    const verifyData = new URLSearchParams({
      lot_number: captcha.lot_number,
      captcha_output: captcha.captcha_output,
      pass_token: captcha.pass_token,
      gen_time: captcha.gen_time,
      sign_token: sign_token,
      captcha_id: process.env.NEXT_PUBLIC_GEETEST_ID!
    })

    const verifyUrl = `https://gcaptcha4.geetest.com/validate`
    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: verifyData.toString()
    })

    const data = await response.json()
    return data.status === 'success' && data.result === 'success'
  } catch (error) {
    console.error('GeeTest verification error:', error)
    return false
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    if (!body.captcha) {
      return NextResponse.json({
        error: "Captcha data is required"
      }, { status: 400 })
    }
    
    const isValid = await verifyGeetest(body.captcha)
    
    return NextResponse.json({ success: isValid })
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json({
      error: "Validation failed"
    }, { status: 500 })
  }
}