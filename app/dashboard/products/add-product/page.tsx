"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { BackPage } from "@/app/components/backPage/backpage";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateProductMutation } from "@/lib/api/productApi";
import RequireAuth from "@/app/providers/RequireAuth";
import Loader from "@/app/components/Loader";
const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  shortDescription: z.string().min(1, "Short description is required"),
  longDescription: z.string().min(1, "Long description is required"),
  designer: z.string().min(1, "Designer is required"),
  features: z.array(z.string()).min(1, "At least one feature is required"),
  price: z.string().min(1, "Price is required"),
  category: z.string().min(1, "Category is required"),
  stock: z.string().min(1, "Stock is required"),
  images: z
    .array(z.instanceof(File))
    .min(1, "At least one image is required")
    .max(5, "Maximum 5 images allowed"),
  isPreOrder: z.boolean(),
  sizes: z.array(z.string()).min(1, "At least one size is required"),
  colors: z.array(z.string()).min(1, "At least one color is required"),
  material: z.string().optional(),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  isFeatured: z.boolean(),
  isOnSale: z.boolean(),
  salePrice: z.string().optional(),
});

const PRODUCT_CATEGORIES = [
  "T-Shirt",
  "Hoodie",
  "Jacket",
  "Pants",
  "Shorts",
  "Socks",
  "Accessories",
  "Shoes",
  "Bags",
  "Hats",
  "Sunglasses",
  "Watches",
  "Wallets",
] as const;

const DEFAULT_FORM_VALUES = {
  name: "",
  shortDescription: "",
  longDescription: "",
  designer: "",
  features: [""],
  price: "",
  category: "",
  stock: "",
  images: [],
  isPreOrder: false,
  sizes: [""],
  colors: [""],
  material: "",
  weight: "",
  dimensions: "",
  isFeatured: false,
  isOnSale: false,
  salePrice: "",
};

export default function AddProductPage() {
  const router = useRouter();
  const [createProduct] = useCreateProductMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [sizes, setSizes] = useState<string[]>([""]);
  const [colors, setColors] = useState<string[]>([""]);
  const [features, setFeatures] = useState<string[]>([""]);

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const files = e.target.files;
    if (!files?.length) return;
    const newImages = [...images];
    newImages[index] = files[0];
    setImages(newImages);
    form.setValue("images", newImages);
  };

  const addImageField = () => {
    if (images.length >= 5) return;
    setImages([...images, new File([], "")]);
  };

  const removeImageField = (index: number) => {
    if (images.length <= 1) return;
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    form.setValue("images", newImages);
  };

  const handleFeatureChange = (value: string, index: number) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
    form.setValue("features", updated);
  };

  const addFeatureField = () => {
    const updated = [...features, ""];
    setFeatures(updated);
    form.setValue("features", updated);
  };

  const removeFeatureField = (index: number) => {
    if (features.length <= 1) return;
    const updated = features.filter((_, i) => i !== index);
    setFeatures(updated);
    form.setValue("features", updated);
  };

  const handleSizeChange = (value: string, index: number) => {
    const updated = [...sizes];
    updated[index] = value;
    setSizes(updated);
    form.setValue("sizes", updated);
  };

  const addSizeField = () => {
    const updated = [...sizes, ""];
    setSizes(updated);
    form.setValue("sizes", updated);
  };

  const removeSizeField = (index: number) => {
    if (sizes.length <= 1) return;
    const updated = sizes.filter((_, i) => i !== index);
    setSizes(updated);
    form.setValue("sizes", updated);
  };

  const handleColorChange = (value: string, index: number) => {
    const updated = [...colors];
    updated[index] = value;
    setColors(updated);
    form.setValue("colors", updated);
  };

  const addColorField = () => {
    const updated = [...colors, ""];
    setColors(updated);
    form.setValue("colors", updated);
  };

  const removeColorField = (index: number) => {
    if (colors.length <= 1) return;
    const updated = colors.filter((_, i) => i !== index);
    setColors(updated);
    form.setValue("colors", updated);
  };

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    try {
      setIsLoading(true);
      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        if (["images", "features", "sizes", "colors"].includes(key)) return;
        if (value !== undefined && value !== "") {
          formData.append(key, value.toString());
        }
      });

      values.features.forEach((feature) =>
        formData.append("features", feature)
      );
      values.sizes.forEach((size) => formData.append("sizes", size));
      values.colors.forEach((color) => formData.append("colors", color));
      values.images.forEach((image) => formData.append("images", image));

      await createProduct(formData).unwrap();
      toast.success("Product created successfully");
      router.push("/dashboard/products");
    } catch (error: any) {
      toast.error(
        "Error creating product: " + (error?.message || "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
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
      <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BackPage />
            <h2 className="text-3xl font-bold tracking-tight">
              Add New Product
            </h2>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Brief product description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="designer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designer</FormLabel>
                      <FormControl>
                        <Input placeholder="Product designer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRODUCT_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h3 className="text-lg font-medium mb-4">Pricing & Inventory</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isOnSale"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>On Sale</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("isOnSale") && (
                  <FormField
                    control={form.control}
                    name="salePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sale Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="isPreOrder"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Pre-Order</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Featured Product</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h3 className="text-lg font-medium mb-4">Product Details</h3>

              <FormField
                control={form.control}
                name="longDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Long Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed product description"
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Features */}
              <div className="space-y-4 mt-4">
                <FormLabel>Features</FormLabel>
                {features.map((_, index) => (
                  <div key={index} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`features.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="Enter product feature"
                              {...field}
                              onChange={(e) =>
                                handleFeatureChange(e.target.value, index)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {features.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeFeatureField(index)}
                        className="mt-0"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addFeatureField}
                  className="mt-2"
                >
                  Add Another Feature
                </Button>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="material"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Cotton, Leather" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 500g" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dimensions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dimensions</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 10 x 20 x 5 cm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Variants */}
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h3 className="text-lg font-medium mb-4">Product Variants</h3>

              {/* Sizes */}
              <div className="space-y-4">
                <FormLabel>Sizes</FormLabel>
                {sizes.map((_, index) => (
                  <div key={index} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`sizes.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="Enter size (e.g., S, M, L)"
                              {...field}
                              onChange={(e) =>
                                handleSizeChange(e.target.value, index)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {sizes.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeSizeField(index)}
                        className="mt-0"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSizeField}
                  className="mt-2"
                >
                  Add Another Size
                </Button>
              </div>

              {/* Colors */}
              <div className="space-y-4 mt-6">
                <FormLabel>Colors</FormLabel>
                {colors.map((_, index) => (
                  <div key={index} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`colors.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="Enter color (e.g., Red, Blue)"
                              {...field}
                              onChange={(e) =>
                                handleColorChange(e.target.value, index)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {colors.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeColorField(index)}
                        className="mt-0"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addColorField}
                  className="mt-2"
                >
                  Add Another Color
                </Button>
              </div>
            </div>

            {/* Image Upload */}
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h3 className="text-lg font-medium mb-4">Product Images</h3>
              <div className="space-y-4">
                <FormLabel>Product Images (up to 5)</FormLabel>
                {images.map((_, index) => (
                  <div key={index} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`images.${index}`}
                      render={({ field: { value, onChange, ...field } }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageChange(e, index)}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {images.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeImageField(index)}
                        className="mt-0"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                {images.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addImageField}
                    className="mt-2"
                  >
                    Add Another Image
                  </Button>
                )}
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating..." : "Create Product"}
            </Button>
          </form>
        </Form>
      </div>
    </RequireAuth>
  );
}
