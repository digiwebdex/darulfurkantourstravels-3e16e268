import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  order_index: number;
  is_active: boolean;
}

const AdminMenu = () => {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({ label: "", href: "" });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("order_index");
    
    if (!error && data) {
      setMenuItems(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      const { error } = await supabase
        .from("menu_items")
        .update({ label: formData.label, href: formData.href })
        .eq("id", editingItem.id);
      
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Menu item updated" });
      }
    } else {
      const maxOrder = Math.max(...menuItems.map(m => m.order_index), 0);
      const { error } = await supabase
        .from("menu_items")
        .insert({ label: formData.label, href: formData.href, order_index: maxOrder + 1 });
      
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Menu item created" });
      }
    }
    
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({ label: "", href: "" });
    fetchMenuItems();
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({ label: item.label, href: item.href });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Menu item deleted" });
      fetchMenuItems();
    }
  };

  const toggleActive = async (item: MenuItem) => {
    const { error } = await supabase
      .from("menu_items")
      .update({ is_active: !item.is_active })
      .eq("id", item.id);
    
    if (!error) fetchMenuItems();
  };

  const moveItem = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= menuItems.length) return;

    const updates = [
      { id: menuItems[index].id, order_index: menuItems[newIndex].order_index },
      { id: menuItems[newIndex].id, order_index: menuItems[index].order_index },
    ];

    for (const update of updates) {
      await supabase.from("menu_items").update({ order_index: update.order_index }).eq("id", update.id);
    }
    fetchMenuItems();
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Navigation Menu</CardTitle>
          <CardDescription>Manage website navigation links</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingItem(null);
            setFormData({ label: "", href: "" });
          }
        }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add Menu Item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Label</label>
                <Input
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., Home"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Link (href)</label>
                <Input
                  value={formData.href}
                  onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                  placeholder="e.g., #home or /about"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingItem ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Order</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Link</TableHead>
              <TableHead className="w-20">Active</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItem(index, "up")} disabled={index === 0}>
                      ↑
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItem(index, "down")} disabled={index === menuItems.length - 1}>
                      ↓
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{item.label}</TableCell>
                <TableCell className="text-muted-foreground">{item.href}</TableCell>
                <TableCell>
                  <Switch checked={item.is_active} onCheckedChange={() => toggleActive(item)} />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {menuItems.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No menu items yet. Add your first one!</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminMenu;
