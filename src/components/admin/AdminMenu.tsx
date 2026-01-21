import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, GripVertical, ExternalLink, Hash } from "lucide-react";
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

interface MenuItem {
  id: string;
  label: string;
  href: string;
  order_index: number;
  is_active: boolean;
}

interface SortableRowProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
}

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

  const isExternalLink = item.href.startsWith('http://') || item.href.startsWith('https://');
  const isSectionLink = item.href.startsWith('#');

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
      <TableCell className="font-medium">{item.label}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {isSectionLink && <Hash className="w-3 h-3 text-muted-foreground" />}
          {isExternalLink && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
          <span className="text-sm text-muted-foreground">{item.href}</span>
        </div>
      </TableCell>
      <TableCell>
        <Switch
          checked={item.is_active}
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

const AdminMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    href: "",
    is_active: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("order_index");

    if (error) {
      toast.error("Failed to fetch menu items");
      return;
    }

    setMenuItems(data || []);
    setLoading(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = menuItems.findIndex((item) => item.id === active.id);
      const newIndex = menuItems.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(menuItems, oldIndex, newIndex);
      setMenuItems(newItems);

      // Update order in database
      for (let i = 0; i < newItems.length; i++) {
        await supabase
          .from("menu_items")
          .update({ order_index: i })
          .eq("id", newItems[i].id);
      }

      toast.success("Menu order updated");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.label || !formData.href) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingItem) {
      const { error } = await supabase
        .from("menu_items")
        .update({
          label: formData.label,
          href: formData.href,
          is_active: formData.is_active,
        })
        .eq("id", editingItem.id);

      if (error) {
        toast.error("Failed to update menu item");
        return;
      }

      toast.success("Menu item updated");
    } else {
      const maxOrder = Math.max(...menuItems.map((i) => i.order_index), -1);
      const { error } = await supabase.from("menu_items").insert({
        label: formData.label,
        href: formData.href,
        is_active: formData.is_active,
        order_index: maxOrder + 1,
      });

      if (error) {
        toast.error("Failed to create menu item");
        return;
      }

      toast.success("Menu item created");
    }

    resetForm();
    fetchMenuItems();
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      label: item.label,
      href: item.href,
      is_active: item.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    const { error } = await supabase.from("menu_items").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete menu item");
      return;
    }

    toast.success("Menu item deleted");
    fetchMenuItems();
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("menu_items")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update menu item");
      return;
    }

    setMenuItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, is_active: isActive } : item
      )
    );
    toast.success(isActive ? "Menu item enabled" : "Menu item disabled");
  };

  const resetForm = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFormData({ label: "", href: "", is_active: true });
  };

  const quickLinks = [
    { label: "Services", href: "#services" },
    { label: "Hajj Packages", href: "#hajj" },
    { label: "Umrah Packages", href: "#umrah" },
    { label: "Visa Services", href: "#visa" },
    { label: "Our Team", href: "#team" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Gallery", href: "#gallery" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ];

  const handleQuickAdd = (link: { label: string; href: string }) => {
    setFormData({
      label: link.label,
      href: link.href,
      is_active: true,
    });
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Navigation Menu</h2>
          <p className="text-muted-foreground">
            Manage the main navigation menu items. Drag to reorder.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          if (!open) resetForm();
          setDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Menu Item" : "Add Menu Item"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label *</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  placeholder="e.g., Hajj Packages"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="href">Link URL *</Label>
                <Input
                  id="href"
                  value={formData.href}
                  onChange={(e) =>
                    setFormData({ ...formData, href: e.target.value })
                  }
                  placeholder="e.g., #hajj or https://example.com"
                />
                <p className="text-xs text-muted-foreground">
                  Use # for section links (e.g., #hajj) or full URLs for external links
                </p>
              </div>

              {!editingItem && (
                <div className="space-y-2">
                  <Label>Quick Add Section Links</Label>
                  <div className="flex flex-wrap gap-2">
                    {quickLinks.map((link) => (
                      <Button
                        key={link.href}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAdd(link)}
                        className="text-xs"
                      >
                        {link.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingItem ? "Update" : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
          <CardDescription>
            {menuItems.length} menu item{menuItems.length !== 1 ? "s" : ""} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {menuItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No menu items yet. Add your first menu item to get started.
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
                    <TableHead>Label</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead className="w-20">Active</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={menuItems.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {menuItems.map((item) => (
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

      <Card>
        <CardHeader>
          <CardTitle>Available Section IDs</CardTitle>
          <CardDescription>
            Use these section IDs as link URLs to navigate to specific parts of the homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickLinks.map((link) => (
              <div
                key={link.href}
                className="flex items-center gap-2 p-2 bg-muted rounded-md"
              >
                <Hash className="w-4 h-4 text-primary" />
                <span className="text-sm font-mono">{link.href}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMenu;
