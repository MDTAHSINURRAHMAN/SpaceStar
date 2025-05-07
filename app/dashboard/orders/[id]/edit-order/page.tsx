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
import { Header } from "@/app/components/header/Header";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

const ORDER_STATUSES = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export default function EditOrderPage() {
  const router = useRouter();
  const { id } = useParams();
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();
  const { data: orderData, isLoading, isError } = useGetOrderQuery(id as string);

  const [order, setOrder] = useState<Order | null>(null);

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

  const handleCustomerInfoChange = (
    field: keyof Order["customer"],
    value: string
  ) => {
    if (!order) return;
    setOrder({
      ...order,
      customer: {
        ...order.customer,
        [field]: value,
      },
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
      <div className="font-roboto">
        <div className="">
          <Header pageName="Edit Order" />
        </div>

        <Card className="px-4">
          <CardHeader>
            <CardTitle className="text-xl">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {["name", "email", "phone", "address"].map((field) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={field}>
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </Label>
                    <Input
                      id={field}
                      type={field === "email" ? "email" : "text"}
                      value={order.customer[field as keyof typeof order.customer]}
                      onChange={(e) =>
                        handleCustomerInfoChange(field as keyof typeof order.customer, e.target.value)
                      }
                    />
                  </div>
                ))}
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
                        {key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-500">Order Items</Label>
                {order.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                <div className="text-lg font-medium">
                  Total Amount: ${order.totalAmount.toFixed(2)}
                </div>
                <div className="flex justify-end gap-4">
                  {/* <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button> */}
                  <Button variant="spaceStarOutline" type="submit" disabled={isUpdating} className="font-normal text-gray-700 hover:shadow-sm rounded-full transition-all border border-gray-700 mb-10">
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