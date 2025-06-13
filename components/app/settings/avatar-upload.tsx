"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Loader2, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import ReactCrop, { type Crop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function AvatarUpload() {
  const { user, updateUserMetadata } = useAuth()
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCropDialog, setShowCropDialog] = useState(false)
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or WebP image.",
        variant: "destructive",
      })
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    // Create preview URL
    const url = URL.createObjectURL(file)
    setSelectedFile(file)
    setPreviewUrl(url)
    setShowCropDialog(true)
  }

  const handleCropComplete = async () => {
    if (!selectedFile || !imgRef.current) return

    try {
      setIsUploading(true)

      // Create a canvas to crop the image
      const canvas = document.createElement("canvas")
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height
      const pixelRatio = window.devicePixelRatio
      canvas.width = crop.width * scaleX
      canvas.height = crop.height * scaleY

      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Could not get canvas context")

      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      ctx.imageSmoothingQuality = "high"

      ctx.drawImage(
        imgRef.current,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
      )

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
        }, selectedFile.type, 0.95)
      })

      // Upload to Supabase Storage
      const fileExt = selectedFile.name.split(".").pop()
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, blob, {
          cacheControl: "3600",
          upsert: true,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName)

      // Update user metadata
      const { error: updateError } = await updateUserMetadata({
        avatarUrl: undefined,
      })

      if (updateError) throw updateError

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      })

      // Clean up
      setShowCropDialog(false)
      setSelectedFile(null)
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Upload failed",
        description: "Failed to update your profile picture. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!user?.avatarUrl) return

    try {
      setIsDeleting(true)

      // Extract filename from URL
      const urlParts = user.avatarUrl.split("/")
      const fileName = urlParts[urlParts.length - 1]

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from("avatars")
        .remove([fileName])

      if (deleteError) throw deleteError

      // Update user metadata
      const { error: updateError } = await updateUserMetadata({
        avatarUrl: undefined,
      })

      if (updateError) throw updateError

      toast({
        title: "Avatar removed",
        description: "Your profile picture has been removed.",
      })
    } catch (error) {
      console.error("Error deleting avatar:", error)
      toast({
        title: "Deletion failed",
        description: "Failed to remove your profile picture. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage
            src={user?.avatarUrl || `/placeholder.svg?width=96&height=96&query=${user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}`}
            alt={user?.fullName || user?.email || "User"}
          />
          <AvatarFallback>
            {(user?.fullName || user?.email || "U").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={ALLOWED_FILE_TYPES.join(",")}
          className="hidden"
        />
        <div className="absolute -bottom-2 -right-2 flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isDeleting}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            <span className="sr-only">Change avatar</span>
          </Button>
          {user?.avatarUrl && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={isUploading || isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span className="sr-only">Remove avatar</span>
            </Button>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Click the camera icon to change your profile picture
      </p>

      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
            <DialogDescription>
              Adjust the crop area to select the part of the image you want to use as your avatar.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {previewUrl && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                aspect={1}
                className="max-h-[300px] w-full object-contain"
              >
                <img
                  ref={imgRef}
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-[300px] w-full object-contain"
                />
              </ReactCrop>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCropDialog(false)
                setSelectedFile(null)
                setPreviewUrl(null)
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCropComplete}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 