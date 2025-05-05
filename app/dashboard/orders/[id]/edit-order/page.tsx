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
import { useGetOrderQuery, useUpdateOrderMutation } from "@/lib/api/orderApi"; // ✅ Import RTK hooks
import RequireAuth from "@/app/providers/RequireAuth";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export default function EditOrderPage() {
  const router = useRouter();
  const { id } = useParams();
  const [updateOrder] = useUpdateOrderMutation();

  const {
    data: orderData,
    isLoading,
    isError,
  } = useGetOrderQuery(id as string);

  const [order, setOrder] = useState(orderData || null);

  // Update local state after data fetch
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

    const totalAmount = newItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    setOrder({
      ...order,
      items: newItems,
      totalAmount,
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError || !order) return <div>Order not found</div>;

  return (
    <RequireAuth>
      <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Order</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={order.customerName}
                  onChange={(e) =>
                    setOrder({ ...order, customerName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Customer Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={order.customerEmail}
                  onChange={(e) =>
                    setOrder({ ...order, customerEmail: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerNumber">Customer Number</Label>
                <Input
                  id="customerNumber"
                  value={order.customerNumber}
                  onChange={(e) =>
                    setOrder({ ...order, customerNumber: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerAddress">Customer Address</Label>
                <Input
                  id="customerAddress"
                  value={order.customerAddress}
                  onChange={(e) =>
                    setOrder({ ...order, customerAddress: e.target.value })
                  }
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Items</Label>
              {order.items.map((item, index) => (
                <div key={index} className="grid grid-cols-3 gap-4">
                  <Input
                    value={item.name}
                    onChange={(e) =>
                      handleItemChange(index, "name", e.target.value)
                    }
                    placeholder="Item name"
                  />
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                    placeholder="Quantity"
                  />
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      handleItemChange(index, "price", e.target.value)
                    }
                    placeholder="Price"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Total Amount: ${order.totalAmount.toFixed(2)}</Label>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit">Update Order</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
    </RequireAuth>
  );
}
