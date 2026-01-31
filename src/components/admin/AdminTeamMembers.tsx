import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Users, ArrowUp, ArrowDown } from "lucide-react";
import ImageUpload from "./ImageUpload";
import { useImageUpload } from "@/hooks/useImageUpload";

interface TeamMember {
  id: string;
  name: string;
  designation: string;
  bio: string;
  image_url: string;
  phone: string;
  email: string;
  is_active: boolean;
  order_index: number;
}

const AdminTeamMembers = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    bio: "",
    image_url: "",
    phone: "",
    email: "",
  });
  const { uploadImage, uploading } = useImageUpload({
    bucket: "admin-uploads",
    folder: "team",
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("team_members" as any)
      .select("*")
      .order("order_index");

    if (data) {
      setMembers((data as any[]).map((m) => ({
        id: m.id,
        name: m.name,
        designation: m.designation || "",
        bio: m.bio || "",
        image_url: m.image_url || "",
        phone: m.phone || "",
        email: m.email || "",
        is_active: m.is_active,
        order_index: m.order_index,
      })));
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingItem) {
      const { error } = await supabase
        .from("team_members" as any)
        .update(formData)
        .eq("id", editingItem.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Team member updated" });
      }
    } else {
      const maxOrder = Math.max(...members.map((m) => m.order_index), -1);
      const { error } = await supabase
        .from("team_members" as any)
        .insert([{ ...formData, order_index: maxOrder + 1 }]);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Team member added" });
      }
    }

    resetForm();
    fetchMembers();
  };

  const handleEdit = (item: TeamMember) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      designation: item.designation,
      bio: item.bio,
      image_url: item.image_url,
      phone: item.phone,
      email: item.email,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;

    const { error } = await supabase.from("team_members" as any).delete().eq("id", id);

    if (!error) {
      toast({ title: "Success", description: "Team member deleted" });
      fetchMembers();
    }
  };

  const toggleActive = async (item: TeamMember) => {
    await supabase
      .from("team_members" as any)
      .update({ is_active: !item.is_active })
      .eq("id", item.id);
    fetchMembers();
  };

  const moveItem = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= members.length) return;

    const newMembers = [...members];
    [newMembers[index], newMembers[newIndex]] = [newMembers[newIndex], newMembers[index]];

    await Promise.all(
      newMembers.map((m, i) =>
        supabase.from("team_members" as any).update({ order_index: i }).eq("id", m.id)
      )
    );

    fetchMembers();
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({
      name: "",
      designation: "",
      bio: "",
      image_url: "",
      phone: "",
      email: "",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Members
            </CardTitle>
            <CardDescription>Manage your team members displayed on the homepage</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Photo</label>
                  <ImageUpload
                    value={formData.image_url}
                    onChange={(url) => setFormData({ ...formData, image_url: url })}
                    onUpload={uploadImage}
                    uploading={uploading}
                    label=""
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Designation *</label>
                    <Input
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Bio</label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {editingItem ? "Update Member" : "Add Member"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Order</TableHead>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member, index) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveItem(index, "up")}
                        disabled={index === 0}
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveItem(index, "down")}
                        disabled={index === members.length - 1}
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.image_url ? (
                      <img
                        src={member.image_url}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Users className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.designation}</TableCell>
                  <TableCell>
                    <Switch
                      checked={member.is_active}
                      onCheckedChange={() => toggleActive(member)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(member)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {members.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No team members added yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTeamMembers;
