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
import { Edit, Mail, Phone, MapPin, User, Tag, StickyNote } from "lucide-react";

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
            <CardContent className="p-6 space-y-6 bg-gray-50 rounded-b-lg">
              <div className="mb-4">
                <h5 className="text-xs font-semibold text-gray-400 uppercase mb-2">
                  Name
                </h5>
                <div className="flex items-center gap-2 text-gray-800">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>
                    {order.customer.firstName} {order.customer.lastName}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <h5 className="text-xs font-semibold text-gray-400 uppercase mb-2">
                  Contact
                </h5>
                <div className="flex items-center gap-2 text-gray-800 mb-1">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{order.customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-800 mb-1">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{order.customer.phone}</span>
                </div>
              </div>
              <div className="mb-4">
                <h5 className="text-xs font-semibold text-gray-400 uppercase mb-2">
                  Address
                </h5>
                <div className="flex items-center gap-2 text-gray-800 mb-1">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>
                    {order.customer.address}, {order.customer.city},{" "}
                    {order.customer.postalCode}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-800">
                  <StickyNote className="h-4 w-4 text-gray-500" />
                  <span className="truncate">{order.customer.note || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-800">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span>{order.customer.discountCode || "-"}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h5 className="text-xs font-semibold text-gray-400 uppercase mb-1">
                    Order ID
                  </h5>
                  <span className="text-gray-700 text-sm">{order._id}</span>
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-gray-400 uppercase mb-1">
                    Order Date
                  </h5>
                  <span className="text-gray-700 text-sm">
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-gray-400 uppercase mb-1">
                  Status
                </h5>
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
              <CardContent className="p-6 bg-gray-50 rounded-b-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2 text-left font-semibold text-gray-600">
                          Product
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600">
                          Price
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, index) => (
                        <tr key={index} className="border-b last:border-b-0">
                          <td className="px-4 py-2 text-gray-800">
                            {item.name}
                          </td>
                          <td className="px-4 py-2 text-gray-800">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-2 text-gray-800">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-gray-800 font-semibold">
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="border-t pt-4 mt-6 flex justify-end">
                  <div className="bg-green-100 text-green-800 rounded-lg px-6 py-3 text-lg font-bold shadow-sm">
                    Total: ${order.totalAmount.toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </div>

            <div className="flex justify-end gap-4 p-6 border-t mt-auto bg-white rounded-b-lg">
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
