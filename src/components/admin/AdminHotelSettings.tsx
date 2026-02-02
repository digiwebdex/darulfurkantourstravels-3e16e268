import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, GripVertical, Star, Building2, Settings, MapPin, Phone, Mail, Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Hotel {
  id: string;
  name: string;
  city: string;
  country: string | null;
  star_rating: number | null;
  distance_from_haram: number | null;
  description: string | null;
  facilities: string[] | null;
  images: string[] | null;
  google_map_link: string | null;
  google_map_embed_url: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  is_active: boolean | null;
  order_index: number | null;
}

interface SectionSettings {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  is_enabled: boolean | null;
  booking_enabled: boolean | null;
  star_label: string | null;
}

interface SortableRowProps {
  item: Hotel;
  onEdit: (item: Hotel) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
}

const COUNTRIES = [
  "Saudi Arabia",
  "Dubai",
  "Turkey",
  "Malaysia",
  "Thailand",
  "Singapore",
  "Indonesia",
  "Egypt",
];

const SortableRow = ({ item, onEdit, onDelete, onToggle }: SortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <button
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell>
      {item.images?.[0] ? (
          <img src={item.images[0]} alt={item.name} className="w-16 h-10 object-cover rounded" />
        ) : (
          <div className="w-16 h-10 bg-muted rounded flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </TableCell>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell>
        <Badge variant="outline">{item.country || "N/A"}</Badge>
      </TableCell>
      <TableCell>{item.city}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {Array.from({ length: item.star_rating || 0 }).map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
      </TableCell>
      <TableCell>
        <Switch
          checked={item.is_active ?? false}
          onCheckedChange={(checked) => onToggle(item.id, checked)}
        />
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

const AdminHotelSettings = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [settings, setSettings] = useState<SectionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    country: "Saudi Arabia",
    star_rating: 3,
    distance_from_haram: 0,
    description: "",
    facilities: "",
    images: [] as string[],
    google_map_link: "",
    google_map_embed_url: "",
    contact_phone: "",
    contact_email: "",
    is_active: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch hotels
    const { data: hotelsData, error: hotelsError } = await supabase
      .from("hotels")
      .select("*")
      .order("order_index");

    if (hotelsError) {
      toast.error("Failed to fetch hotels");
    } else {
      setHotels(hotelsData || []);
    }

    // Fetch section settings
    const { data: settingsData } = await supabase
      .from("hotel_section_settings")
      .select("*")
      .eq("section_key", "general")
      .maybeSingle();

    if (settingsData) {
      setSettings(settingsData);
    }

    setLoading(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = hotels.findIndex((item) => item.id === active.id);
      const newIndex = hotels.findIndex((item) => item.id === over.id);

      const newHotels = arrayMove(hotels, oldIndex, newIndex);
      setHotels(newHotels);

      for (let i = 0; i < newHotels.length; i++) {
        await supabase
          .from("hotels")
          .update({ order_index: i })
          .eq("id", newHotels[i].id);
      }

      toast.success("Order updated");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSubmit = {
      name: formData.name,
      city: formData.city,
      country: formData.country,
      star_rating: formData.star_rating,
      distance_from_haram: formData.distance_from_haram,
      description: formData.description || null,
      facilities: formData.facilities ? formData.facilities.split("\n").filter((f) => f.trim()) : [],
      images: formData.images,
      google_map_link: formData.google_map_link || null,
      google_map_embed_url: formData.google_map_embed_url || null,
      contact_phone: formData.contact_phone || null,
      contact_email: formData.contact_email || null,
      is_active: formData.is_active,
    };

    if (editingItem) {
      const { error } = await supabase
        .from("hotels")
        .update(dataToSubmit)
        .eq("id", editingItem.id);

      if (error) {
        toast.error("Failed to update hotel");
      } else {
        toast.success("Hotel updated");
      }
    } else {
      const maxOrder = Math.max(...hotels.map((h) => h.order_index || 0), -1);
      const { error } = await supabase.from("hotels").insert({
        ...dataToSubmit,
        order_index: maxOrder + 1,
      });

      if (error) {
        toast.error("Failed to create hotel");
      } else {
        toast.success("Hotel created");
      }
    }

    resetForm();
    fetchData();
  };

  const handleEdit = (item: Hotel) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      city: item.city,
      country: item.country || "Saudi Arabia",
      star_rating: item.star_rating || 3,
      distance_from_haram: item.distance_from_haram || 0,
      description: item.description || "",
      facilities: item.facilities?.join("\n") || "",
      images: item.images || [],
      google_map_link: item.google_map_link || "",
      google_map_embed_url: item.google_map_embed_url || "",
      contact_phone: item.contact_phone || "",
      contact_email: item.contact_email || "",
      is_active: item.is_active ?? true,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hotel?")) return;

    const { error } = await supabase.from("hotels").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete hotel");
    } else {
      toast.success("Hotel deleted");
      fetchData();
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("hotels")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update hotel");
    } else {
      setHotels((items) =>
        items.map((item) =>
          item.id === id ? { ...item, is_active: isActive } : item
        )
      );
      toast.success(isActive ? "Hotel enabled" : "Hotel disabled");
    }
  };

  const resetForm = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFormData({
      name: "",
      city: "",
      country: "Saudi Arabia",
      star_rating: 3,
      distance_from_haram: 0,
      description: "",
      facilities: "",
      images: [],
      google_map_link: "",
      google_map_embed_url: "",
      contact_phone: "",
      contact_email: "",
      is_active: true,
    });
  };

  const handleSettingsUpdate = async (updates: Partial<SectionSettings>) => {
    if (settings) {
      const { error } = await supabase
        .from("hotel_section_settings")
        .update(updates)
        .eq("id", settings.id);

      if (error) {
        toast.error("Failed to update settings");
      } else {
        setSettings({ ...settings, ...updates });
        toast.success("Settings updated");
      }
    } else {
      const { error } = await supabase.from("hotel_section_settings").insert({
        section_key: "general",
        ...updates,
      });

      if (error) {
        toast.error("Failed to create settings");
      } else {
        toast.success("Settings created");
        fetchData();
      }
    }
  };

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const file = files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `hotels/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("hotels")
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Failed to upload image");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("hotels")
      .getPublicUrl(filePath);

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, urlData.publicUrl],
    }));
    setUploading(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="hotels">
        <TabsList>
          <TabsTrigger value="hotels" className="gap-2">
            <Building2 className="w-4 h-4" />
            Hotels
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="w-4 h-4" />
            Section Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hotels" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Hotels
                </CardTitle>
                <CardDescription>
                  Manage hotels for booking. Drag to reorder. ({hotels.length} hotels)
                </CardDescription>
              </div>
              <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                  if (!open) resetForm();
                  setDialogOpen(open);
                }}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Hotel
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? "Edit Hotel" : "Add New Hotel"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <Tabs defaultValue="basic">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="images">Images</TabsTrigger>
                      </TabsList>

                      <TabsContent value="basic" className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Hotel Name *</Label>
                            <Input
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                              }
                              placeholder="e.g., Swissotel Makkah"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>City *</Label>
                            <Input
                              value={formData.city}
                              onChange={(e) =>
                                setFormData({ ...formData, city: e.target.value })
                              }
                              placeholder="e.g., Makkah"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Country *</Label>
                            <Select
                              value={formData.country}
                              onValueChange={(value) =>
                                setFormData({ ...formData, country: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {COUNTRIES.map((country) => (
                                  <SelectItem key={country} value={country}>
                                    {country}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Star Rating</Label>
                            <Select
                              value={String(formData.star_rating)}
                              onValueChange={(value) =>
                                setFormData({ ...formData, star_rating: parseInt(value) })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="3">3 Star</SelectItem>
                                <SelectItem value="4">4 Star</SelectItem>
                                <SelectItem value="5">5 Star</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Distance from Haram (meters)</Label>
                          <Input
                            type="number"
                            value={formData.distance_from_haram}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                distance_from_haram: parseInt(e.target.value) || 0,
                              })
                            }
                            placeholder="e.g., 500"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={formData.is_active}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, is_active: checked })
                            }
                          />
                          <Label>Active</Label>
                        </div>
                      </TabsContent>

                      <TabsContent value="details" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({ ...formData, description: e.target.value })
                            }
                            placeholder="Brief description of the hotel..."
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Facilities (one per line)</Label>
                          <Textarea
                            value={formData.facilities}
                            onChange={(e) =>
                              setFormData({ ...formData, facilities: e.target.value })
                            }
                            placeholder="Free WiFi&#10;Swimming Pool&#10;Restaurant&#10;Gym"
                            rows={4}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              Contact Phone
                            </Label>
                            <Input
                              value={formData.contact_phone}
                              onChange={(e) =>
                                setFormData({ ...formData, contact_phone: e.target.value })
                              }
                              placeholder="+966 xxx xxx xxxx"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Contact Email
                            </Label>
                            <Input
                              value={formData.contact_email}
                              onChange={(e) =>
                                setFormData({ ...formData, contact_email: e.target.value })
                              }
                              placeholder="hotel@example.com"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Google Map Link
                          </Label>
                          <Input
                            value={formData.google_map_link}
                            onChange={(e) =>
                              setFormData({ ...formData, google_map_link: e.target.value })
                            }
                            placeholder="https://maps.google.com/..."
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Google Map Embed URL</Label>
                          <Input
                            value={formData.google_map_embed_url}
                            onChange={(e) =>
                              setFormData({ ...formData, google_map_embed_url: e.target.value })
                            }
                            placeholder="https://www.google.com/maps/embed?..."
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="images" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Hotel Images</Label>
                          <div
                            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                              disabled={uploading}
                            />
                            {uploading ? (
                              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Uploading...
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <Upload className="h-8 w-8" />
                                <span>Click to upload image</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {formData.images.length > 0 && (
                          <div className="grid grid-cols-3 gap-3">
                            {formData.images.map((url, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={url}
                                  alt={`Hotel ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeImage(index)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                                {index === 0 && (
                                  <Badge className="absolute bottom-1 left-1 text-xs">
                                    Primary
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        {editingItem ? "Update" : "Create"}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {hotels.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No hotels yet. Add your first hotel to get started.
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead className="w-20">Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead className="w-20">Active</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <SortableContext
                        items={hotels.map((item) => item.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {hotels.map((item) => (
                          <SortableRow
                            key={item.id}
                            item={item}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onToggle={handleToggle}
                          />
                        ))}
                      </SortableContext>
                    </TableBody>
                  </Table>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Section Settings
              </CardTitle>
              <CardDescription>
                Configure the hotel booking section appearance and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input
                    value={settings?.title || ""}
                    onChange={(e) =>
                      handleSettingsUpdate({ title: e.target.value })
                    }
                    placeholder="Hotel Bookings"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Section Subtitle</Label>
                  <Input
                    value={settings?.subtitle || ""}
                    onChange={(e) =>
                      handleSettingsUpdate({ subtitle: e.target.value })
                    }
                    placeholder="Find your perfect stay"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Star Rating Label</Label>
                <Input
                  value={settings?.star_label || "Star"}
                  onChange={(e) =>
                    handleSettingsUpdate({ star_label: e.target.value })
                  }
                  placeholder="Star"
                />
                <p className="text-xs text-muted-foreground">
                  Label shown after star rating (e.g., "3 Star Hotels")
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Section Enabled</p>
                    <p className="text-sm text-muted-foreground">
                      Show or hide the hotel section on the website
                    </p>
                  </div>
                  <Switch
                    checked={settings?.is_enabled ?? true}
                    onCheckedChange={(checked) =>
                      handleSettingsUpdate({ is_enabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Booking Enabled</p>
                    <p className="text-sm text-muted-foreground">
                      Allow customers to submit booking requests
                    </p>
                  </div>
                  <Switch
                    checked={settings?.booking_enabled ?? true}
                    onCheckedChange={(checked) =>
                      handleSettingsUpdate({ booking_enabled: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminHotelSettings;
