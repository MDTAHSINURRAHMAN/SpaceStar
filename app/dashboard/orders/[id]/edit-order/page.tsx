"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useGetOrderQuery, useUpdateOrderMutation } from "@/lib/api/orderApi";
import RequireAuth from "@/app/providers/RequireAuth";
import { BackPage } from "@/app/components/backPage/backpage";
import { Order } from "@/types/orders";
import Loader from "@/app/components/Loader";
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

const ORDER_STATUSES = {
  PENDING: "pending",
  PROCESSING: "processing", 
  COMPLETED: "completed",
  CANCELLED: "cancelled"
} as const;

export default function EditOrderPage() {
  const router = useRouter();
  const { id } = useParams();
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();

  const {
    data: orderData,
    isLoading,
    isError,
  } = useGetOrderQuery(id as string);

  const [order, setOrder] = useState<Order | null>(orderData || null);

  useEffect(() => {
    if (orderData) setOrder(orderData);
  }, [orderData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    try {
      await updateOrder({ id: order._id, order }).unwrap();
      toast.success("Order updated successfully");
      router.push("/dashboard/orders");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof OrderItem,
    value: string | number
  ) => {
    if (!order) return;

    const newItems = [...order.items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === "name" ? value : Number(value),
    };

    const totalAmount = calculateTotalAmount(newItems);

    setOrder({
      ...order,
      items: newItems,
      totalAmount,
    });
  };

  const calculateTotalAmount = (items: OrderItem[]) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCustomerInfoChange = (field: keyof Order["customer"], value: string) => {
    if (!order) return;
    setOrder({
      ...order,
      customer: {
        ...order.customer,
        [field]: value
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-semibold mb-4">Order not found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BackPage />
            <h2 className="text-3xl font-bold tracking-tight">
              Edit Order
            </h2>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={order.customer.name}
                    onChange={(e) => handleCustomerInfoChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Customer Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={order.customer.email}
                    onChange={(e) => handleCustomerInfoChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerNumber">Customer Number</Label>
                  <Input
                    id="customerNumber"
                    value={order.customer.phone}
                    onChange={(e) => handleCustomerInfoChange("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerAddress">Customer Address</Label>
                  <Input
                    id="customerAddress"
                    value={order.customer.address}
                    onChange={(e) => handleCustomerInfoChange("address", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Order Status</Label>
                <Select
                  value={order.status}
                  onValueChange={(value) => setOrder({ ...order, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ORDER_STATUSES).map(([key, value]) => (
                      <SelectItem key={value} value={value}>
                        {key.charAt(0) + key.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Order Items</Label>
                {order.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <Input
                      value={item.name}
                      onChange={(e) => handleItemChange(index, "name", e.target.value)}
                      placeholder="Item name"
                    />
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      placeholder="Quantity"
                    />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, "price", e.target.value)}
                      placeholder="Price"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-lg font-semibold">
                  Total Amount: ${order.totalAmount.toFixed(2)}
                </div>
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Updating..." : "Update Order"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
}
