"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetOrderQuery, useDeleteOrderMutation } from "@/lib/api/orderApi";
import RequireAuth from "@/app/providers/RequireAuth";
import Loader from "@/app/components/Loader";
import { Header } from "@/app/components/header/Header";
import { toast } from "sonner";
import { Edit } from "lucide-react";

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { data: order, isLoading, isError } = useGetOrderQuery(id);
  const [deleteOrder] = useDeleteOrderMutation();

  const getStatusColor = (status?: string) => {
    switch ((status ?? "").toLowerCase()) {
      case "pending":
        return "bg-yellow-500 text-white";
      case "processing":
        return "bg-blue-500 text-white";
      case "completed":
        return "bg-green-600 text-white";
      case "cancelled":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteOrder(id).unwrap();
      toast.success("Order deleted successfully");
      router.push("/dashboard/orders");
    } catch {
      toast.error("Failed to delete order");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h2 className="text-xl font-semibold text-gray-800">Order Not Found</h2>
        <p className="text-gray-600 mt-2">
          The requested order could not be found.
        </p>
        <Button
          onClick={() => router.push("/dashboard/orders")}
          className="mt-4"
        >
          Return to Orders
        </Button>
      </div>
    );
  }

  return (
    <RequireAuth>
      <Header pageName="Order Details" />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Name</h4>
                <p className="text-gray-800">{order.customer.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Email</h4>
                <p className="text-gray-800">{order.customer.email}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                <p className="text-gray-800">{order.customer.phone}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Address</h4>
                <p className="text-gray-800">{order.customer.address}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Order ID</h4>
                <p className="text-gray-800">{order._id}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Order Date
                </h4>
                <p className="text-gray-800">
                  {new Date(order.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <Badge
                  className={`${getStatusColor(
                    order.status
                  )} text-xs px-2 py-1`}
                >
                  {order.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="flex flex-col justify-between h-full">
            <div>
              <CardHeader>
                <CardTitle className="text-xl">Order Items</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-gray-800"
                  >
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between font-semibold text-lg text-gray-900">
                    <span>Total</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </div>

            <div className="flex justify-end gap-4 p-6 border-t mt-auto">
              <Button
                onClick={() =>
                  router.push(`/dashboard/orders/${order._id}/edit-order`)
                }
                variant="outline"
                className="hover:bg-gray-100"
              >
                <Edit className="mr-2 h-4 w-4" /> Edit Order
              </Button>
              <Button
                onClick={() => handleDelete(order._id)}
                variant="destructive"
                className="hover:bg-red-600 hover:text-white"
              >
                Delete Order
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </RequireAuth>
  );
}
