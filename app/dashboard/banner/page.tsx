"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload } from "lucide-react";

import {
  useGetBannerQuery,
  useUpdateBannerMutation,
} from "@/lib/api/bannerApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RequireAuth from "@/app/providers/RequireAuth";

export default function BannerPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [debugMessages, setDebugMessages] = useState<string[]>([]);

  const { data: banner, isLoading } = useGetBannerQuery();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();

  const addDebug = (message: string) => {
    console.log(message);
    setDebugMessages((prev) => [
      ...prev,
      `${new Date().toISOString().split("T")[1].split(".")[0]} - ${message}`,
    ]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      addDebug(`File selected: ${file.name}, size: ${file.size}`);
      toast.info(`Selected: ${file.name}`);
    }
  };

  const resetDialog = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
    setIsDialogOpen(false);
    addDebug("Dialog reset");
    toast.info("Cancelled banner update");
  };

  const handleUpdateBanner = async () => {
    if (!selectedFile) {
      toast.error("Please select an image");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      toast.loading("Updating banner...");
      await updateBanner(formData).unwrap();
      toast.success("Banner updated successfully");
      resetDialog();
    } catch (error) {
      const err = error as { data?: { message?: string }; message?: string };
      const errorMessage = err?.data?.message || err?.message || "Failed to update banner";
      toast.error(errorMessage);
      console.error("Error updating banner:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-muted-foreground">Loading banner...</div>
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="container space-y-6 p-6 pb-16">
        <div className="flex items-center justify-between">
          {/* <h1 className="text-3xl font-bold tracking-tight">Banner Management</h1> */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={isUpdating}>
                <Upload className="mr-2 h-4 w-4" /> Update Banner
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Banner Image</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-4">
                  {previewUrl ? (
                    <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video flex-col items-center justify-center rounded-lg border border-dashed bg-muted">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="mt-2 text-sm text-muted-foreground">
                        Choose an image to upload
                      </span>
                    </div>
                  )}
                  <Input
                    id="bannerImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={resetDialog}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpdateBanner} 
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Updating..." : "Update"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Banner</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {banner?.imageUrl ? (
              <div className="relative aspect-video">
                <Image
                  src={banner.imageUrl}
                  alt="Banner"
                  fill
                  className="object-cover"
                  key={banner.imageUrl}
                />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center bg-muted">
                <span className="text-sm text-muted-foreground">No banner image available</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
}
