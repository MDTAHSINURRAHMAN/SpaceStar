"use client";

import { useState } from "react";
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
import RequireAuth from "@/app/providers/RequireAuth";
import Loader from "@/app/components/Loader";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/app/components/header/Header";
import { ProductsPageContent } from "@/app/components/ProductsPageContent";
import { buttonVariants } from "@/components/ui/button";

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
    subtext: "",
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
      formPayload.append("image", image);
    }

    console.log("📷 review", formPayload);

    try {
      await createReview(formPayload).unwrap();
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }
  return (
    <RequireAuth>
      <ProductsPageContent>
        <div className="font-roboto">
          <div className="w-full">
            <Header pageName="Add Review" />
          </div>
          <div className="w-2/3 mx-auto mt-8">
            <Card>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="product">Product *</Label>
                      <Select
                        value={formData.product}
                        onValueChange={(value) =>
                          handleSelectChange("product", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a product from the list" />
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
                        placeholder="Enter the customer's full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          handleSelectChange("status", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose review status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
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
                      placeholder="Add a brief summary or highlight (optional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comment">Comment</Label>
                    <Textarea
                      id="comment"
                      name="comment"
                      value={formData.comment}
                      onChange={handleInputChange}
                      placeholder="Write your detailed review here..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Upload Image</Label>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-4">
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer"
                        >
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
                  <div className="flex justify-between items-center pt-4">
                    <Button value={buttonVariants({ variant: "spaceStarOutline" })} type="submit" disabled={isLoading} className="w-1/2 font-normal bg-transparent text-gray-700 hover:shadow-md rounded-full transition-all border border-gray-700">
                      {isLoading ? "Creating..." : "Create Review"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProductsPageContent>
    </RequireAuth>
  );
}
