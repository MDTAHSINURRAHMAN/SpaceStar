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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Search, Star } from "lucide-react";

// Mock data - replace with actual API calls
const reviews = [
  {
    id: "1",
    product: "Product 1",
    customer: "John Doe",
    rating: 5,
    comment: "Great product! Very satisfied with the quality.",
    date: "2024-03-15",
    status: "Approved",
  },
  {
    id: "2",
    product: "Product 2",
    customer: "Jane Smith",
    rating: 4,
    comment: "Good product but could be better.",
    date: "2024-03-14",
    status: "Pending",
  },
  {
    id: "3",
    product: "Product 3",
    customer: "Mike Johnson",
    rating: 3,
    comment: "Average product, nothing special.",
    date: "2024-03-13",
    status: "Rejected",
  },
  // Add more mock reviews as needed
];

const statusColors = {
  Approved: "bg-green-500",
  Pending: "bg-yellow-500",
  Rejected: "bg-red-500",
};

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReviews = reviews.filter(
    (review) =>
      review.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.customer.toLowerCase().includes(searchQuery.toLowerCase())
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Reviews</h2>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell className="font-medium">{review.product}</TableCell>
                <TableCell>{review.customer}</TableCell>
                <TableCell>
                  <div className="flex">{renderStars(review.rating)}</div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {review.comment}
                </TableCell>
                <TableCell>{review.date}</TableCell>
                <TableCell>
                  <Badge
                    className={`${
                      statusColors[review.status as keyof typeof statusColors]
                    } text-white`}
                  >
                    {review.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Approve</DropdownMenuItem>
                      <DropdownMenuItem>Reject</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
