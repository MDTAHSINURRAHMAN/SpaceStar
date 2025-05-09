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
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import RequireAuth from "@/app/providers/RequireAuth";
import Loader from "@/app/components/Loader";
import { Header } from "@/app/components/header/Header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function BannerPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: banner, isLoading } = useGetBannerQuery();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      toast.info(`Selected: ${file.name}`);
    }
  };

  const resetDialog = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
    setIsDialogOpen(false);
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

      // toast.loading("Updating banner...");
      await updateBanner(formData).unwrap();
      toast.success("Banner updated successfully");
      resetDialog();
    } catch (error) {
      const err = error as { data?: { message?: string }; message?: string };
      const errorMessage =
        err?.data?.message || err?.message || "Failed to update banner";
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="font-roboto space-y-6">
        <div className="flex items-center justify-between">
          <Header pageName="Banner" />
        </div>

        <Card className="w-2/3 mx-auto mt-8">
          <CardContent className="">
            {banner?.imageUrl ? (
              <div className="relative h-[350px] w-full rounded-md overflow-hidden">
                <Image
                  src={banner.imageUrl}
                  alt="Banner"
                  fill
                  className="object-cover"
                  key={banner.imageUrl}
                />
              </div>
            ) : (
              <div className="flex h-[180px] items-center justify-center bg-muted rounded-md">
                <span className="text-sm text-muted-foreground">
                  No banner image available
                </span>
              </div>
            )}
          </CardContent>
          <CardFooter className="">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="spaceStarOutline"
                  size="lg"
                  className={`${cn(buttonVariants({ variant: "spaceStarOutline" }))} w-1/2 font-normal text-gray-700 hover:shadow-md rounded-full transition-all`}
                  disabled={isUpdating}
                >
                  <Upload className="h-4 w-4" /> Update Banner
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Banner Image</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-4">
                    {previewUrl ? (
                      <div className="relative h-[180px] w-full overflow-hidden rounded-lg border bg-muted">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-[180px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted">
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
                  <div className="flex gap-3">
                    <Button
                      onClick={resetDialog}
                      size="lg"
                      className={`${buttonVariants({ variant: "spaceStarOutline" })} font-normal bg-red-500 text-white hover:shadow-sm border border-gray-500 rounded-full transition-all`}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="spaceStarOutline"
                      onClick={handleUpdateBanner}
                      size="lg"
                      className={`${buttonVariants({ variant: "spaceStarOutline" })} font-normal text-gray-700 hover:shadow-md border border-gray-500 rounded-full transition-all`}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Updating..." : "Update"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      </div>
    </RequireAuth>
  );
}
