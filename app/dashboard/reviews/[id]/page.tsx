"use client";

import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowLeft, Edit, Trash } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useGetReviewByIdQuery,
  useDeleteReviewMutation,
} from "@/lib/api/reviewApi";
import { useGetAllProductsQuery } from "@/lib/api/productApi";
import RequireAuth from "@/app/providers/RequireAuth";

const statusColors = {
  Approved: "bg-green-500",
  Pending: "bg-yellow-500",
  Rejected: "bg-red-500",
};

export default function ReviewDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: review, isLoading } = useGetReviewByIdQuery(
    params.id as string
  );
  const { data: products = [] } = useGetAllProductsQuery();
  const [deleteReview] = useDeleteReviewMutation();

  const handleDelete = async () => {
    try {
      await deleteReview(params.id as string).unwrap();
      router.push("/dashboard/reviews");
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${
          index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  // Find product name from product ID
  const getProductName = (productId: string) => {
    const product = products.find((p) => p._id === productId);
    return product ? product.name : productId;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg">Loading review details...</p>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg mb-4">Review not found</p>
        <Button onClick={() => router.push("/dashboard/reviews")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Reviews
        </Button>
      </div>
    );
  }

  return (
    <RequireAuth>
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/reviews")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Review Details</h2>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/dashboard/reviews/${review._id}/edit-review`)
            }
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash className="mr-2 h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  review from the database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">
              {getProductName(review.productId)}
            </CardTitle>
          </div>
          <CardDescription>
            <div className="flex items-center space-x-2">
              <span>Rating:</span>
              <div className="flex">{renderStars(Number(review.rating))}</div>
            </div>
            {review.subtext && (
              <div className="mt-2 text-sm italic">
                &quot;{review.subtext}&quot;
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-1">Customer Information</h3>
            <p>Name: {review.name}</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Review Comment</h3>
            <p className="whitespace-pre-wrap">{review.review}</p>
          </div>
          {review.imageUrl && (
            <img
              src={review.imageUrl}
              alt="Review Image"
              className="h-40 w-auto rounded-md object-cover"
            />
          )}
          <div>
            <h3 className="font-semibold text-lg mb-1">Product Information</h3>
            <p>Product Name: {getProductName(review.productId)}</p>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex flex-col items-start">
          <p className="text-sm text-gray-500">
            Submitted on: {new Date(review.createdAt).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            Last updated: {new Date(review.updatedAt).toLocaleString()}
          </p>
        </CardFooter>
      </Card>
    </motion.div>
    </RequireAuth>
  );
}
