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
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

import {
  useGetAllProductsQuery,
  useDeleteProductMutation,
} from "@/lib/api/productApi";
import RequireAuth from "@/app/providers/RequireAuth";

export default function ProductsPage() {
  const router = useRouter();
  const { data: products = [], isLoading } = useGetAllProductsQuery();
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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <RequireAuth>
      <ProductsPageContent>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Products
              </h2>
              <p className="text-muted-foreground mt-2">
                Manage your product inventory and listings
              </p>
            </div>
            <Button
              onClick={() => router.push("/dashboard/products/add-product")}
              size="lg"
              className="shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </div>

          <div className="flex items-center space-x-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10 bg-transparent"
              />
            </div>
          </div>

          <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-xl shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold">Price</TableHead>
                  <TableHead className="font-semibold">Stock</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow
                    key={product._id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.shortDescription}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">${product.price}</span>
                    </TableCell>
                    <TableCell>
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
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {product.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-muted"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/dashboard/products/${product._id}/edit-product`
                              )
                            }
                            className="cursor-pointer"
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/dashboard/products/${product._id}`)
                            }
                            className="cursor-pointer"
                          >
                            View Product
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(product._id)}
                            className="text-red-600 cursor-pointer focus:text-red-600 dark:focus:text-red-500"
                          >
                            Delete
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
      </ProductsPageContent>
    </RequireAuth>
  );
}
