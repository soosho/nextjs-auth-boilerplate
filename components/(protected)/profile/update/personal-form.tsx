"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, User, Loader2, Camera, X } from "lucide-react"
import Link from "next/link"

interface PersonalFormProps {
  initialData: {
    firstName: string | null
    lastName: string | null
    email: string | null
    avatar: string | null
  }
}

export function PersonalForm({ initialData }: PersonalFormProps) {
  const router = useRouter()
  const [firstName, setFirstName] = useState(initialData.firstName || "")
  const [lastName, setLastName] = useState(initialData.lastName || "")
  const [avatar, setAvatar] = useState<string | null>(initialData.avatar)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 1024 * 1024) {
      toast.error("Image should be less than 1MB")
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload avatar")
      }

      const data = await response.json()
      setAvatar(data.url)
      toast.success("Avatar updated successfully")
      router.refresh()
    } catch (error) {
      console.error("Avatar upload error:", error)
      toast.error("Failed to update avatar")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/user/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
        }),
      })

      if (response.ok) {
        toast.success("Profile updated successfully")
        setTimeout(() => router.push("/profile"), 1500)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Update profile error:", error)
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/user/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: null,
        }),
      })

      if (response.ok) {
        setAvatar(null)
        toast.success("Avatar removed successfully")
        router.refresh()
      } else {
        toast.error("Failed to remove avatar")
      }
    } catch (error) {
      console.error("Remove avatar error:", error)
      toast.error("Failed to remove avatar")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center px-4 pt-4 pb-8">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/profile" className="text-sm flex items-center text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Profile
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-center mb-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center">Personal Information</CardTitle>
            <CardDescription className="text-center">
              Update your profile details
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center">
                <Label htmlFor="avatar-upload" className="mb-2">Profile Picture</Label>
                <div className="relative">
                  <Avatar className="h-24 w-24 border-2 border-muted">
                    {avatar ? (
                      <AvatarImage 
                        src={`/uploads/avatars/${avatar}.webp`} 
                        alt="Profile picture preview" 
                      />
                    ) : (
                      <AvatarFallback className="text-2xl bg-primary/10">
                        {`${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase() || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <Label 
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                  </Label>

                  {avatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute top-0 right-0 h-6 w-6 rounded-full bg-destructive/90 text-white flex items-center justify-center shadow-md hover:bg-destructive transition-colors"
                      aria-label="Remove avatar"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <input id="avatar-upload" type="file" accept="image/jpeg,image/png" onChange={handleFileChange} className="sr-only" />
                <p className="text-xs text-muted-foreground mt-2">Recommended: Square JPG, PNG. Max 1MB.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input 
                  id="first-name" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  placeholder="First name" 
                  disabled={isLoading} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input 
                  id="last-name" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  placeholder="Last name" 
                  disabled={isLoading} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={initialData.email || ""}
                  disabled={true}
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed.
                </p>
              </div>
            </CardContent>

            <CardFooter className="pt-4">
              <Button type="submit" className="w-full" disabled={isLoading || isUploading}>
                {(isLoading || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUploading ? "Uploading..." : isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}