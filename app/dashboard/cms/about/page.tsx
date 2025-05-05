"use client";

import { useState, useEffect } from "react";
import { useGetAboutContentQuery } from "@/lib/api/aboutApi";
import { AboutContent } from "@/types/about";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash, List } from "lucide-react";
import { toast } from "sonner";
import RequireAuth from "@/app/providers/RequireAuth";
import Loader from "@/app/components/Loader"; 
const INITIAL_FORM_STATE: AboutContent = {
  brandMessage: "",
  missionPoints: ["", "", ""],
  email: "",
  address: "",
  phone: "",
};

export default function AboutPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AboutContent>(INITIAL_FORM_STATE);

  const { data: about, isLoading, error, refetch } = useGetAboutContentQuery();

  useEffect(() => {
    if (about) {
      setFormData(about);
    }
  }, [about]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMissionChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      missionPoints: prev.missionPoints.map((point, i) => 
        i === index ? value : point
      )
    }));
  };

  const addMissionPoint = () => {
    setFormData((prev) => ({
      ...prev,
      missionPoints: [...prev.missionPoints, ""]
    }));
  };

  const removeMissionPoint = (index: number) => {
    if (formData.missionPoints.length <= 1) return;
    
    setFormData((prev) => ({
      ...prev,
      missionPoints: prev.missionPoints.filter((_, i) => i !== index)
    }));
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
      console.error("Error saving about content:", err);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/about`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete");
      
      await refetch();
      setFormData(INITIAL_FORM_STATE);
      toast.success("Content deleted successfully");
    } catch (error) {
      toast.error("Failed to delete about content");
      console.error("Error deleting about content:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center mt-10">
        Error loading About content
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="container mx-auto p-6 space-y-6">
        {!about && !isEditing && (
          <Card>
            <CardHeader>
              <CardTitle>About Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsEditing(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Content
              </Button>
            </CardContent>
          </Card>
        )}

        {(isEditing || about) && (
          <Card>
            <CardHeader>
              <CardTitle>
                {isEditing ? "Edit About Content" : "About Information"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Brand Message</label>
                    <Textarea
                      name="brandMessage"
                      value={formData.brandMessage}
                      onChange={handleInputChange}
                      placeholder="Enter your brand message"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Mission Points</label>
                      <Button 
                        onClick={addMissionPoint}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Point
                      </Button>
                    </div>
                    
                    {formData.missionPoints.map((point, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <List className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <Input
                          value={point}
                          onChange={(e) => handleMissionChange(idx, e.target.value)}
                          placeholder={`Mission point ${idx + 1}`}
                          className="flex-1"
                        />
                        <Button 
                          onClick={() => removeMissionPoint(idx)}
                          variant="ghost"
                          size="icon"
                          disabled={formData.missionPoints.length <= 1}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="contact@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone</label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address</label>
                    <Textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your address"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave}>Save Changes</Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        if (about) setFormData(about);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-medium">Brand Message</h3>
                    <p className="text-gray-600">{about?.brandMessage}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Mission Points</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      {about?.missionPoints.map((point, i) => (
                        <li key={i} className="text-gray-600">{point}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-gray-600">{about?.email}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Phone</h3>
                      <p className="text-gray-600">{about?.phone}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium">Address</h3>
                    <p className="text-gray-600">{about?.address}</p>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => setIsEditing(true)}>Edit</Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </RequireAuth>
  );
}
