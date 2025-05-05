"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, RefreshCw } from "lucide-react";

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

export default function BannerPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: banner, isLoading } = useGetBannerQuery();
  const [updateBanner, { isLoading: updating }] = useUpdateBannerMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const resetDialog = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
    setIsDialogOpen(false);
  };

  const handleUpdateBanner = async () => {
    if (!selectedFile) {
      toast.error("Please select an image");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      await updateBanner({ id: banner?._id || "", formData }).unwrap();
      toast.success("Banner updated");
      resetDialog();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Banner Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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
                <Button
                  onClick={handleUpdateBanner}
                  disabled={updating || !selectedFile}
                >
                  {updating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update"
                  )}
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
  );
}
