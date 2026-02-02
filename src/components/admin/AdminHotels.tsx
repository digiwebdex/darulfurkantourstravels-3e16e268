import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Building2, Star, GripVertical, MapPin, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Hotel {
  id: string;
  name: string;
  city: string;
  country: string | null;
  star_rating: number | null;
  description: string | null;
  facilities: string[] | null;
  images: string[] | null;
  distance_from_haram: number | null;
  contact_phone: string | null;
  contact_email: string | null;
  google_map_link: string | null;
  google_map_embed_url: string | null;
  is_active: boolean | null;
  order_index: number | null;
}

const emptyHotel: Omit<Hotel, "id"> = {
  name: "",
  city: "Makkah",
  country: "Saudi Arabia",
  star_rating: 3,
  description: "",
  facilities: [],
  images: [],
  distance_from_haram: null,
  contact_phone: "",
  contact_email: "",
  google_map_link: "",
  google_map_embed_url: "",
  is_active: true,
  order_index: 0,
};

const facilityOptions = [
  "Free WiFi",
  "Air Conditioning",
  "Room Service",
  "Restaurant",
  "Gym",
  "Swimming Pool",
  "Parking",
  "Laundry",
  "24/7 Reception",
  "Prayer Room",
  "Shuttle Service",
  "Breakfast Included",
  "Elevator",
  "Safe",
  "Mini Bar",
];

