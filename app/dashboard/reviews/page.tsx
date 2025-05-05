"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetAllReviewsQuery } from "@/lib/api/reviewApi";
import { useGetAllProductsQuery } from "@/lib/api/productApi";
import RequireAuth from "@/app/providers/RequireAuth";
import Loader from "@/app/components/Loader";
export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const { data: reviews = [], isLoading } = useGetAllReviewsQuery();
  const { data: products = [] } = useGetAllProductsQuery();

  // Create a mapping of product IDs to product names
  const productMap = products.reduce((acc, product) => {
    acc[product._id] = product.name;
    return acc;
  }, {} as Record<string, string>);

  const filteredReviews = reviews.filter(
    (review) =>
      (productMap[review.productId]
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ??
        false) ||
      (review.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const handleViewDetails = (reviewId: string) => {
    router.push(`/dashboard/reviews/${reviewId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  console.log("🧾 Reviews received:", reviews);

  return (
    <RequireAuth>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Reviews</h2>
          <Button onClick={() => router.push("/dashboard/reviews/add-review")}>
            <Plus className="mr-2 h-4 w-4" /> Add Review
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="rounded-md border">
          {isLoading ? (
            <div className="p-4 text-center">
              <Loader />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.map((review) => (
                  <TableRow key={review._id}>
                    <TableCell className="font-medium">
                      {productMap[review.productId] || review.productId}
                    </TableCell>
                    <TableCell>{review.name}</TableCell>
                    <TableCell>
                      <div className="flex">{renderStars(review.rating)}</div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {review.review}
                    </TableCell>
                    <TableCell>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(review._id)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </motion.div>
    </RequireAuth>
  );
}
