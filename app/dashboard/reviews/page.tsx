"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetAllReviewsQuery,
  useDeleteReviewMutation,
} from "@/lib/api/reviewApi";
import { useGetAllProductsQuery } from "@/lib/api/productApi";
import RequireAuth from "@/app/providers/RequireAuth";
import { ReviewsPageContent } from "@/app/components/ReviewsPageContent";
import { Header } from "@/app/components/header/Header";
import Loader from "@/app/components/Loader";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export default function ReviewsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: reviews = [], isLoading } = useGetAllReviewsQuery(
    searchQuery ? { q: searchQuery } : undefined
  );
  const { data: products = [] } = useGetAllProductsQuery();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  const productMap = products.reduce((acc, product) => {
    acc[product._id] = product.name;
    return acc;
  }, {} as Record<string, string>);


  const renderStars = (rating: number) =>
    Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));

  const handleViewDetails = (id: string) => {
    router.push(`/dashboard/reviews/${id}`);
  };

  const handleAddReview = () => {
    router.push("/dashboard/reviews/add-review");
  };

  const handleEditReview = (id: string) => {
    router.push(`/dashboard/reviews/${id}/edit-review`);
  };

  const handleDeleteReview = async (id: string) => {
    try {
      await deleteReview(id).unwrap();
      toast.success("Review deleted successfully");
      // Optionally, you can refetch reviews here if needed
    } catch {
      toast.error("Failed to delete review");
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
      <ReviewsPageContent>
        <div className="font-roboto">
          <Header pageName="Reviews" />

          <div className="px-10 mt-4 space-y-4">
            {/* Search + Add Review Bar */}
            <div className="flex items-center space-x-4 backdrop-blur rounded-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews by product name, customer name or comment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-transparent rounded-full"
                />
              </div>
              <div>
                <Button
                  variant="spaceStarOutline"
                  onClick={handleAddReview}
                  size="lg"
                  className={`${buttonVariants({ variant: "spaceStarOutline" })} font-normal text-gray-700 hover:shadow-sm border border-gray-300/40 rounded-full transition-all`}
                >
                  <Plus className="h-4 w-4" /> Add Review
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-normal text-gray-500">
                      Product
                    </TableHead>
                    <TableHead className="font-normal text-gray-500">
                      Customer
                    </TableHead>
                    <TableHead className="font-normal text-gray-500">
                      Rating
                    </TableHead>
                    <TableHead className="font-normal text-gray-500">
                      Comment
                    </TableHead>
                    <TableHead className="font-normal text-gray-500">
                      Date
                    </TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <TableRow
                        key={review._id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="font-semibold text-gray-700">
                          {productMap[review.productId] || review.productId}
                        </TableCell>
                        <TableCell className="font-semibold text-gray-700">
                          {review.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-gray-700">
                          {review.review}
                        </TableCell>
                        <TableCell className="font-semibold text-gray-700">
                          {new Date(review.createdAt).toLocaleDateString()}
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
                                onClick={() => handleViewDetails(review._id)}
                                className="cursor-pointer"
                              >
                                View Review
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditReview(review._id)}
                                className="cursor-pointer"
                              >
                                Edit Review
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteReview(review._id)}
                                className="text-red-600 cursor-pointer focus:text-red-600 dark:focus:text-red-500"
                                disabled={isDeleting}
                              >
                                {isDeleting ? "Deleting..." : "Delete Review"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No reviews found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </ReviewsPageContent>
    </RequireAuth>
  );
}
