"use client";

import { ProductsPageContent } from "@/app/components/ProductsPageContent";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";

import {
  useGetAllProductsQuery,
  useDeleteProductMutation,
} from "@/lib/api/productApi";
import RequireAuth from "@/app/providers/RequireAuth";
import Loader from "@/app/components/Loader";
import { Header } from "@/app/components/header/Header";
import { useState } from "react";
export default function ProductsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const { data: products = [], isLoading } = useGetAllProductsQuery({search,category});
  const [deleteProduct] = useDeleteProductMutation();

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id).unwrap();
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error("Failed to delete product");
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
          <div>
            <Header pageName="Product" />
          </div>

          <div className="px-10 mt-4 space-y-4">
            <div className="flex items-center space-x-4 backdrop-blur rounded-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground rounded-full" />
                <Input
                  placeholder="Search by name"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-transparent rounded-full"
                />
              </div>
              <div>
                <Button
                  variant={buttonVariants({ variant: "spaceStarOutline" })}
                  onClick={() => router.push("/dashboard/products/add-product")}
                  size="lg"
                  className="font-normal text-gray-700 hover:shadow-sm border border-gray-300/40 rounded-full transition-all"
                >
                  <Plus className="h-4 w-4" /> Add Product
                </Button>
              </div>
            </div>

            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-normal text-gray-500">
                      Name
                    </TableHead>
                    <TableHead className="font-normal text-gray-500">
                      Description
                    </TableHead>
                    <TableHead className="font-normal text-gray-500">
                      Price
                    </TableHead>
                    <TableHead className="font-normal text-gray-500">
                      Stock
                    </TableHead>
                    <TableHead className="font-normal text-gray-500">
                      Category
                    </TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow
                      key={product._id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-semibold text-gray-700">
                        {product.name}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-700">
                        {product.shortDescription}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-700">
                        <span className="font-semibold">${product.price}</span>
                      </TableCell>
                      <TableCell className="font-semibold text-gray-700">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.stock > 10
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : product.stock > 0
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {product.stock} in stock
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-gray-700">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {product.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="spaceStarOutline"
                              className="h-8 w-8 p-0 hover:bg-muted"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-[160px]"
                          >
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/dashboard/products/${product._id}`
                                )
                              }
                              className="cursor-pointer"
                            >
                              View Product
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/dashboard/products/${product._id}/edit-product`
                                )
                              }
                              className="cursor-pointer"
                            >
                              Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(product._id)}
                              className="text-red-600 cursor-pointer focus:text-red-600 dark:focus:text-red-500"
                            >
                              Delete Product
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </ProductsPageContent>
    </RequireAuth>
  );
}
