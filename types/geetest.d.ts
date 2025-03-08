export interface GeetestValidateResult {
  lot_number: string
  captcha_output: string
  pass_token: string
  gen_time: string
}

export interface GeetestCaptcha {
  showCaptcha: () => void
  destroy: () => void
  getValidate: () => GeetestValidateResult
  onReady: (callback: () => void) => void
  onSuccess: (callback: () => void) => void
  onError: (callback: () => void) => void
  onClose: (callback: () => void) => void
  appendTo?: (element: string) => void
}

declare global {
  interface Window {
    initGeetest4: (
      config: {
        captchaId: string
        product?: string
        language?: string
        onError?: () => void
      },
      callback: (captcha: GeetestCaptcha) => void
    ) => void
  }
}

export {}