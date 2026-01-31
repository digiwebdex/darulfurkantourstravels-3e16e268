import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, GripVertical, Save, Star } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/currency";

interface QuickPackage {
  id: string;
  icon_name: string;
  title: string;
  description: string;
  price: number;
  price_label: string | null;
  link: string;
  gradient_from: string;
  gradient_to: string;
  icon_bg: string;
  is_featured: boolean;
  order_index: number;
  is_active: boolean;
}

interface QuickPackagesSettings {
  id: string;
  title: string;
  subtitle: string;
  is_active: boolean;
}

const iconOptions = [
  { value: "Building2", label: "Building2 (হজ্জ)" },
  { value: "Moon", label: "Moon (উমরাহ)" },
  { value: "Gift", label: "Gift (অফার)" },
  { value: "Plane", label: "Plane (ফ্লাইট)" },
  { value: "Star", label: "Star (স্পেশাল)" },
  { value: "Award", label: "Award (প্রিমিয়াম)" },
  { value: "Crown", label: "Crown (ভিআইপি)" },
  { value: "Heart", label: "Heart (প্রিয়)" },
];

const AdminQuickPackages = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<QuickPackage[]>([]);
  const [settings, setSettings] = useState<QuickPackagesSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QuickPackage | null>(null);
  const [formData, setFormData] = useState({
    icon_name: "Building2",
    title: "",
    description: "",
    price: 0,
    price_label: "",
    link: "#packages",
    gradient_from: "primary",
    gradient_to: "emerald-dark",
    icon_bg: "bg-primary/10",
    is_featured: false,
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, settingsRes] = await Promise.all([
        supabase.from("quick_packages").select("*").order("order_index"),
        supabase.from("quick_packages_settings").select("*").single(),
      ]);

      if (itemsRes.data) setItems(itemsRes.data);
      if (settingsRes.data) setSettings(settingsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    const { error } = await supabase
      .from("quick_packages_settings")
      .update({
        title: settings.title,
        subtitle: settings.subtitle,
        is_active: settings.is_active,
      })
      .eq("id", settings.id);

    if (error) {
      toast({ title: "সেটিংস সেভ করতে সমস্যা হয়েছে", variant: "destructive" });
    } else {
      toast({ title: "সেটিংস সেভ হয়েছে" });
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      toast({ title: "সব ফিল্ড পূরণ করুন", variant: "destructive" });
      return;
    }

    const dataToSave = {
      icon_name: formData.icon_name,
      title: formData.title,
      description: formData.description,
      price: formData.price,
      price_label: formData.price_label || null,
      link: formData.link,
      gradient_from: formData.gradient_from,
      gradient_to: formData.gradient_to,
      icon_bg: formData.icon_bg,
      is_featured: formData.is_featured,
      is_active: formData.is_active,
    };

    if (editingItem) {
      const { error } = await supabase
        .from("quick_packages")
        .update(dataToSave)
        .eq("id", editingItem.id);

      if (error) {
        toast({ title: "আপডেট করতে সমস্যা হয়েছে", variant: "destructive" });
      } else {
        toast({ title: "প্যাকেজ আপডেট হয়েছে" });
        fetchData();
      }
    } else {
      const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.order_index)) : 0;
      const { error } = await supabase.from("quick_packages").insert({
        ...dataToSave,
        order_index: maxOrder + 1,
      });

      if (error) {
        toast({ title: "যোগ করতে সমস্যা হয়েছে", variant: "destructive" });
      } else {
        toast({ title: "নতুন প্যাকেজ যোগ হয়েছে" });
        fetchData();
      }
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      icon_name: "Building2",
      title: "",
      description: "",
      price: 0,
      price_label: "",
      link: "#packages",
      gradient_from: "primary",
      gradient_to: "emerald-dark",
      icon_bg: "bg-primary/10",
      is_featured: false,
      is_active: true,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত?")) return;

    const { error } = await supabase.from("quick_packages").delete().eq("id", id);
    if (error) {
      toast({ title: "মুছে ফেলতে সমস্যা হয়েছে", variant: "destructive" });
    } else {
      toast({ title: "প্যাকেজ মুছে ফেলা হয়েছে" });
      fetchData();
    }
  };

  const handleEdit = (item: QuickPackage) => {
    setEditingItem(item);
    setFormData({
      icon_name: item.icon_name,
      title: item.title,
      description: item.description,
      price: item.price,
      price_label: item.price_label || "",
      link: item.link,
      gradient_from: item.gradient_from,
      gradient_to: item.gradient_to,
      icon_bg: item.icon_bg,
      is_featured: item.is_featured,
      is_active: item.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (item: QuickPackage) => {
    const { error } = await supabase
      .from("quick_packages")
      .update({ is_active: !item.is_active })
      .eq("id", item.id);

    if (!error) fetchData();
  };

  if (loading) return <div className="p-6">লোড হচ্ছে...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">কুইক প্যাকেজ হাইলাইট</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" /> নতুন যোগ করুন
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "এডিট করুন" : "নতুন যোগ করুন"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>আইকন</Label>
                  <Select value={formData.icon_name} onValueChange={(v) => setFormData({ ...formData, icon_name: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value}>{icon.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>লিংক</Label>
                  <Input
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="#hajj, #umrah, etc."
                  />
                </div>
              </div>
              <div>
                <Label>শিরোনাম</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="প্যাকেজ শিরোনাম"
                />
              </div>
              <div>
                <Label>বিবরণ</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="সংক্ষিপ্ত বিবরণ"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>মূল্য (টাকা)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>মূল্য লেবেল (ঐচ্ছিক)</Label>
                  <Input
                    value={formData.price_label}
                    onChange={(e) => setFormData({ ...formData, price_label: e.target.value })}
                    placeholder="যেমন: লটারি ফ্রি"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>গ্রেডিয়েন্ট ফ্রম</Label>
                  <Input
                    value={formData.gradient_from}
                    onChange={(e) => setFormData({ ...formData, gradient_from: e.target.value })}
                    placeholder="primary, accent, etc."
                  />
                </div>
                <div>
                  <Label>গ্রেডিয়েন্ট টু</Label>
                  <Input
                    value={formData.gradient_to}
                    onChange={(e) => setFormData({ ...formData, gradient_to: e.target.value })}
                    placeholder="emerald-dark, gold, etc."
                  />
                </div>
              </div>
              <div>
                <Label>আইকন ব্যাকগ্রাউন্ড</Label>
                <Input
                  value={formData.icon_bg}
                  onChange={(e) => setFormData({ ...formData, icon_bg: e.target.value })}
                  placeholder="bg-primary/10, bg-accent/10"
                />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label>ফিচার্ড</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>সক্রিয়</Label>
                </div>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                <Save className="w-4 h-4 mr-2" /> সেভ করুন
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Section Settings */}
      {settings && (
        <Card>
          <CardHeader>
            <CardTitle>সেকশন সেটিংস</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>শিরোনাম</Label>
                <Input
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                />
              </div>
              <div>
                <Label>সাবটাইটেল</Label>
                <Input
                  value={settings.subtitle}
                  onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.is_active}
                  onCheckedChange={(checked) => setSettings({ ...settings, is_active: checked })}
                />
                <Label>সেকশন সক্রিয়</Label>
              </div>
              <Button onClick={handleSaveSettings}>
                <Save className="w-4 h-4 mr-2" /> সেটিংস সেভ করুন
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle>প্যাকেজ তালিকা</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-4 border rounded-lg ${!item.is_active ? 'opacity-50' : ''}`}
              >
                <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.title}</span>
                    {item.is_featured && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{item.description}</div>
                  <div className="text-sm text-primary font-medium mt-1">
                    {item.price_label || formatCurrency(item.price)}
                  </div>
                </div>
                <Switch
                  checked={item.is_active}
                  onCheckedChange={() => handleToggleActive(item)}
                />
                <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminQuickPackages;
