"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BackPage } from "@/app/components/backPage/backpage";
import { useCreateOrderMutation } from "@/lib/api/orderApi";
import RequireAuth from "@/app/providers/RequireAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loader from "@/app/components/Loader";
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderFormData {
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  status: "pending" | "processing" | "completed" | "cancelled";
  totalAmount: number;
  subtotal: number;
  transactionId: string | null;
  createdAt: string;
  updatedAt: string;
}

const ORDER_STATUSES = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
} as const;

export default function AddOrderPage() {
  const router = useRouter();
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const [formData, setFormData] = useState<OrderFormData>({
    customer: {
      name: "",
      email: "",
      phone: "",
      address: ""
    },
    items: [{ name: "", quantity: 1, price: 0 }],
    status: "pending",
    totalAmount: 0,
    subtotal: 0,
    transactionId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const handleCustomerChange = (field: keyof typeof formData.customer, value: string) => {
    setFormData(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value
      }
    }));
  };

  const handleItemChange = (
    index: number,
    field: keyof OrderItem,
    value: string | number
  ) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    const totalAmount = calculateTotal(newItems);
    
    setFormData(prev => ({
      ...prev,
      items: newItems,
      totalAmount,
      subtotal: totalAmount
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: "", quantity: 1, price: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const totalAmount = calculateTotal(newItems);
    
    setFormData(prev => ({
      ...prev,
      items: newItems,
      totalAmount,
      subtotal: totalAmount
    }));
  };

  const calculateTotal = (items: OrderItem[]): number => {
    return Number(
      items.reduce((total, item) => total + item.quantity * item.price, 0)
        .toFixed(2)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createOrder({
        ...formData,
        updatedAt: new Date().toISOString()
      }).unwrap();
      toast.success("Order created successfully");
      router.push("/dashboard/orders");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <BackPage />
            <h1 className="text-2xl font-bold">Add New Order</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={formData.customer.name}
                    onChange={(e) => handleCustomerChange("name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customer.email}
                    onChange={(e) => handleCustomerChange("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={formData.customer.phone}
                    onChange={(e) => handleCustomerChange("phone", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Order Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as typeof formData.status }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ORDER_STATUSES).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {key.charAt(0) + key.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerAddress">Shipping Address</Label>
                <Input
                  id="customerAddress"
                  value={formData.customer.address}
                  onChange={(e) => handleCustomerChange("address", e.target.value)}
                  required
                />
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Order Items</Label>
                  <div className="text-right font-medium">
                    Total: ${formData.totalAmount.toFixed(2)}
                  </div>
                </div>

                {formData.items.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="space-y-2">
                      <Label>Product Name</Label>
                      <Input
                        value={item.name}
                        onChange={(e) =>
                          handleItemChange(index, "name", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantity",
                              parseInt(e.target.value)
                            )
                          }
                          min="1"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Price</Label>
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "price",
                              parseFloat(e.target.value)
                            )
                          }
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">
                        Item Total: ${(item.quantity * item.price).toFixed(2)}
                      </div>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => removeItem(index)}
                          size="sm"
                        >
                          Remove Item
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <Button 
                  type="button" 
                  onClick={addItem} 
                  variant="outline"
                  className="w-full"
                >
                  Add Another Item
                </Button>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/orders")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Order"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
}
