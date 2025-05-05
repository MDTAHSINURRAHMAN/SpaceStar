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

  // Helper function to add debug messages
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
    }
  };

  const resetDialog = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
    setIsDialogOpen(false);
    addDebug("Dialog reset");
  };

  const handleUpdateBanner = async () => {
    addDebug("Update button clicked");

    try {
      // STEP 1: Check if file is selected
      if (!selectedFile) {
        addDebug("ERROR: No file selected");
        toast.error("Please select an image");
        return;
      }
      addDebug("✓ File is selected");

      // STEP 2: Create FormData
      const formData = new FormData();
      formData.append("image", selectedFile);
      addDebug(`✓ FormData created with file: ${selectedFile.name}`);

      // STEP 3: Log FormData content (for debugging)
      const formDataEntries = [...formData.entries()];
      addDebug(`FormData contains ${formDataEntries.length} entries`);
      formDataEntries.forEach(([key, value]) => {
        if (value instanceof File) {
          addDebug(`  - ${key}: File ${value.name} (${value.size} bytes)`);
        } else {
          addDebug(`  - ${key}: ${value}`);
        }
      });

      // STEP 4: Make the API call
      try {
        addDebug("Making API call...");
        const result = await updateBanner(formData).unwrap();
        addDebug(`✓ API call successful: ${JSON.stringify(result)}`);

        toast.success("Banner updated successfully");
        resetDialog();
      } catch (apiError) {
        addDebug(`ERROR: API call failed: ${JSON.stringify(apiError)}`);

        // Try to extract error message
        const error = apiError as {
          data?: { message?: string };
          message?: string;
          error?: string;
        };
        const errorMsg =
          error?.data?.message ||
          error?.message ||
          error?.error ||
          "Failed to update banner";

        addDebug(`Error message: ${errorMsg}`);
        toast.error(errorMsg);
      }
    } catch (error) {
      const err = error as Error;
      addDebug(`UNEXPECTED ERROR: ${err.message || "Unknown error"}`);
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading banner...</p>
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Banner Management
          </h2>
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
              <div className="space-y-4">
                <div className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                  {previewUrl ? (
                    <div className="relative w-full aspect-[16/9] mb-4">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="text-sm text-gray-500 mt-2">
                        Choose an image to upload
                      </p>
                    </div>
                  )}
                  <Input
                    id="bannerImage"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-4"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetDialog}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateBanner} disabled={isUpdating}>
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
          <CardContent>
            {banner?.imageUrl ? (
              <div className="relative w-full aspect-[16/9]">
                <Image
                  src={banner.imageUrl}
                  alt="Banner"
                  fill
                  className="object-cover rounded-md"
                  key={banner.imageUrl}
                />
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 bg-gray-100 rounded-md">
                <p className="text-gray-500">No banner image available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
}
