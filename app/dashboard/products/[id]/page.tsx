"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Edit } from "lucide-react";
import { BackPage } from "@/app/components/backPage/backpage";
import { useGetProductQuery } from "@/lib/api/productApi";
import RequireAuth from "@/app/providers/RequireAuth";
import Loader from "@/app/components/Loader";
export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: product, isLoading, error } = useGetProductQuery(id as string);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h2 className="text-xl font-semibold text-gray-800">Product Not Found</h2>
        <p className="text-gray-600 mt-2">The requested product could not be found.</p>
        <Button onClick={() => router.push('/dashboard/products')} className="mt-4">
          Return to Products
        </Button>
      </div>
    );
  }

  const {
    name,
    price,
    salePrice,
    isOnSale,
    isPreOrder,
    isFeatured,
    category,
    shortDescription,
    longDescription,
    designer,
    features,
    stock,
    sizes,
    colors,
    material,
    weight,
    dimensions,
    images,
    createdAt,
    updatedAt
  } = product;

  return (
    <RequireAuth>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <BackPage />
            <h1 className="text-2xl font-bold text-gray-900">Product Details</h1>
          </div>
          <Button
            onClick={() => router.push(`/dashboard/products/${product._id}/edit-product`)}
            variant="outline"
            className="hover:bg-gray-100"
          >
            <Edit className="mr-2 h-4 w-4" /> Edit Product
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {images?.length ? (
                  images.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-primary transition-colors"
                    >
                      <Image
                        src={url}
                        alt={`${name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={index === 0}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 aspect-video bg-gray-50 flex items-center justify-center rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500">No images available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
                <div className="flex items-center mt-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {isOnSale ? (
                      <>
                        <span className="text-gray-400 line-through mr-2">${price}</span>
                        <span className="text-red-600">${salePrice}</span>
                      </>
                    ) : (
                      `$${price}`
                    )}
                  </p>
                  <div className="ml-auto flex gap-2">
                    {isPreOrder && <Badge variant="secondary">Pre-Order</Badge>}
                    {isFeatured && <Badge variant="default">Featured</Badge>}
                    <Badge variant="outline">{category}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Short Description</h4>
                  <p className="mt-1 text-gray-700">{shortDescription}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Full Description</h4>
                  <p className="mt-1 text-gray-700 whitespace-pre-line">{longDescription}</p>
                </div>

                {designer && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Designer</h4>
                    <p className="mt-1 text-gray-700">{designer}</p>
                  </div>
                )}

                {features?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Key Features</h4>
                    <ul className="mt-1 list-disc pl-5 space-y-1">
                      {features.map((feature, index) => (
                        <li key={index} className="text-gray-700">{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Stock Level</h4>
                    <p className="mt-1 text-gray-700">{stock} units</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Category</h4>
                    <p className="mt-1 text-gray-700">{category}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Available Sizes</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sizes?.length ? (
                      sizes.map((size, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {size}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500">No sizes specified</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Available Colors</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {colors?.length ? (
                      colors.map((color, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {color}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500">No colors specified</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {material && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Material</h4>
                      <p className="mt-1 text-gray-700">{material}</p>
                    </div>
                  )}
                  {weight && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Weight</h4>
                      <p className="mt-1 text-gray-700">{weight}</p>
                    </div>
                  )}
                </div>

                {dimensions && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Dimensions</h4>
                    <p className="mt-1 text-gray-700">{dimensions}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Created</h4>
                    <p className="mt-1 text-gray-700">
                      {new Date(createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
                    <p className="mt-1 text-gray-700">
                      {new Date(updatedAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireAuth>
  );
}
