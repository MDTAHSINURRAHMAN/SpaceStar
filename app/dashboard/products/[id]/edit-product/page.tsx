"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { BackPage } from "@/app/components/backPage/backpage";

interface ProductImage {
  url: string;
  file?: File;
}

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  shortDescription: z.string().min(1, "Short description is required"),
  longDescription: z.string().min(1, "Long description is required"),
  price: z.string().min(1, "Price is required"),
  category: z.string().min(1, "Category is required"),
  stock: z.string().min(1, "Stock is required"),
  images: z
    .array(z.any())
    .min(1, "At least one image is required")
    .max(5, "Maximum 5 images allowed"),
  isPreOrder: z.boolean(),
  isFeatured: z.boolean(),
  isOnSale: z.boolean(),
  salePrice: z.string().optional(),
  designer: z.string().optional(),
  features: z.array(z.string()),
  sizes: z.array(z.string()).min(1, "At least one size is required"),
  colors: z.array(z.string()).min(1, "At least one color is required"),
  material: z.string().optional(),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
});

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<z.infer<typeof productSchema> | null>(
    null
  );
  const [images, setImages] = useState<ProductImage[]>([]);
  const [sizes, setSizes] = useState<string[]>([""]);
  const [colors, setColors] = useState<string[]>([""]);
  const [features, setFeatures] = useState<string[]>([""]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      shortDescription: "",
      longDescription: "",
      price: "",
      category: "",
      stock: "",
      images: [],
      isPreOrder: false,
      isFeatured: false,
      isOnSale: false,
      salePrice: "",
      designer: "",
      features: [""],
      sizes: [""],
      colors: [""],
      material: "",
      weight: "",
      dimensions: "",
    },
  });

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages = [...images];
      newImages[index] = { url: URL.createObjectURL(files[0]), file: files[0] };
      setImages(newImages);
      form.setValue("images", newImages);
    }
  };

  const addImageField = () => {
    if (images.length < 5) {
      setImages([...images, { url: "" }]);
    }
  };

  const removeImageField = (index: number) => {
    if (images.length > 1) {
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
      form.setValue("images", newImages);
    }
  };

  const removeExistingImage = (index: number) => {
    const newExistingImages = existingImages.filter((_, i) => i !== index);
    setExistingImages(newExistingImages);
    form.setValue("images", [
      ...newExistingImages,
      ...images.filter((img) => img.url !== ""),
    ]);
  };

  const handleSizeChange = (value: string, index: number) => {
    const newSizes = [...sizes];
    newSizes[index] = value;
    setSizes(newSizes);
    form.setValue(
      "sizes",
      newSizes.filter((size) => size.trim() !== "")
    );
  };

  const addSizeField = () => {
    setSizes([...sizes, ""]);
  };

  const removeSizeField = (index: number) => {
    if (sizes.length > 1) {
      const newSizes = sizes.filter((_, i) => i !== index);
      setSizes(newSizes);
      form.setValue(
        "sizes",
        newSizes.filter((size) => size.trim() !== "")
      );
    }
  };

  const handleColorChange = (value: string, index: number) => {
    const newColors = [...colors];
    newColors[index] = value;
    setColors(newColors);
    form.setValue(
      "colors",
      newColors.filter((color) => color.trim() !== "")
    );
  };

  const addColorField = () => {
    setColors([...colors, ""]);
  };

  const removeColorField = (index: number) => {
    if (colors.length > 1) {
      const newColors = colors.filter((_, i) => i !== index);
      setColors(newColors);
      form.setValue(
        "colors",
        newColors.filter((color) => color.trim() !== "")
      );
    }
  };

  const handleFeatureChange = (value: string, index: number) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
    form.setValue(
      "features",
      newFeatures.filter((feature) => feature.trim() !== "")
    );
  };

  const addFeatureField = () => {
    setFeatures([...features, ""]);
  };

  const removeFeatureField = (index: number) => {
    if (features.length > 1) {
      const newFeatures = features.filter((_, i) => i !== index);
      setFeatures(newFeatures);
      form.setValue(
        "features",
        newFeatures.filter((feature) => feature.trim() !== "")
      );
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    async function fetchProduct() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = await response.json();
        setProduct(data);

        // Handle existing images
        if (data.images && Array.isArray(data.images)) {
          setExistingImages(data.images);
          setImages([{ url: "" }]);
        } else {
          setImages([{ url: "" }]);
        }

        // Handle sizes
        if (data.sizes && Array.isArray(data.sizes) && data.sizes.length > 0) {
          setSizes(data.sizes);
        } else {
          setSizes([""]);
        }

        // Handle colors
        if (
          data.colors &&
          Array.isArray(data.colors) &&
          data.colors.length > 0
        ) {
          setColors(data.colors);
        } else {
          setColors([""]);
        }

        // Handle features
        if (
          data.features &&
          Array.isArray(data.features) &&
          data.features.length > 0
        ) {
          setFeatures(data.features);
        } else {
          setFeatures([""]);
        }

        form.reset({
          name: data.name || "",
          shortDescription: data.shortDescription || "",
          longDescription: data.longDescription || "",
          price: data.price ? data.price.toString() : "",
          category: data.category || "",
          stock: data.stock ? data.stock.toString() : "",
          images: data.images || [],
          isPreOrder: data.isPreOrder || false,
          isFeatured: data.isFeatured || false,
          isOnSale: data.isOnSale || false,
          salePrice: data.salePrice ? data.salePrice.toString() : "",
          designer: data.designer || "",
          features: data.features || [""],
          sizes: data.sizes || [""],
          colors: data.colors || [""],
          material: data.material || "",
          weight: data.weight || "",
          dimensions: data.dimensions || "",
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error fetching product:", error);
          toast.error("Failed to fetch product");
          router.push("/dashboard/products");
        } else {
          console.error("Unexpected error:", error);
          toast.error("Something went wrong");
        }
      }
    }

    if (id) {
      fetchProduct();
    }
  }, [id, form, router]);

  async function onSubmit(values: z.infer<typeof productSchema>) {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token"); // ✅ Add this
      if (!token) {
        toast.error("Not authorized, no token");
        router.push("/login");
        return;
      }
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("shortDescription", values.shortDescription);
      formData.append("longDescription", values.longDescription);
      formData.append("price", values.price);
      formData.append("category", values.category);
      formData.append("stock", values.stock);
      formData.append("isPreOrder", values.isPreOrder.toString());
      formData.append("isFeatured", values.isFeatured.toString());
      formData.append("isOnSale", values.isOnSale.toString());

      if (values.salePrice) {
        formData.append("salePrice", values.salePrice);
      }

      if (values.designer) {
        formData.append("designer", values.designer);
      }

      if (values.material) {
        formData.append("material", values.material);
      }

      if (values.weight) {
        formData.append("weight", values.weight);
      }

      if (values.dimensions) {
        formData.append("dimensions", values.dimensions);
      }

      // Filter out empty strings
      const filteredSizes = values.sizes.filter((size) => size.trim() !== "");
      const filteredColors = values.colors.filter(
        (color) => color.trim() !== ""
      );
      const filteredFeatures = values.features.filter(
        (feature) => feature.trim() !== ""
      );

      formData.append("sizes", JSON.stringify(filteredSizes));
      formData.append("colors", JSON.stringify(filteredColors));
      formData.append("features", JSON.stringify(filteredFeatures));

      // Append existing images
      formData.append("existingImages", JSON.stringify(existingImages));

      // Append new image files
      images.forEach((image) => {
        if (image.file instanceof File) {
          formData.append("images", image.file);
        }
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update product");
      }

      toast.success("Product updated successfully");
      router.push("/dashboard/products");
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error updating product:", error);
        toast.error(error.message || "Something went wrong");
      } else {
        console.error("Unexpected error:", error);
        toast.error("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    } 
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading product data...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <BackPage />
          <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

          <FormField
            control={form.control}
            name="shortDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Short Description</FormLabel>
                <FormControl>
                  <Textarea
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
            name="longDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Long Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detailed product description"
                    {...field}
                    rows={5}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="material"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material</FormLabel>
                  <FormControl>
                    <Input placeholder="Product material" {...field} />
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
                    <Input placeholder="Product weight" {...field} />
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
                    <Input placeholder="Product dimensions" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
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
                    <FormLabel>Pre-order</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Mark this product as available for pre-order
                    </p>
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
                    <FormLabel>Featured</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Mark this product as featured
                    </p>
                  </div>
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
                    <p className="text-sm text-muted-foreground">
                      Mark this product as on sale
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </div>

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

          {/* Features */}
          <div className="space-y-4">
            <FormLabel>Features</FormLabel>
            {features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <FormField
                  control={form.control}
                  name={`features.${index}`}
                  render={() => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="Enter product feature"
                          value={feature}
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

          {/* Image Upload */}
          <div className="space-y-4">
            <FormLabel>Product Images (up to 5)</FormLabel>
            {existingImages.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mb-4">
                {existingImages.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={img}
                      alt={`Product image ${idx + 1}`}
                      className="h-24 w-24 object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removeExistingImage(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {images.map((_, index) => (
              <div key={index} className="flex gap-2">
                <FormField
                  control={form.control}
                  name={`images.${index}`}
                  render={() => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, index)}
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
            {images.length + existingImages.length < 5 && (
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
            {sizes.map((size, index) => (
              <div key={index} className="flex gap-2">
                <FormField
                  control={form.control}
                  name={`sizes.${index}`}
                  render={() => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="Enter size (e.g., S, M, L)"
                          value={size}
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
            {colors.map((color, index) => (
              <div key={index} className="flex gap-2">
                <FormField
                  control={form.control}
                  name={`colors.${index}`}
                  render={() => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="Enter color (e.g., Red, Blue)"
                          value={color}
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
            {isLoading ? "Updating..." : "Update Product"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
