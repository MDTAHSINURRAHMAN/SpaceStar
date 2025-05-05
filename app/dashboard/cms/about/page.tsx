"use client";

import { useState, useEffect } from "react";
import {
  useGetAboutContentQuery,
} from "@/lib/api/aboutApi";
import { AboutContent } from "@/types/about";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import RequireAuth from "@/app/providers/RequireAuth";

export default function AboutPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AboutContent>({
    brandMessage: "",
    missionPoints: ["", "", ""],
    email: "",
    address: "",
    phone: "",
  });

  const { data: about, isLoading, error, refetch } = useGetAboutContentQuery();

  // Update form data when about data is loaded
  useEffect(() => {
    if (about) {
      setFormData(about);
    }
  }, [about]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMissionChange = (index: number, value: string) => {
    const updated = [...formData.missionPoints];
    updated[index] = value;
    setFormData({ ...formData, missionPoints: updated });
  };

  const addMissionPoint = () => {
    setFormData({
      ...formData,
      missionPoints: [...formData.missionPoints, ""]
    });
  };

  const removeMissionPoint = (index: number) => {
    if (formData.missionPoints.length <= 1) return;
    const updated = [...formData.missionPoints];
    updated.splice(index, 1);
    setFormData({ ...formData, missionPoints: updated });
  };

  const handleSave = async () => {
    try {
      const method = about ? "PUT" : "POST";

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/about`, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save");
      await refetch();
      setIsEditing(false);
      toast.success("About content saved successfully");
    } catch (err) {
      toast.error("Failed to save about content");
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/about`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      await refetch();
      toast.success("Deleted successfully");
    } catch (error) {
      toast.error("Failed to delete about content");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">Error loading About content</div>;
  }

  const hasAbout = !!about;

  return (
    <RequireAuth>
      <div className="container mx-auto p-6">
      {!hasAbout && !isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Add About Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsEditing(true)}>Add Now</Button>
          </CardContent>
        </Card>
      )}

      {(isEditing || hasAbout) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{isEditing ? "Edit About" : "About Info"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <Textarea
                  name="brandMessage"
                  value={formData.brandMessage}
                  onChange={handleInputChange}
                  placeholder="Brand message"
                  rows={4}
                />
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Mission Points</h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addMissionPoint}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> Add Point
                    </Button>
                  </div>
                  {formData.missionPoints.map((point, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={point}
                        onChange={(e) => handleMissionChange(idx, e.target.value)}
                        placeholder={`Mission ${idx + 1}`}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeMissionPoint(idx)}
                        disabled={formData.missionPoints.length <= 1}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Input name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" />
                <Textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" />
                <Input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone" />
                <div className="flex gap-2">
                  <Button onClick={handleSave}>Save</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p><strong>Brand:</strong> {about?.brandMessage}</p>
                <ul className="list-disc pl-6">
                  {about?.missionPoints.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
                <p><strong>Email:</strong> {about?.email}</p>
                <p><strong>Address:</strong> {about?.address}</p>
                <p><strong>Phone:</strong> {about?.phone}</p>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => setIsEditing(true)}>Edit</Button>
                  <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
    </RequireAuth>
  );
}
