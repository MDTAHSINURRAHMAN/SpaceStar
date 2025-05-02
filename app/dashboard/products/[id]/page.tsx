"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Image from "next/image";
import { Edit } from "lucide-react";
import { BackPage } from "@/app/components/backPage/backpage";

interface Product {
  _id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  designer: string;
  features: string[];
  price: number;
  category: string;
  stock: number;
  images: string[];
  isPreOrder: boolean;
  sizes: string[];
  colors: string[];
  material: string;
  weight: string;
  dimensions: string;
  isFeatured: boolean;
  isOnSale: boolean;
  salePrice: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    async function fetchProduct() {
      const token = localStorage.getItem("token");
      if (!token) return;
      
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
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to fetch product");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen">
        Product not found
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <BackPage />
          <h1 className="text-2xl font-bold">Product Details</h1>
        </div>
        <Button
          onClick={() => router.push(`/dashboard/products/${id}/edit-product`)}
        >
          <Edit className="mr-2 h-4 w-4" /> Edit Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {product.images && product.images.length > 0 ? (
                product.images.map((url, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-md overflow-hidden border"
                  >
                    <Image
                      src={url}
                      alt={`${product.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-2 aspect-video bg-gray-100 flex items-center justify-center rounded-md">
                  No images available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-2xl font-bold mt-1">
                {product.isOnSale ? (
                  <>
                    <span className="text-gray-500 mr-2">${product.price}</span>
                    ${product.salePrice}
                  </>
                ) : (
                  `$${product.price}`
                )}
              </p>
              {product.isPreOrder && (
                <Badge className="mt-2 bg-amber-500">Pre-Order</Badge>
              )}
              {product.isFeatured && (
                <Badge className="mt-2 ml-2 bg-purple-500">Featured</Badge>
              )}
              <Badge className="ml-2 mt-2">{product.category}</Badge>
            </div>

            <div>
              <h4 className="font-medium text-sm text-gray-500">Short Description</h4>
              <p className="mt-1">{product.shortDescription}</p>
            </div>

            <div>
              <h4 className="font-medium text-sm text-gray-500">Full Description</h4>
              <p className="mt-1">{product.longDescription}</p>
            </div>

            {product.designer && (
              <div>
                <h4 className="font-medium text-sm text-gray-500">Designer</h4>
                <p className="mt-1">{product.designer}</p>
              </div>
            )}

            {product.features && product.features.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-500">Features</h4>
                <ul className="list-disc pl-5 mt-1">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-gray-500">Stock</h4>
                <p className="mt-1">{product.stock} units</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-500">Category</h4>
                <p className="mt-1">{product.category}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm text-gray-500">
                Available Sizes
              </h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {product.sizes && product.sizes.length > 0 ? (
                  product.sizes.map((size, index) => (
                    <Badge key={index} variant="outline">
                      {size}
                    </Badge>
                  ))
                ) : (
                  <p>No sizes specified</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm text-gray-500">
                Available Colors
              </h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {product.colors && product.colors.length > 0 ? (
                  product.colors.map((color, index) => (
                    <Badge key={index} variant="outline">
                      {color}
                    </Badge>
                  ))
                ) : (
                  <p>No colors specified</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {product.material && (
                <div>
                  <h4 className="font-medium text-sm text-gray-500">Material</h4>
                  <p className="mt-1">{product.material}</p>
                </div>
              )}
              {product.weight && (
                <div>
                  <h4 className="font-medium text-sm text-gray-500">Weight</h4>
                  <p className="mt-1">{product.weight}</p>
                </div>
              )}
            </div>

            {product.dimensions && (
              <div>
                <h4 className="font-medium text-sm text-gray-500">Dimensions</h4>
                <p className="mt-1">{product.dimensions}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <h4 className="font-medium text-sm text-gray-500">
                  Created At
                </h4>
                <p className="mt-1">
                  {new Date(product.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-500">
                  Last Updated
                </h4>
                <p className="mt-1">
                  {new Date(product.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
