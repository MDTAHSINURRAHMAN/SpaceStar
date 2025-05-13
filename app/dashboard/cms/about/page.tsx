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
  iframeLink: "",
  image1Url: "",
  image2Url: "",
};

// Function to convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (url: string): string => {
  if (!url) return "";

  // Handle youtu.be format
  if (url.includes("youtu.be")) {
    const videoId = url.split("youtu.be/")[1]?.split("?")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // Handle youtube.com format
  if (url.includes("youtube.com/watch")) {
    const videoId = url.split("v=")[1]?.split("&")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  return url; // Return original URL if not YouTube
};

export default function AboutPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AboutContent>(INITIAL_FORM_STATE);
  const [image1File, setImage1File] = useState<File | null>(null);
  const [image2File, setImage2File] = useState<File | null>(null);

  const { data: about, isLoading, error, refetch } = useGetAboutContentQuery();

  useEffect(() => {
    if (about) {
      // Parse missionPoints if it's a string
      const parsedAbout = {
        ...about,
        missionPoints: Array.isArray(about.missionPoints)
          ? about.missionPoints
          : JSON.parse(about.missionPoints || "[]"),
      };
      setFormData(parsedAbout);
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
      ),
    }));
  };

  const addMissionPoint = () => {
    setFormData((prev) => ({
      ...prev,
      missionPoints: [...prev.missionPoints, ""],
    }));
  };

  const removeMissionPoint = (index: number) => {
    if (formData.missionPoints.length <= 1) return;

    setFormData((prev) => ({
      ...prev,
      missionPoints: prev.missionPoints.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      const method = about ? "PUT" : "POST";
      const formDataToSend = new FormData();

      // Append text fields
      formDataToSend.append("brandMessage", formData.brandMessage);
      // Ensure missionPoints is sent as a JSON string
      formDataToSend.append(
        "missionPoints",
        JSON.stringify(formData.missionPoints)
      );
      formDataToSend.append("email", formData.email);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("iframeLink", formData.iframeLink || "");

      // Append image files if they exist
      if (image1File) {
        formDataToSend.append("image1", image1File);
      }
      if (image2File) {
        formDataToSend.append("image2", image2File);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/about`,
        {
          method,
          credentials: "include",
          body: formDataToSend,
        }
      );

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/about`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

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
        <div className="w-2/3 mx-auto mt-8">
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
                      <label className="text-sm font-medium">
                        Brand Message
                      </label>
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
                        <label className="text-sm font-medium">
                          Mission Points
                        </label>
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
                            onChange={(e) =>
                              handleMissionChange(idx, e.target.value)
                            }
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

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Iframe Link</label>
                      <Input
                        name="iframeLink"
                        value={formData.iframeLink}
                        onChange={handleInputChange}
                        placeholder="Enter iframe link"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Image 1</label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setImage1File(file);
                            }
                          }}
                        />
                        {formData.image1Url && (
                          <img
                            src={formData.image1Url}
                            alt="Preview 1"
                            className="mt-2 max-h-40 object-contain"
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Image 2</label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setImage2File(file);
                            }
                          }}
                        />
                        {formData.image2Url && (
                          <img
                            src={formData.image2Url}
                            alt="Preview 2"
                            className="mt-2 max-h-40 object-contain"
                          />
                        )}
                      </div>
                    </div>

                    <div className="gap-2 pt-4">
                      <Button
                        onClick={handleSave}
                        variant="spaceStarOutline"
                        className="w-1/3 font-normal text-gray-700 hover:shadow-md rounded-full transition-all border border-gray-700"
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="spaceStarOutline"
                        onClick={() => {
                          setIsEditing(false);
                          if (about) setFormData(about);
                        }}
                        className="w-1/3 font-normal text-white bg-red-500 hover:shadow-md rounded-full transition-all cursor-pointer"
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
                        {(Array.isArray(about?.missionPoints)
                          ? about?.missionPoints
                          : JSON.parse(about?.missionPoints || "[]")
                        ).map((point: string, i: number) => (
                          <li key={i} className="text-gray-600">
                            {point}
                          </li>
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

                    {about?.iframeLink && (
                      <div>
                        <h3 className="font-medium">Iframe Content</h3>
                        <div className="mt-2 aspect-video w-full">
                          <iframe
                            src={getYouTubeEmbedUrl(about.iframeLink)}
                            className="w-full h-full border-0"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      {about?.image1Url && (
                        <div>
                          <h3 className="font-medium">Image 1</h3>
                          <img
                            src={about.image1Url}
                            alt="About Image 1"
                            className="mt-2 max-h-60 object-contain"
                          />
                        </div>
                      )}
                      {about?.image2Url && (
                        <div>
                          <h3 className="font-medium">Image 2</h3>
                          <img
                            src={about.image2Url}
                            alt="About Image 2"
                            className="mt-2 max-h-60 object-contain"
                          />
                        </div>
                      )}
                    </div>

                    <div className="gap-3 pt-2">
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="spaceStarOutline"
                        className="w-1/3 flex-1 font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md rounded-full transition-all border-2 border-gray-500 hover:border-gray-500 py-2 mr-3"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="spaceStarOutline"
                        onClick={handleDelete}
                        className="w-1/3 flex-1 font-medium text-white bg-red-500 hover:bg-red-600 rounded-full transition-all shadow-sm hover:shadow-md"
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