const SortableRow = ({ hotel, onEdit, onDelete }: { hotel: Hotel; onEdit: (h: Hotel) => void; onDelete: (id: string) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: hotel.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <button {...attributes} {...listeners} className="cursor-grab p-1 hover:bg-muted rounded">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell>
        {hotel.images && hotel.images[0] ? (
          <img src={hotel.images[0]} alt={hotel.name} className="w-16 h-12 object-cover rounded" />
        ) : (
          <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </TableCell>
      <TableCell className="font-medium">{hotel.name}</TableCell>
      <TableCell>{hotel.city}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {hotel.star_rating}
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        </div>
      </TableCell>
      <TableCell>
        {hotel.distance_from_haram ? `${hotel.distance_from_haram}m` : "-"}
      </TableCell>
      <TableCell>
        <Badge variant={hotel.is_active ? "default" : "secondary"}>
          {hotel.is_active ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(hotel)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(hotel.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

const AdminHotels = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState<Omit<Hotel, "id">>(emptyHotel);
  const [uploading, setUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    const { data, error } = await supabase
      .from("hotels")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) {
      toast.error("Failed to fetch hotels");
    } else {
      setHotels(data || []);
    }
    setLoading(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = hotels.findIndex((h) => h.id === active.id);
    const newIndex = hotels.findIndex((h) => h.id === over.id);
    const newOrder = arrayMove(hotels, oldIndex, newIndex);

    setHotels(newOrder);

    // Update order in database
    for (let i = 0; i < newOrder.length; i++) {
      await supabase.from("hotels").update({ order_index: i }).eq("id", newOrder[i].id);
    }
    toast.success("Order updated");
  };

  const handleEdit = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name,
      city: hotel.city,
      country: hotel.country,
      star_rating: hotel.star_rating,
      description: hotel.description,
      facilities: hotel.facilities || [],
      images: hotel.images || [],
      distance_from_haram: hotel.distance_from_haram,
      contact_phone: hotel.contact_phone,
      contact_email: hotel.contact_email,
      google_map_link: hotel.google_map_link,
      google_map_embed_url: hotel.google_map_embed_url,
      is_active: hotel.is_active,
      order_index: hotel.order_index,
    });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingHotel(null);
    setFormData({ ...emptyHotel, order_index: hotels.length });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hotel?")) return;

    const { error } = await supabase.from("hotels").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete hotel");
    } else {
      toast.success("Hotel deleted");
      fetchHotels();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages: string[] = [...(formData.images || [])];

    for (const file of Array.from(files)) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("hotels")
        .upload(filePath, file);

      if (uploadError) {
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }

      const { data: urlData } = supabase.storage.from("hotels").getPublicUrl(filePath);
      newImages.push(urlData.publicUrl);
    }

    setFormData({ ...formData, images: newImages });
    setUploading(false);
  };

  const removeImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const toggleFacility = (facility: string) => {
    const currentFacilities = formData.facilities || [];
    const newFacilities = currentFacilities.includes(facility)
      ? currentFacilities.filter((f) => f !== facility)
      : [...currentFacilities, facility];
    setFormData({ ...formData, facilities: newFacilities });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Hotel name is required");
      return;
    }

    if (editingHotel) {
      const { error } = await supabase
        .from("hotels")
        .update(formData)
        .eq("id", editingHotel.id);

      if (error) {
        toast.error("Failed to update hotel");
      } else {
        toast.success("Hotel updated");
        setDialogOpen(false);
        fetchHotels();
      }
    } else {
      const { error } = await supabase.from("hotels").insert([formData]);

      if (error) {
        toast.error("Failed to create hotel");
      } else {
        toast.success("Hotel created");
        setDialogOpen(false);
        fetchHotels();
      }
    }
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Hotels Management</CardTitle>
                <CardDescription>Manage all hotels ({hotels.length} total)</CardDescription>
              </div>
            </div>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Hotel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {hotels.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No hotels added yet. Click "Add Hotel" to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <SortableContext items={hotels.map((h) => h.id)} strategy={verticalListSortingStrategy}>
                      {hotels.map((hotel) => (
                        <SortableRow key={hotel.id} hotel={hotel} onEdit={handleEdit} onDelete={handleDelete} />
                      ))}
                    </SortableContext>
                  </TableBody>
                </Table>
              </DndContext>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hotel Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {editingHotel ? "Edit Hotel" : "Add New Hotel"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Hotel Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter hotel name"
                />
              </div>
              <div>
                <Label>City</Label>
                <Select value={formData.city} onValueChange={(v) => setFormData({ ...formData, city: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Makkah">Makkah</SelectItem>
                    <SelectItem value="Madinah">Madinah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Star Rating</Label>
                <Select
                  value={String(formData.star_rating || 3)}
                  onValueChange={(v) => setFormData({ ...formData, star_rating: Number(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} Star{n > 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Hotel description..."
                rows={3}
              />
            </div>

            {/* Distance & Contact */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Distance from Haram (meters)</Label>
                <Input
                  type="number"
                  value={formData.distance_from_haram || ""}
                  onChange={(e) => setFormData({ ...formData, distance_from_haram: Number(e.target.value) || null })}
                  placeholder="e.g. 500"
                />
              </div>
              <div>
                <Label>Contact Phone</Label>
                <Input
                  value={formData.contact_phone || ""}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+966..."
                />
              </div>
              <div>
                <Label>Contact Email</Label>
                <Input
                  value={formData.contact_email || ""}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="hotel@example.com"
                />
              </div>
            </div>

            {/* Map Links */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Google Map Link</Label>
                <Input
                  value={formData.google_map_link || ""}
                  onChange={(e) => setFormData({ ...formData, google_map_link: e.target.value })}
                  placeholder="https://maps.google.com/..."
                />
              </div>
              <div>
                <Label>Google Map Embed URL</Label>
                <Input
                  value={formData.google_map_embed_url || ""}
                  onChange={(e) => setFormData({ ...formData, google_map_embed_url: e.target.value })}
                  placeholder="https://www.google.com/maps/embed?..."
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <Label>Images</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.images?.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} alt="" className="w-24 h-16 object-cover rounded border" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="w-24 h-16 border-2 border-dashed border-muted-foreground/30 rounded flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  ) : (
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  )}
                </label>
              </div>
            </div>

            {/* Facilities */}
            <div>
              <Label>Facilities</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {facilityOptions.map((facility) => (
                  <Badge
                    key={facility}
                    variant={formData.facilities?.includes(facility) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleFacility(facility)}
                  >
                    {facility}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active ?? true}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Active</Label>
            </div>

            {/* Save Button */}
            <Button onClick={handleSave} className="w-full">
              {editingHotel ? "Update Hotel" : "Create Hotel"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHotels;
