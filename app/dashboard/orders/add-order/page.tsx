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

  const [formErrors, setFormErrors] = useState<{ [key: string]: boolean }>({});

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

  const validateForm = () => {
    const errors: { [key: string]: boolean } = {};
    // Customer fields
    if (!formData.customer.firstName.trim()) errors.firstName = true;
    if (!formData.customer.lastName.trim()) errors.lastName = true;
    if (!formData.customer.city.trim()) errors.city = true;
    if (!formData.customer.postalCode) errors.postalCode = true;
    if (!formData.customer.phone.trim()) errors.phone = true;
    if (!formData.customer.email.trim()) errors.email = true;
    if (!formData.customer.address.trim()) errors.address = true;
    // Items
    formData.items.forEach((item, idx) => {
      if (!item.name.trim()) errors[`itemName${idx}`] = true;
      if (!item.quantity || item.quantity < 1)
        errors[`itemQuantity${idx}`] = true;
      if (item.price === undefined || item.price === null || item.price < 0)
        errors[`itemPrice${idx}`] = true;
    });
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fill all required fields correctly.");
      return;
    }
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

          <div className="w-2/3 mx-auto mt-8">
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
                        onChange={(e) => {
                          handleCustomerChange("firstName", e.target.value);
                          setFormErrors((prev) => ({
                            ...prev,
                            firstName: false,
                          }));
                        }}
                        placeholder="Enter first name"
                        required
                        aria-invalid={formErrors.firstName ? "true" : undefined}
                        className={
                          formErrors.firstName ? "!border-red-500" : ""
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.customer.lastName}
                        onChange={(e) => {
                          handleCustomerChange("lastName", e.target.value);
                          setFormErrors((prev) => ({
                            ...prev,
                            lastName: false,
                          }));
                        }}
                        placeholder="Enter last name"
                        required
                        aria-invalid={formErrors.lastName ? "true" : undefined}
                        className={formErrors.lastName ? "!border-red-500" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.customer.city}
                        onChange={(e) => {
                          handleCustomerChange("city", e.target.value);
                          setFormErrors((prev) => ({ ...prev, city: false }));
                        }}
                        placeholder="Enter city"
                        required
                        aria-invalid={formErrors.city ? "true" : undefined}
                        className={formErrors.city ? "!border-red-500" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        type="number"
                        value={formData.customer.postalCode}
                        onChange={(e) => {
                          handleCustomerChange("postalCode", e.target.value);
                          setFormErrors((prev) => ({
                            ...prev,
                            postalCode: false,
                          }));
                        }}
                        placeholder="Enter postal code"
                        required
                        aria-invalid={
                          formErrors.postalCode ? "true" : undefined
                        }
                        className={
                          formErrors.postalCode ? "!border-red-500" : ""
                        }
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
                        onChange={(e) => {
                          handleCustomerChange("email", e.target.value);
                          setFormErrors((prev) => ({ ...prev, email: false }));
                        }}
                        placeholder="Enter customer email"
                        required
                        aria-invalid={formErrors.email ? "true" : undefined}
                        className={formErrors.email ? "!border-red-500" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerPhone">Phone</Label>
                      <Input
                        id="customerPhone"
                        type="tel"
                        value={formData.customer.phone}
                        onChange={(e) => {
                          handleCustomerChange("phone", e.target.value);
                          setFormErrors((prev) => ({ ...prev, phone: false }));
                        }}
                        placeholder="Enter customer phone"
                        required
                        aria-invalid={formErrors.phone ? "true" : undefined}
                        className={formErrors.phone ? "!border-red-500" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerAddress">Shipping Address</Label>
                      <Input
                        id="customerAddress"
                        value={formData.customer.address}
                        onChange={(e) => {
                          handleCustomerChange("address", e.target.value);
                          setFormErrors((prev) => ({
                            ...prev,
                            address: false,
                          }));
                        }}
                        placeholder="Enter shipping address"
                        required
                        aria-invalid={formErrors.address ? "true" : undefined}
                        className={formErrors.address ? "!border-red-500" : ""}
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
                          <SelectValue
                            placeholder="Select order status"
                            children={(() => {
                              const entry = Object.entries(ORDER_STATUSES).find(
                                ([, v]) => v === formData.status
                              );
                              return entry
                                ? entry[0].charAt(0) +
                                    entry[0].slice(1).toLowerCase()
                                : "Select order status";
                            })()}
                          />
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
                          className="font-normal text-gray-700 hover:shadow-md rounded-full transition-all border border-gray-700 cursor-pointer"
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
                            onChange={(e) => {
                              handleItemChange(index, "name", e.target.value);
                              setFormErrors((prev) => ({
                                ...prev,
                                [`itemName${index}`]: false,
                              }));
                            }}
                            placeholder="Enter product name"
                            required
                            aria-invalid={
                              formErrors[`itemName${index}`]
                                ? "true"
                                : undefined
                            }
                            className={
                              formErrors[`itemName${index}`]
                                ? "!border-red-500"
                                : ""
                            }
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                handleItemChange(
                                  index,
                                  "quantity",
                                  parseInt(e.target.value)
                                );
                                setFormErrors((prev) => ({
                                  ...prev,
                                  [`itemQuantity${index}`]: false,
                                }));
                              }}
                              placeholder="Enter quantity"
                              min="1"
                              required
                              aria-invalid={
                                formErrors[`itemQuantity${index}`]
                                  ? "true"
                                  : undefined
                              }
                              className={
                                formErrors[`itemQuantity${index}`]
                                  ? "!border-red-500"
                                  : ""
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Price</Label>
                            <Input
                              type="number"
                              value={item.price}
                              onChange={(e) => {
                                handleItemChange(
                                  index,
                                  "price",
                                  parseFloat(e.target.value)
                                );
                                setFormErrors((prev) => ({
                                  ...prev,
                                  [`itemPrice${index}`]: false,
                                }));
                              }}
                              placeholder="Enter price"
                              min="0"
                              step="0.01"
                              required
                              aria-invalid={
                                formErrors[`itemPrice${index}`]
                                  ? "true"
                                  : undefined
                              }
                              className={
                                formErrors[`itemPrice${index}`]
                                  ? "!border-red-500"
                                  : ""
                              }
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
                      className="w-1/2 font-normal text-gray-700 hover:shadow-md rounded-full transition-all border border-gray-700 cursor-pointer"
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
