"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Search, Plus } from "lucide-react";
import Loader from "@/app/components/Loader";
import { Header } from "@/app/components/header/Header";
import { buttonVariants } from "@/components/ui/button";
import { OrdersPageContent } from "@/app/components/OrdersPageContent";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

const ORDER_STATUS_COLORS = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
} as const;

export default function OrdersPage() {
  const router = useRouter();
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const searchParams = useMemo(() => {
    return searchQuery ? { search: searchQuery } : undefined;
  }, [searchQuery]);

  const { data: orders = [], isLoading } = useGetAllOrdersQuery(searchParams);
  const [deleteOrder] = useDeleteOrderMutation();

  const handleDeleteOrder = async () => {
    if (!deleteOrderId) return;

    try {
      await deleteOrder(deleteOrderId).unwrap();
      toast.success("Order deleted successfully");
    } catch {
      toast.error("Failed to delete order");
    } finally {
      setDeleteOrderId(null);
    }
  };

  const handleAddOrder = () => {
    router.push("/dashboard/orders/add-order");
  };

  const handleViewOrder = (id: string) =>
    router.push(`/dashboard/orders/${id}`);
  const handleEditOrder = (id: string) =>
    router.push(`/dashboard/orders/${id}/edit-order`);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <RequireAuth>
      <OrdersPageContent>
        <div className="font-roboto">
          <Header pageName="Orders" />

          <div className="px-10 mt-4 space-y-4">
            <div className="flex items-center space-x-4 backdrop-blur rounded-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer name, email, phone or status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-transparent rounded-full"
                />
              </div>
              <div>
                <Button
                  variant={
                    buttonVariants({ variant: "spaceStarOutline" }) as any
                  }
                  onClick={handleAddOrder}
                  size="lg"
                  className="font-normal text-gray-700 hover:shadow-sm border border-gray-300/40 rounded-full transition-all"
                >
                  <Plus className="h-4 w-4" /> Add Order
                </Button>
              </div>
            </div>

            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-normal text-gray-500">
                      Customer
                    </TableHead>
                    <TableHead className="font-normal text-gray-500">
                      Email
                    </TableHead>
                    <TableHead className="font-normal text-gray-500">
                      Number
                    </TableHead>
                    <TableHead className="font-normal text-gray-500">
                      Address
                    </TableHead>
                    <TableHead className="font-normal text-gray-500">
                      Items
                    </TableHead>
                    <TableHead className="font-normal text-gray-500">
                      Total
                    </TableHead>
                    <TableHead className="font-normal text-gray-500">
                      Status
                    </TableHead>
                    <TableHead className="font-normal text-gray-500">
                      Date
                    </TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(orders.length > 0 ? orders : []).map((order) => (
                    <TableRow
                      key={order._id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-semibold text-gray-700">
                        {order.customer.name || "No name provided"}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-700">
                        {order.customer.email || "No email provided"}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-700">
                        {order.customer.phone || "No phone provided"}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-700">
                        {order.customer.address || "No address provided"}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-700 text-sm space-y-1">
                        {order.items.length > 0 ? (
                          order.items.map((item) => (
                            <div key={item.name}>
                              {item.name || "Unnamed item"} x{" "}
                              {item.quantity || 0}
                            </div>
                          ))
                        ) : (
                          <div>No items</div>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-700">
                        ${(order.totalAmount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            ORDER_STATUS_COLORS[
                              order.status as keyof typeof ORDER_STATUS_COLORS
                            ] || "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {order.status || "Unknown"}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-gray-700">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "No date"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="spaceStarOutline"
                              className="h-8 w-8 p-0 hover:bg-muted"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-[160px]"
                          >
                            <DropdownMenuItem
                              onClick={() => handleViewOrder(order._id)}
                              className="cursor-pointer"
                            >
                              View Order
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditOrder(order._id)}
                              className="cursor-pointer"
                            >
                              Edit Order
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteOrderId(order._id)}
                              className="text-red-600 cursor-pointer focus:text-red-600 dark:focus:text-red-500"
                            >
                              Delete Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <AlertDialog
          open={!!deleteOrderId}
          onOpenChange={() => setDeleteOrderId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the order.
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
      </OrdersPageContent>
    </RequireAuth>
  );
}
