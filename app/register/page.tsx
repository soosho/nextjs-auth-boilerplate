"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2 } from "lucide-react"
import { Geetest, GeetestValidateResult } from "@/components/geetest"
import { Separator } from "@/components/ui/separator"
import { signIn } from "next-auth/react"
import { FaGoogle } from "react-icons/fa"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [captchaData, setCaptchaData] = useState<GeetestValidateResult | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    if (!captchaData) {
      toast.error("Verification required", {
        description: "Please complete the captcha verification"
      })
      setIsLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          email,
          password: formData.get("password"),
          captcha: captchaData
        }),
      })

      if (response.ok) {
        setIsSuccess(true)
        setUserEmail(email)
      } else {
        const data = await response.json()
        if (data.details) {
          toast.error("Validation Error", {
            description: data.details.map((error: { message: string }) => error.message).join(", ")
          })
        } else {
          toast.error("Registration Failed", {
            description: data.error
          })
        }
      }
    } catch {
      toast.error("Registration failed", {
        description: "An error occurred during registration"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-50 p-3">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Check your email</CardTitle>
            <CardDescription className="text-center">
              We&apos;ve sent you a verification link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border bg-muted/50 p-6">
              <p className="text-center mb-2 text-sm text-muted-foreground">
                We&apos;ve sent a verification email to:
              </p>
              <p className="text-center font-medium break-all">
                {userEmail}
              </p>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-center text-muted-foreground">
                Click the link in the email to verify your account. If you don&apos;t see the email, check your spam folder.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/verify/resend')}
            >
              Didn&apos;t receive the email?
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => router.push('/login')}
            >
              Back to login
            </Button>
          </CardFooter>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  placeholder="John"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  placeholder="Doe"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="john@example.com"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              {captchaData ? (
                <div className="flex items-center justify-center text-green-500 gap-2 rounded-md border border-green-200 bg-green-50 py-3">
                  <CheckCircle className="h-5 w-5" />
                  <span>Captcha verified</span>
                </div>
              ) : (
                <Geetest
                  onSuccess={(data: GeetestValidateResult) => {
                    setCaptchaData(data)
                    toast.success("Verification successful", {
                      description: "You can now create your account"
                    })
                  }}
                  onError={() => {
                    toast.error("Verification failed", {
                      description: "Please try again"
                    })
                    setCaptchaData(null)
                  }}
                />
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !captchaData}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <div className="relative my-6">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-2 text-muted-foreground text-sm">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full mb-6"
            disabled={isLoading}
            onClick={() => signIn("google", { callbackUrl: "/overview" })}
          >
            <FaGoogle className="mr-2 h-4 w-4" />
            Sign up with Google
          </Button>

          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-2 text-muted-foreground text-sm">
                Already have an account?
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full mt-6"
            onClick={() => router.push('/login')}
          >
            Sign in
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}