"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Order { _id: string; status: string; }

export default function UpdateOrderStatusPage() {
  const { id } = useParams();              // ← get the :id
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}`)
      .then((r) => r.json())
      .then((data: Order) => {
        setOrder(data);
        setNewStatus(data.status);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!id) return;
    setUpdating(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!res.ok) throw new Error();
      router.push(`/dashboard/orders/${id}`);
    } catch {
      console.error("Failed to update");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div>Loading…</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Update Order Status</h1>
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/orders/${id}`)}
        >
          Back
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Current: {order.status}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Choose status" />
            </SelectTrigger>
            <SelectContent>
              {["pending", "processing", "completed", "cancelled"].map((s) => (
                <SelectItem key={s} value={s}>
                  {s[0].toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-4 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/orders/${id}`)}
            >
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={updating}>
              {updating ? "Updating…" : "Update Status"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
