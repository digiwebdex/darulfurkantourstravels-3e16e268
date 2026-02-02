import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, GripVertical, Globe } from "lucide-react";
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

interface Destination {
  id: string;
  country_name: string;
  country_code: string;
  flag_url: string | null;
  is_active: boolean;
  order_index: number;
}

const SortableRow = ({ destination, onEdit, onDelete }: { 
  destination: Destination; 
  onEdit: (d: Destination) => void;
  onDelete: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: destination.id });

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
        {destination.flag_url ? (
          <img src={destination.flag_url} alt={destination.country_name} className="w-10 h-auto rounded shadow-sm" />
        ) : (
          <Globe className="h-6 w-6 text-muted-foreground" />
        )}
      </TableCell>
      <TableCell className="font-medium">{destination.country_name}</TableCell>
      <TableCell className="uppercase">{destination.country_code}</TableCell>
      <TableCell>
        <span className={`px-2 py-1 rounded-full text-xs ${destination.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
          {destination.is_active ? 'Active' : 'Inactive'}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(destination)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(destination.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

const AdminHotelDestinations = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [formData, setFormData] = useState({
    country_name: "",
    country_code: "",
    flag_url: "",
    is_active: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    const { data, error } = await supabase
      .from("hotel_destinations")
      .select("*")
      .order("order_index");
    
    if (error) {
      toast.error("Failed to load destinations");
    } else {
      setDestinations(data || []);
    }
    setLoading(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = destinations.findIndex((d) => d.id === active.id);
    const newIndex = destinations.findIndex((d) => d.id === over.id);
    const newOrder = arrayMove(destinations, oldIndex, newIndex);
    setDestinations(newOrder);

    // Update order in database
    for (let i = 0; i < newOrder.length; i++) {
      await supabase
        .from("hotel_destinations")
        .update({ order_index: i })
        .eq("id", newOrder[i].id);
    }
    toast.success("Order updated");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      country_name: formData.country_name,
      country_code: formData.country_code.toLowerCase(),
      flag_url: formData.flag_url || `https://flagcdn.com/w80/${formData.country_code.toLowerCase()}.png`,
      is_active: formData.is_active,
      order_index: editingDestination ? editingDestination.order_index : destinations.length,
    };

    if (editingDestination) {
      const { error } = await supabase
        .from("hotel_destinations")
        .update(payload)
        .eq("id", editingDestination.id);
      
      if (error) {
        toast.error("Failed to update destination");
      } else {
        toast.success("Destination updated");
        fetchDestinations();
      }
    } else {
      const { error } = await supabase
        .from("hotel_destinations")
        .insert(payload);
      
      if (error) {
        toast.error("Failed to add destination");
      } else {
        toast.success("Destination added");
        fetchDestinations();
      }
    }

    resetForm();
  };

  const handleEdit = (destination: Destination) => {
    setEditingDestination(destination);
    setFormData({
      country_name: destination.country_name,
      country_code: destination.country_code,
      flag_url: destination.flag_url || "",
      is_active: destination.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this destination?")) return;
    
    const { error } = await supabase.from("hotel_destinations").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Destination deleted");
      fetchDestinations();
    }
  };

  const resetForm = () => {
    setFormData({ country_name: "", country_code: "", flag_url: "", is_active: true });
    setEditingDestination(null);
    setDialogOpen(false);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Hotel Destinations</h2>
          <p className="text-muted-foreground">Manage destination countries shown on hotel page</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Destination
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDestination ? "Edit" : "Add"} Destination</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Country Name</Label>
                <Input
                  value={formData.country_name}
                  onChange={(e) => setFormData({ ...formData, country_name: e.target.value })}
                  placeholder="e.g., Saudi Arabia"
                  required
                />
              </div>
              <div>
                <Label>Country Code (2 letters)</Label>
                <Input
                  value={formData.country_code}
                  onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                  placeholder="e.g., sa"
                  maxLength={2}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  ISO 3166-1 alpha-2 code. Flag will auto-generate from this.
                </p>
              </div>
              <div>
                <Label>Custom Flag URL (optional)</Label>
                <Input
                  value={formData.flag_url}
                  onChange={(e) => setFormData({ ...formData, flag_url: e.target.value })}
                  placeholder="Leave empty to auto-generate"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingDestination ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-20">Flag</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SortableContext items={destinations.map(d => d.id)} strategy={verticalListSortingStrategy}>
                  {destinations.map((destination) => (
                    <SortableRow
                      key={destination.id}
                      destination={destination}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </Table>
          </DndContext>
          {destinations.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No destinations yet. Add your first one!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHotelDestinations;
