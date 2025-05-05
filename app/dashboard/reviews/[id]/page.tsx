"use client";

import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";

export default function ReviewDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const reviewId = params.id as string;
  
  const { data: review, isLoading } = useGetReviewByIdQuery(reviewId);
  const { data: products = [] } = useGetAllProductsQuery();
  const [deleteReview] = useDeleteReviewMutation();

  const handleDelete = async () => {
    try {
      await deleteReview(reviewId).unwrap();
      toast.success("Review deleted successfully");
      router.push("/dashboard/reviews");
    } catch (error) {
      toast.error("Failed to delete review");
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

  const getProductName = (productId: string) => {
    const product = products.find((p) => p._id === productId);
    return product?.name || "Unknown Product";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h2 className="text-2xl font-semibold">Review not found</h2>
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
        transition={{ duration: 0.3 }}
        className="container mx-auto py-8 px-4 max-w-4xl"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/reviews")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Review Details</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/reviews/${reviewId}/edit-review`)}
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
                  <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
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

        <Card className="shadow-lg">
          <CardHeader className="space-y-4">
            <div className="flex justify-between items-start">
              <CardTitle className="text-2xl font-bold">
                {getProductName(review.productId)}
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Rating:</span>
                <div className="flex">{renderStars(Number(review.rating))}</div>
              </div>
            </div>
            {review.subtext && (
              <CardDescription className="text-lg italic">
                &quot;{review.subtext}&quot;
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
              <p className="text-gray-700">{review.name}</p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold mb-2">Review</h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {review.review}
              </p>
            </section>
            
            {review.imageUrl && (
              <section>
                <h3 className="text-lg font-semibold mb-2">Attached Image</h3>
                <img
                  src={review.imageUrl}
                  alt="Review Image"
                  className="rounded-lg shadow-md max-h-96 object-cover"
                />
              </section>
            )}
            
            <section>
              <h3 className="text-lg font-semibold mb-2">Product Details</h3>
              <p className="text-gray-700">
                Product Name: {getProductName(review.productId)}
              </p>
            </section>
          </CardContent>
          
          <CardFooter className="border-t flex flex-col items-start gap-1 pt-4">
            <p className="text-sm text-gray-500">
              Submitted: {new Date(review.createdAt).toLocaleString()}
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
