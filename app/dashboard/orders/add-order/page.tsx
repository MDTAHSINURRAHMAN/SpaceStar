"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
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
import { Header } from "@/app/components/header/Header";
import { ProductsPageContent } from "@/app/components/ProductsPageContent";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderFormData {
  customer: {
    firstName: string;
    lastName: string;
    city: string;
    postalCode: number;
    note?: string;
    discountCode?: string;
    phone: string;
    email: string;
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
  CANCELLED: "cancelled",
} as const;

export default function AddOrderPage() {
  const router = useRouter();
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const [formData, setFormData] = useState<OrderFormData>({
    customer: {
      firstName: "",
      lastName: "",
      city: "",
      postalCode: 0,
      note: "",
      discountCode: "",
      phone: "",
      email: "",
      address: "",
    },
    items: [{ name: "", quantity: 1, price: 0 }],
    status: "pending",
    totalAmount: 0,
    subtotal: 0,
    transactionId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const handleCustomerChange = (
    field: keyof typeof formData.customer,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value,
      },
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

    setFormData((prev) => ({
      ...prev,
      items: newItems,
      totalAmount,
      subtotal: totalAmount,
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", quantity: 1, price: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const totalAmount = calculateTotal(newItems);

    setFormData((prev) => ({
      ...prev,
      items: newItems,
      totalAmount,
      subtotal: totalAmount,
    }));
  };

  const calculateTotal = (items: OrderItem[]): number => {
    return Number(
      items
        .reduce((total, item) => total + item.quantity * item.price, 0)
        .toFixed(2)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOrder({
        ...formData,
        updatedAt: new Date().toISOString(),
        customer: {
          ...formData.customer,
          postalCode: Number(formData.customer.postalCode),
        },
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
      <ProductsPageContent>
        <div className="font-roboto">
          <div className="w-full">
            <Header pageName="Add Order" />
          </div>

          <div className="px-4 mt-4">
            <Card>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Customer Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.customer.firstName}
                        onChange={(e) =>
                          handleCustomerChange("firstName", e.target.value)
                        }
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.customer.lastName}
                        onChange={(e) =>
                          handleCustomerChange("lastName", e.target.value)
                        }
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.customer.city}
                        onChange={(e) =>
                          handleCustomerChange("city", e.target.value)
                        }
                        placeholder="Enter city"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        type="number"
                        value={formData.customer.postalCode}
                        onChange={(e) =>
                          handleCustomerChange("postalCode", e.target.value)
                        }
                        placeholder="Enter postal code"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="note">Note</Label>
                      <Input
                        id="note"
                        value={formData.customer.note || ""}
                        onChange={(e) =>
                          handleCustomerChange("note", e.target.value)
                        }
                        placeholder="Enter note (optional)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discountCode">Discount Code</Label>
                      <Input
                        id="discountCode"
                        value={formData.customer.discountCode || ""}
                        onChange={(e) =>
                          handleCustomerChange("discountCode", e.target.value)
                        }
                        placeholder="Enter discount code (optional)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerEmail">Email</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={formData.customer.email}
                        onChange={(e) =>
                          handleCustomerChange("email", e.target.value)
                        }
                        placeholder="Enter customer email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerPhone">Phone</Label>
                      <Input
                        id="customerPhone"
                        type="tel"
                        value={formData.customer.phone}
                        onChange={(e) =>
                          handleCustomerChange("phone", e.target.value)
                        }
                        placeholder="Enter customer phone"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerAddress">Shipping Address</Label>
                      <Input
                        id="customerAddress"
                        value={formData.customer.address}
                        onChange={(e) =>
                          handleCustomerChange("address", e.target.value)
                        }
                        placeholder="Enter shipping address"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Order Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            status: value as typeof formData.status,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select order status" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ORDER_STATUSES).map(
                            ([key, value]) => (
                              <SelectItem key={key} value={value}>
                                {key.charAt(0) + key.slice(1).toLowerCase()}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Order Items</Label>
                      <div className="flex items-center gap-2 text-right font-medium">
                        <p>Total Price: ${formData.totalAmount.toFixed(2)}</p>
                        <Button
                          variant="spaceStarOutline"
                          type="submit"
                          disabled={isLoading}
                          className="font-normal text-gray-700 hover:shadow-sm rounded-full transition-all border border-gray-700 cursor-pointer"
                        >
                          {isLoading ? "Creating..." : "Create Order"}
                        </Button>
                      </div>
                    </div>

                    {formData.items.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg space-y-4"
                      >
                        <div className="space-y-2">
                          <Label>Product Name</Label>
                          <Input
                            value={item.name}
                            onChange={(e) =>
                              handleItemChange(index, "name", e.target.value)
                            }
                            placeholder="Enter product name"
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
                              placeholder="Enter quantity"
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
                              placeholder="Enter price"
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium">
                            Item Total: $
                            {(item.quantity * item.price).toFixed(2)}
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
                      variant="spaceStarOutline"
                      className="w-full font-normal text-gray-700 hover:shadow-sm rounded-full transition-all border border-gray-700 cursor-pointer"
                    >
                      Add Another Item
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProductsPageContent>
    </RequireAuth>
  );
}
