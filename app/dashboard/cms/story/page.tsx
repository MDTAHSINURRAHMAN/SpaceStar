"use client";

import { useState } from "react";
import {
  useGetAllStoriesQuery,
  useCreateStoryMutation,
  useUpdateStoryMutation,
  useDeleteStoryMutation,
} from "@/lib/api/storyApi";
import { StoryEntry, StoryContentBlock } from "@/types/story";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import RequireAuth from "@/app/providers/RequireAuth";
export default function StoryPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [content, setContent] = useState<StoryContentBlock[]>([
    { title: "", description: "" },
  ]);

  const { data: stories, isLoading, error } = useGetAllStoriesQuery();
  const [createStory] = useCreateStoryMutation();
  const [updateStory] = useUpdateStoryMutation();
  const [deleteStory] = useDeleteStoryMutation();

  const resetForm = () => {
    setImage(null);
    setContent([{ title: "", description: "" }]);
  };

  const handleContentChange = (
    index: number,
    field: keyof StoryContentBlock,
    value: string
  ) => {
    const updatedContent = [...content];
    updatedContent[index] = { ...updatedContent[index], [field]: value };
    setContent(updatedContent);
  };

  const addContentBlock = () => {
    setContent([...content, { title: "", description: "" }]);
  };

  const removeContentBlock = (index: number) => {
    if (content.length <= 1) return;
    const updatedContent = [...content];
    updatedContent.splice(index, 1);
    setContent(updatedContent);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleCreate = async () => {
    if (!image) {
      toast.error("Please select an image");
      return;
    }

    if (content.some((block) => !block.title || !block.description)) {
      toast.error("Please fill in all content fields");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("content", JSON.stringify(content));

      console.log("FORMDATA debug:", {
        image,
        content: JSON.stringify(content),
      });

      await createStory(formData);
      setIsCreating(false);
      resetForm();
      toast.success("Story created successfully");
    } catch (err) {
      console.error("Create error:", err);
      toast.error("Failed to create story");
    }
  };

  const handleEdit = (story: StoryEntry) => {
    setEditingId(story._id);
    setContent(story.content);
  };

  const handleUpdate = async (id: string) => {
    if (content.some((block) => !block.title || !block.description)) {
      toast.error("Please fill in all content fields");
      return;
    }

    try {
      const formData = new FormData();
      if (image) {
        formData.append("image", image);
      }
      formData.append("content", JSON.stringify(content));

      await updateStory({ id, formData });
      setEditingId(null);
      resetForm();
      toast.success("Story updated successfully");
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update story");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this story?")) {
      try {
        await deleteStory(id);
        toast.success("Story deleted successfully");
      } catch (err) {
        console.error("Delete error:", err);
        toast.error("Failed to delete story");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Error loading stories
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Story Management</h1>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? "Cancel" : "Add New Story"}
        </Button>
      </div>

      {isCreating && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Story</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Image</label>
                <Input type="file" accept="image/*" onChange={handleImageChange} />
                {image && (
                  <p className="mt-2 text-sm text-green-600">
                    Image selected: {image.name}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-medium">Content Blocks</label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addContentBlock}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add Block
                  </Button>
                </div>

                {content.map((block, index) => (
                  <div key={index} className="p-4 border rounded-md mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Block {index + 1}</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeContentBlock(index)}
                        disabled={content.length <= 1}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm mb-1">Title</label>
                        <Input
                          value={block.title}
                          onChange={(e) =>
                            handleContentChange(index, "title", e.target.value)
                          }
                          placeholder="Enter title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Description</label>
                        <Textarea
                          value={block.description}
                          onChange={(e) =>
                            handleContentChange(index, "description", e.target.value)
                          }
                          placeholder="Enter description"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={handleCreate} className="w-full">
                Create Story
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stories?.map((story) => (
          <Card key={story._id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Story</span>
                <div className="flex gap-2">
                  {editingId === story._id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleUpdate(story._id)}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(story)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(story._id)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative h-48 w-full overflow-hidden rounded-md">
                  <Image
                    src={story.image}
                    alt="Story image"
                    fill
                    className="object-cover"
                  />
                </div>

                {editingId === story._id ? (
                  <div>
                    <div className="mb-4">
                      <label className="block mb-2">Update Image (optional)</label>
                      <Input type="file" accept="image/*" onChange={handleImageChange} />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-medium">Content Blocks</label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={addContentBlock}
                          className="flex items-center gap-1"
                        >
                          <Plus className="h-4 w-4" /> Add Block
                        </Button>
                      </div>

                      {content.map((block, index) => (
                        <div key={index} className="p-4 border rounded-md mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium">Block {index + 1}</h3>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeContentBlock(index)}
                              disabled={content.length <= 1}
                            >
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm mb-1">Title</label>
                              <Input
                                value={block.title}
                                onChange={(e) =>
                                  handleContentChange(index, "title", e.target.value)
                                }
                                placeholder="Enter title"
                              />
                            </div>
                            <div>
                              <label className="block text-sm mb-1">Description</label>
                              <Textarea
                                value={block.description}
                                onChange={(e) =>
                                  handleContentChange(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter description"
                                rows={3}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {story.content.map((block, index) => (
                      <div key={index} className="p-4 border rounded-md">
                        <h3 className="font-bold mb-2">{block.title}</h3>
                        <p className="text-gray-700">{block.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stories?.length === 0 && !isCreating && (
        <div className="text-center p-8 border rounded-md">
          <p className="text-gray-500 mb-4">No stories found</p>
          <Button onClick={() => setIsCreating(true)}>Create Your First Story</Button>
        </div>
      )}
    </div>
    </RequireAuth>
  );
}
