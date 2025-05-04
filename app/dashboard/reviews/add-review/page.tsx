"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, Upload } from "lucide-react";
import { toast } from "sonner";
import { useGetAllProductsQuery } from "@/lib/api/productApi";
import { useCreateReviewMutation } from "@/lib/api/reviewApi";

export default function AddReviewPage() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    product: "",
    customer: "",
    comment: "",
    subtext: "", // ✅ Add this
    status: "Pending",
  });

  const { data: products = [] } = useGetAllProductsQuery();
  const [createReview, { isLoading }] = useCreateReviewMutation();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.product || !formData.customer || !rating) {
      toast.error("Please fill all required fields");
      return;
    }

    const formPayload = new FormData();
    formPayload.append("productId", formData.product);
    formPayload.append("name", formData.customer);
    formPayload.append("rating", rating.toString());
    formPayload.append("review", formData.comment);
    formPayload.append("subtext", formData.subtext);
    formPayload.append("status", formData.status);

    if (image) {
      formPayload.append("image", image); // ✅ Send image file
    }

    console.log("📷 review", formPayload);

    try {
      await createReview(formPayload).unwrap(); // <-- Ensure your RTK endpoint supports multipart/form-data
      toast.success("Review added successfully");
      router.push("/dashboard/reviews");
    } catch (error) {
      toast.error("Failed to add review");
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-6 w-6 cursor-pointer ${
          index < (hoverRating || rating)
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-300"
        }`}
        onMouseEnter={() => setHoverRating(index + 1)}
        onMouseLeave={() => setHoverRating(0)}
        onClick={() => setRating(index + 1)}
      />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add New Review</h1>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/reviews")}
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="product">Product *</Label>
            <Select
              value={formData.product}
              onValueChange={(value) => handleSelectChange("product", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product._id} value={product._id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer">Customer Name *</Label>
            <Input
              id="customer"
              name="customer"
              value={formData.customer}
              onChange={handleInputChange}
              placeholder="Enter customer name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Rating *</Label>
          <div className="flex space-x-1">{renderStars()}</div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subtext">Subtext</Label>
          <Input
            id="subtext"
            name="subtext"
            value={formData.subtext}
            onChange={handleInputChange}
            placeholder="Enter subtext"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="comment">Comment</Label>
          <Textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            placeholder="Enter review comment"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Upload Image</Label>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-4">
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex h-10 items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              {image && (
                <span className="text-sm text-muted-foreground">
                  {image.name}
                </span>
              )}
            </div>
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-40 w-auto rounded-md object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Adding..." : "Add Review"}
        </Button>
      </form>
    </motion.div>
  );
}
