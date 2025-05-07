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
import { Header } from "@/app/components/header/Header";

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
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Error loading about content
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="font-roboto">
        <div className="w-full">
          <Header pageName="About Page" />
        </div>
        <div className="px-10 mt-4">
          {!about && !isEditing && (
            <Card className="mb-6 border-none shadow-none">
              <CardContent>
                <Button 
                  onClick={() => setIsEditing(true)}
                  variant="spaceStarOutline"
                  className="font-normal text-gray-700 hover:shadow-sm rounded-full transition-all border border-gray-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Content
                </Button>
              </CardContent>
            </Card>
          )}

          {(isEditing || about) && (
            <Card className="border-none shadow-none">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
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
                        className="resize-none"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">Mission Points</label>
                        <Button 
                          onClick={addMissionPoint}
                          variant="spaceStarOutline"
                          className="font-normal text-gray-700 hover:shadow-sm rounded-full transition-all border border-gray-700"
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
                            className="text-red-500"
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
                        className="resize-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={handleSave}
                        variant="spaceStarOutline"
                        className="font-normal text-gray-700 hover:shadow-sm rounded-full transition-all border border-gray-700"
                      >
                        Save Changes
                      </Button>
                      <Button 
                        variant="spaceStarOutline"
                        onClick={() => {
                          setIsEditing(false);
                          if (about) setFormData(about);
                        }}
                        className="font-normal bg-red-500 text-white hover:shadow-sm rounded-full transition-all cursor-pointer"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 p-6 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
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

                    <div className="flex gap-3 pt-2">
                      <Button 
                        onClick={() => setIsEditing(true)}
                        variant="spaceStarOutline"
                        className="flex-1 font-medium hover:bg-blue-50 rounded-full transition-all border-2 border-gray-200 hover:border-gray-300 py-2"
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="spaceStarOutline"
                        onClick={handleDelete}
                        className="flex-1 font-medium text-white bg-red-500 hover:bg-red-600 rounded-full transition-all shadow-sm hover:shadow-md"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
