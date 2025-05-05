"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useGetAllOrdersQuery,
  useDeleteOrderMutation,
} from "@/lib/api/orderApi";
import RequireAuth from "@/app/providers/RequireAuth";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Order } from "@/types/orders";
import Loader from "@/app/components/Loader";
const ORDER_STATUS_COLORS = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500", 
  completed: "bg-green-500",
  cancelled: "bg-red-500",
} as const;

export default function OrdersPage() {
  const router = useRouter();
  const { data: orders = [], isLoading } = useGetAllOrdersQuery();
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [deleteOrder] = useDeleteOrderMutation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleDeleteOrder = async () => {
    if (!deleteOrderId) return;

    try {
      await deleteOrder(deleteOrderId).unwrap();
      toast.success("Order deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete order");
    } finally {
      setDeleteOrderId(null);
    }
  };

  const getStatusColor = (status: string): string => {
    return ORDER_STATUS_COLORS[status.toLowerCase() as keyof typeof ORDER_STATUS_COLORS] || "bg-gray-500";
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/dashboard/orders/${orderId}`);
  };

  const handleEditOrder = (orderId: string) => {
    router.push(`/dashboard/orders/${orderId}/edit-order`);
  };

  const handleAddOrder = () => {
    router.push("/dashboard/orders/add-order");
  };

  const filteredOrders = orders.filter((order: Order) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      order.customer.name.toLowerCase().includes(searchTerm) ||
      order.customer.email.toLowerCase().includes(searchTerm) ||
      order.customer.phone.toLowerCase().includes(searchTerm) ||
      order.status.toLowerCase().includes(searchTerm)
    );
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <Loader />
    </div>;
  }

  return (
    <RequireAuth>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Orders</h1>
          <Button onClick={handleAddOrder}>Add New Order</Button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Number</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order: Order) => (
                    <TableRow key={order._id}>
                      <TableCell>{order.customer.name}</TableCell>
                      <TableCell>{order.customer.email}</TableCell>
                      <TableCell>{order.customer.phone}</TableCell>
                      <TableCell>{order.customer.address || "N/A"}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item.name} className="text-sm">
                              {item.name} x {item.quantity}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrder(order._id)}
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditOrder(order._id)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteOrderId(order._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <AlertDialog
          open={!!deleteOrderId}
          onOpenChange={() => setDeleteOrderId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the order.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteOrder}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </RequireAuth>
  );
}
