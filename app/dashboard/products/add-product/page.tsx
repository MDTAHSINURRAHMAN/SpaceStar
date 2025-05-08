"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateProductMutation,
  useUploadChartImageMutation,
  useGetAllCategoriesQuery,
} from "@/lib/api/productApi";
import RequireAuth from "@/app/providers/RequireAuth";
import Loader from "@/app/components/Loader";
import { Header } from "@/app/components/header/Header";
import { ProductsPageContent } from "@/app/components/ProductsPageContent";

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
  const [uploadChartImage] = useUploadChartImageMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [sizes, setSizes] = useState<string[]>([""]);
  const [colors, setColors] = useState<string[]>([""]);
  const [features, setFeatures] = useState<string[]>([""]);
  const [chartImage, setChartImage] = useState<File | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [localCategories, setLocalCategories] = useState<string[]>([]);
  const { data: categories = [], isLoading: isCategoriesLoading } =
    useGetAllCategoriesQuery();
  const allCategories = [...new Set([...categories, ...localCategories])];

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
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
      
      if (chartImage) {
        formData.append("chartImage", chartImage);
      }

      const createdProduct = await createProduct(formData).unwrap();
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
      <ProductsPageContent>
        <div className="font-roboto">
          <div className="w-full">
            <Header pageName="Add Product" />
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
                            onValueChange={(value) => {
                              if (value === "__add_new__") {
                                setIsAddingCategory(true);
                                field.onChange("");
                              } else {
                                setIsAddingCategory(false);
                                field.onChange(value);
                              }
                            }}
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
                              {allCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                              <SelectItem value="__add_new__">
                                Add new category
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {isAddingCategory && (
                            <div className="flex gap-2 mt-2">
                              <Input
                                placeholder="Enter new category"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                  }
                                }}
                              />
                              <Button
                                variant="spaceStarOutline"
                                type="button"
                                onClick={() => {
                                  if (
                                    newCategory &&
                                    !allCategories.includes(newCategory.trim())
                                  ) {
                                    setLocalCategories((prev) => [
                                      ...prev,
                                      newCategory.trim(),
                                    ]);
                                    setIsAddingCategory(false);
                                    setNewCategory("");
                                  }
                                }}
                                disabled={!newCategory.trim()}
                                className="border border-gray-500 text-gray-700 font-normal hover:shadow-md"
                              >
                                Add Category
                              </Button>
                            </div>
                          )}
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
                      className={`${buttonVariants({
                        variant: "spaceStarOutline",
                      })} font-normal text-gray-700 hover:shadow-md rounded-full transition-all border border-gray-700`}
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
                      className={`${buttonVariants({
                        variant: "spaceStarOutline",
                      })} font-normal text-gray-700 hover:shadow-md rounded-full transition-all border border-gray-700`}
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
                      className={`${buttonVariants({
                        variant: "spaceStarOutline",
                      })} font-normal text-gray-700 hover:shadow-md rounded-full transition-all border border-gray-700`}
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
                    {images.map((_, index) => (
                      <div key={index} className="flex gap-2">
                        <FormField
                          control={form.control}
                          name={`images.${index}`}
                          render={({ field: { ref, name } }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  name={name}
                                  ref={ref}
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
                    {images.length < 5 && (
                      <Button
                        type="button"
                        variant="spaceStarOutline"
                        onClick={addImageField}
                        className={`${buttonVariants({
                          variant: "spaceStarOutline",
                        })} font-normal text-gray-700 hover:shadow-md rounded-full transition-all border border-gray-700`}
                      >
                        Add Another Image
                      </Button>
                    )}
                  </div>
                </div>

                {/* Chart Image Upload */}
                <div className="">
                  <h3 className="text-lg font-medium mb-4">Chart Image</h3>
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
                  disabled={isLoading}
                  className="w-1/2 font-normal text-gray-700 hover:shadow-md rounded-full transition-all border border-gray-700 mb-10"
                >
                  {isLoading ? "Creating..." : "Create Product"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </ProductsPageContent>
    </RequireAuth>
  );
}
