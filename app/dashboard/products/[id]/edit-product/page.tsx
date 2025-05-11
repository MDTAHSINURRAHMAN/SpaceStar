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
import {
  useGetProductQuery,
  useUpdateProductMutation,
  useUploadChartImageMutation,
  useGetAllCategoriesQuery,
} from "@/lib/api/productApi";
import RequireAuth from "@/app/providers/RequireAuth";
import Loader from "@/app/components/Loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header } from "@/app/components/header/Header";
import { ProductsPageContent } from "@/app/components/ProductsPageContent";

interface ProductImage {
  url: string;
  file?: File;
}

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
    .array(z.any())
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

// Helper to extract S3 key from signed URL
function extractS3KeyFromUrl(url: string): string {
  // Match 'products/...' with or without a leading slash, and always return without leading slash
  const match = url.match(/\/?(products\/[^?]+)/);
  return match ? match[1] : url.replace(/^\//, "");
}

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [sizes, setSizes] = useState<string[]>([""]);
  const [colors, setColors] = useState<string[]>([""]);
  const [features, setFeatures] = useState<string[]>([""]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [displayImages, setDisplayImages] = useState<string[]>([]);
  const [chartImage, setChartImage] = useState<File | null>(null);
  const [existingChartImage, setExistingChartImage] = useState<string | null>(
    null
  );

  const {
    data: product,
    isLoading,
    refetch,
  } = useGetProductQuery(id as string);

  // Fetch categories dynamically
  const { data, isLoading: isCategoriesLoading } = useGetAllCategoriesQuery();
  const categories = Array.isArray(data) ? data : [];

  // Debug logs for .map variables
  console.log(
    "categories",
    categories,
    "typeof",
    typeof categories,
    "isArray",
    Array.isArray(categories)
  );
  console.log(
    "features",
    features,
    "typeof",
    typeof features,
    "isArray",
    Array.isArray(features)
  );
  console.log(
    "sizes",
    sizes,
    "typeof",
    typeof sizes,
    "isArray",
    Array.isArray(sizes)
  );
  console.log(
    "colors",
    colors,
    "typeof",
    typeof colors,
    "isArray",
    Array.isArray(colors)
  );
  console.log(
    "displayImages",
    displayImages,
    "typeof",
    typeof displayImages,
    "isArray",
    Array.isArray(displayImages)
  );

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

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name || "",
        shortDescription: product.shortDescription || "",
        longDescription: product.longDescription || "",
        price: product.price?.toString() || "",
        category: product.category || "",
        stock: product.stock?.toString() || "",
        images: product.images || [],
        isPreOrder:
          typeof product.isPreOrder === "boolean" ? product.isPreOrder : false,
        isFeatured:
          typeof product.isFeatured === "boolean" ? product.isFeatured : false,
        isOnSale:
          typeof product.isOnSale === "boolean" ? product.isOnSale : false,
        salePrice: product.salePrice?.toString() || "",
        designer: product.designer || "",
        features: product.features || [""],
        sizes: product.sizes || [""],
        colors: product.colors || [""],
        material: product.material || "",
        weight: product.weight || "",
        dimensions: product.dimensions || "",
      });

      // Populate local states
      setExistingImages((product.images || []).map(extractS3KeyFromUrl));
      setDisplayImages(product.images || []);
      setImages([{ url: "" }]);
      setSizes(product.sizes || [""]);
      setColors(product.colors || [""]);
      setFeatures(product.features || [""]);
      setExistingChartImage(
        product.chartImage ? extractS3KeyFromUrl(product.chartImage) : null
      );
    }
  }, [product, form]);

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
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
    setDisplayImages((prev) => prev.filter((_, i) => i !== index));
    form.setValue("images", [
      ...existingImages.filter((_, i) => i !== index),
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
  const [updateProduct] = useUpdateProductMutation();
  const [uploadChartImage] = useUploadChartImageMutation();

  async function onSubmit(values: z.infer<typeof productSchema>) {
    try {
      setIsSubmitting(true);

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

      if (values.salePrice) formData.append("salePrice", values.salePrice);
      if (values.designer) formData.append("designer", values.designer);
      if (values.material) formData.append("material", values.material);
      if (values.weight) formData.append("weight", values.weight);
      if (values.dimensions) formData.append("dimensions", values.dimensions);

      const filteredSizes = values.sizes.filter((v) => v.trim() !== "");
      const filteredColors = values.colors.filter((v) => v.trim() !== "");
      const filteredFeatures = values.features.filter((v) => v.trim() !== "");

      formData.append("sizes", JSON.stringify(filteredSizes));
      formData.append("colors", JSON.stringify(filteredColors));
      formData.append("features", JSON.stringify(filteredFeatures));
      formData.append("existingImages", JSON.stringify(existingImages));
      if (existingChartImage) {
        formData.append("existingChartImage", existingChartImage);
      }

      images.forEach((image) => {
        if (image.file instanceof File) {
          formData.append("images", image.file);
        }
      });

      await updateProduct({ id: id as string, formData }).unwrap();
      if (chartImage) {
        const chartFormData = new FormData();
        chartFormData.append("chartImage", chartImage);
        await uploadChartImage({ id: id as string, formData: chartFormData });
      }
      toast.success("Product updated successfully");
      refetch();
      router.push("/dashboard/products");
    } catch (error: any) {
      if (error?.status === 401 || error?.status === 403) {
        toast.error("Not authorized. Please log in again.");
        router.push("/login");
      } else {
        console.error("Error updating product:", error);
        toast.error(error?.data?.message || "Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

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
            <Header pageName="Edit Product" />
          </div>
          <div className="w-2/3 mx-auto mt-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* Basic Information */}
                <div className="">
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
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    isCategoriesLoading
                                      ? "Loading..."
                                      : "Select a category"
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isCategoriesLoading ? (
                                <SelectItem value="" disabled>
                                  Loading...
                                </SelectItem>
                              ) : (
                                categories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                {/* Pricing & Inventory */}
                <div className="">
                  <h3 className="text-lg font-medium mb-4">
                    Pricing & Inventory
                  </h3>
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
                <div className="">
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
                    {features.map((feature, index) => (
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
                            variant="spaceStarOutline"
                            onClick={() => removeFeatureField(index)}
                            className="mt-0 font-normal bg-red-500 text-white hover:shadow-sm rounded-full transition-all cursor-pointer"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="spaceStarOutline"
                      onClick={addFeatureField}
                      className="mt-2 font-normal text-gray-700 hover:shadow-md rounded-full transition-all border border-gray-700"
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
                            <Input
                              placeholder="e.g., Cotton, Leather"
                              {...field}
                            />
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
                            <Input
                              placeholder="e.g., 10 x 20 x 5 cm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                {/* Variants */}
                <div className="">
                  <h3 className="text-lg font-medium mb-4">Product Variants</h3>
                  {/* Sizes */}
                  <div className="space-y-4">
                    <FormLabel>Sizes</FormLabel>
                    {sizes.map((size, index) => (
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
                            variant="spaceStarOutline"
                            onClick={() => removeSizeField(index)}
                            className="mt-0 font-normal bg-red-500 text-white hover:shadow-sm rounded-full transition-all cursor-pointer"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="spaceStarOutline"
                      onClick={addSizeField}
                      className="mt-2 font-normal text-gray-700 hover:shadow-md rounded-full transition-all border border-gray-700"
                    >
                      Add Another Size
                    </Button>
                  </div>
                  {/* Colors */}
                  <div className="space-y-4 mt-6">
                    <FormLabel>Colors</FormLabel>
                    {colors.map((color, index) => (
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
                            variant="spaceStarOutline"
                            onClick={() => removeColorField(index)}
                            className="mt-0 font-normal bg-red-500 text-white hover:shadow-sm rounded-full transition-all cursor-pointer"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="spaceStarOutline"
                      onClick={addColorField}
                      className="mt-2 font-normal text-gray-700 hover:shadow-sm rounded-full transition-all border border-gray-700"
                    >
                      Add Another Color
                    </Button>
                  </div>
                </div>
                {/* Image Upload */}
                <div className="">
                  <h3 className="text-lg font-medium mb-4">Product Images</h3>
                  <div className="space-y-4">
                    <FormLabel>Product Images (up to 5)</FormLabel>
                    {/* Existing Images */}
                    {displayImages.length > 0 && (
                      <div className="grid grid-cols-5 gap-2 mb-4">
                        {displayImages.map((img, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={img}
                              alt={`Product image ${idx + 1}`}
                              className="h-24 w-24 object-cover rounded-md"
                            />
                            <Button
                              type="button"
                              variant="spaceStarOutline"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 bg-red-500 text-white"
                              onClick={() => removeExistingImage(idx)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* New Images */}
                    {images.map((img, index) => (
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
                            variant="spaceStarOutline"
                            onClick={() => removeImageField(index)}
                            className="mt-0 font-normal bg-red-500 text-white hover:shadow-sm rounded-full transition-all cursor-pointer"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                    {images.length + existingImages.length < 5 && (
                      <Button
                        type="button"
                        variant="spaceStarOutline"
                        onClick={addImageField}
                        className="mt-2 font-normal text-gray-700 hover:shadow-sm rounded-full transition-all border border-gray-700"
                      >
                        Add Another Image
                      </Button>
                    )}
                  </div>
                </div>

                {/* Chart Image Upload */}
                <div className="">
                  <h3 className="text-lg font-medium mb-4">Chart Image</h3>
                  {product?.chartImage && (
                    <div className="mb-2">
                      <img
                        src={product.chartImage}
                        alt="Chart"
                        className="h-32 w-auto object-contain border rounded"
                      />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setChartImage(e.target.files[0]);
                      }
                    }}
                  />
                </div>
                <Button
                  variant="spaceStarOutline"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 font-normal text-gray-700 hover:shadow-md rounded-full transition-all border border-gray-700 mb-10"
                >
                  {isSubmitting ? "Updating..." : "Update Product"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </ProductsPageContent>
    </RequireAuth>
  );
}
