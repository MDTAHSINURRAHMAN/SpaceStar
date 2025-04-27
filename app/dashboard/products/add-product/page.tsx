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

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
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
});

export default function AddProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [sizes, setSizes] = useState<string[]>([""]);
  const [colors, setColors] = useState<string[]>([""]);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      images: [],
      isPreOrder: false,
      sizes: [""],
      colors: [""],
    },
  });

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages = [...images];
      newImages[index] = files[0];
      setImages(newImages);
      form.setValue("images", newImages);
    }
  };

  const addImageField = () => {
    if (images.length < 5) {
      setImages([...images, new File([], "")]);
    }
  };

  const removeImageField = (index: number) => {
    if (images.length > 1) {
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
      form.setValue("images", newImages);
    }
  };

  const handleSizeChange = (value: string, index: number) => {
    const newSizes = [...sizes];
    newSizes[index] = value;
    setSizes(newSizes);
    form.setValue("sizes", newSizes);
  };

  const addSizeField = () => {
    setSizes([...sizes, ""]);
  };

  const removeSizeField = (index: number) => {
    if (sizes.length > 1) {
      const newSizes = sizes.filter((_, i) => i !== index);
      setSizes(newSizes);
      form.setValue("sizes", newSizes);
    }
  };

  const handleColorChange = (value: string, index: number) => {
    const newColors = [...colors];
    newColors[index] = value;
    setColors(newColors);
    form.setValue("colors", newColors);
  };

  const addColorField = () => {
    setColors([...colors, ""]);
  };

  const removeColorField = (index: number) => {
    if (colors.length > 1) {
      const newColors = colors.filter((_, i) => i !== index);
      setColors(newColors);
      form.setValue("colors", newColors);
    }
  };

  async function onSubmit(values: z.infer<typeof productSchema>) {
    try {
      setIsLoading(true);
  
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("price", values.price);
      formData.append("category", values.category);
      formData.append("stock", values.stock);
      formData.append("isPreOrder", values.isPreOrder.toString());
  
      values.sizes.forEach((size) => {
        formData.append("sizes", size);
      });
      values.colors.forEach((color) => {
        formData.append("colors", color);
      });
  
      values.images.forEach((image) => {
        formData.append("images", image);
      });
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Failed to create product");
      }
  
      toast.success("Product created successfully");
      router.push("/dashboard/products");
    } catch (error) {
      toast.error("Something went wrong: " + error);
    } finally {
      setIsLoading(false);
    }
  }
  

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Add New Product</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Product Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Product description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Product category" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image Upload */}
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
          <div className="space-y-4">
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

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Product"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
