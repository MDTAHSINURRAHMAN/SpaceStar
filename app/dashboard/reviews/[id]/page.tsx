"use client";

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
import Loader from "@/app/components/Loader";
import { Header } from "../../../components/header/Header";
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
        <Loader />
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
      <div className="font-roboto">
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <Header pageName="Review Details" />
        </div>
        <div className="w-2/3 mx-auto mt-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Review Image */}
          <Card className="flex flex-col items-center min-h-[300px] pt-8">
            {/* <CardHeader>
              <CardTitle>Review Image</CardTitle>
            </CardHeader> */}
            <CardContent>
              {review.imageUrl ? (
                <img
                  src={review.imageUrl}
                  alt="Review Image"
                  className="rounded-lg shadow-md max-h-96 object-cover mx-auto"
                />
              ) : (
                <div className="flex items-center justify-center h-48 w-64 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <span className="text-gray-400">No image attached</span>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Right: Review Details */}
          <Card className="flex flex-col justify-between h-full">
            <div>
              <CardHeader className="space-y-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl font-bold">
                    {getProductName(review.productId)}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 font-medium">Rating:</span>
                    <div className="flex">
                      {renderStars(Number(review.rating))}
                    </div>
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
                  <h3 className="text-lg text-gray-500 font-semibold mb-2">
                    Customer Information
                  </h3>
                  <p className="text-gray-600">{review.name}</p>
                </section>
                <section>
                  <h3 className="text-lg text-gray-500 font-semibold mb-2">
                    Review
                  </h3>
                  <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {review.review}
                  </p>
                </section>
                <section>
                  <h3 className="text-lg text-gray-500 font-semibold mb-2">
                    Product Details
                  </h3>
                  <p className="text-gray-600">
                    Product Name: {getProductName(review.productId)}
                  </p>
                </section>
              </CardContent>
              <div className="px-6 pb-4 pt-2 text-xs text-gray-500">
              <p>Submitted: {new Date(review.createdAt).toLocaleString()}</p>
              <p>Last updated: {new Date(review.updatedAt).toLocaleString()}</p>
            </div>
            </div>
            {/* Edit & Delete Buttons at the Bottom */}
            <CardFooter className="flex justify-end gap-4 p-6 border-t mt-auto w-full">
              <Button
                onClick={() =>
                  router.push(`/dashboard/reviews/${reviewId}/edit-review`)
                }
                variant="outline"
                className="hover:bg-gray-100"
              >
                <Edit className="mr-2 h-4 w-4" /> Edit Review
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="hover:bg-red-600 hover:text-white"
                  >
                    <Trash className="mr-2 h-4 w-4" /> Delete Review
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the review from the database.
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
            </CardFooter>
          </Card>
        </div>
      </div>
    </RequireAuth>
  );
}
