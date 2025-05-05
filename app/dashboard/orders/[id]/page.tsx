"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackPage } from "@/app/components/backPage/backpage";
import { useGetOrderQuery } from "@/lib/api/orderApi";
import RequireAuth from "@/app/providers/RequireAuth";
import Loader from "@/app/components/Loader";
export default function OrderDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const {
    data: order,
    isLoading,
    isError,
  } = useGetOrderQuery(id);

  const getStatusColor = (status?: string) => {
    switch ((status ?? "").toLowerCase()) {
      case "pending":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-6">
      <Loader />
    </div>;
  }

  if (isError || !order) {
    return <div className="container mx-auto py-6">Order not found</div>;
  }

  return (
    <RequireAuth>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <BackPage />
            <h1 className="text-2xl font-bold">Order Details</h1>
          </div>
          <Button onClick={() => router.push(`/dashboard/orders/${id}/status`)}>
            Update Status
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <p>Name: {order.customer.name}</p>
                <p>Email: {order.customer.email}</p>
                <p>Phone: {order.customer.phone}</p>
                <p>Address: {order.customer.address}</p>
                <p>Order ID: {order._id}</p>
                <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                <p>
                  Status:{" "}
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="space-y-2">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total Amount</span>
                      <span>${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
}
