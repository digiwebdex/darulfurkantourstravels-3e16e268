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
import { Plus, Pencil, Trash2, GripVertical, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WhyChooseItem {
  id: string;
  icon_name: string;
  title: string;
  description: string;
  order_index: number;
  is_active: boolean;
}

interface WhyChooseSettings {
  id: string;
  badge_text: string;
  title: string;
  subtitle: string;
  is_active: boolean;
}

const iconOptions = [
  { value: "Shield", label: "Shield (নিরাপত্তা)" },
  { value: "Users", label: "Users (ব্যবহারকারী)" },
  { value: "Clock", label: "Clock (সময়)" },
  { value: "FileCheck", label: "FileCheck (ডকুমেন্ট)" },
  { value: "Building", label: "Building (বিল্ডিং)" },
  { value: "HeartHandshake", label: "HeartHandshake (চুক্তি)" },
  { value: "Award", label: "Award (পুরস্কার)" },
  { value: "Star", label: "Star (তারা)" },
  { value: "CheckCircle", label: "CheckCircle (চেক)" },
  { value: "Zap", label: "Zap (দ্রুত)" },
  { value: "Globe", label: "Globe (গ্লোব)" },
  { value: "Phone", label: "Phone (ফোন)" },
];

const AdminWhyChooseUs = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<WhyChooseItem[]>([]);
  const [settings, setSettings] = useState<WhyChooseSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WhyChooseItem | null>(null);
  const [formData, setFormData] = useState({
    icon_name: "Shield",
    title: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, settingsRes] = await Promise.all([
        supabase.from("why_choose_us").select("*").order("order_index"),
        supabase.from("why_choose_settings").select("*").single(),
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
      .from("why_choose_settings")
      .update({
        badge_text: settings.badge_text,
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

    if (editingItem) {
      const { error } = await supabase
        .from("why_choose_us")
        .update({
          icon_name: formData.icon_name,
          title: formData.title,
          description: formData.description,
          is_active: formData.is_active,
        })
        .eq("id", editingItem.id);

      if (error) {
        toast({ title: "আপডেট করতে সমস্যা হয়েছে", variant: "destructive" });
      } else {
        toast({ title: "আইটেম আপডেট হয়েছে" });
        fetchData();
      }
    } else {
      const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.order_index)) : 0;
      const { error } = await supabase.from("why_choose_us").insert({
        icon_name: formData.icon_name,
        title: formData.title,
        description: formData.description,
        is_active: formData.is_active,
        order_index: maxOrder + 1,
      });

      if (error) {
        toast({ title: "যোগ করতে সমস্যা হয়েছে", variant: "destructive" });
      } else {
        toast({ title: "নতুন আইটেম যোগ হয়েছে" });
        fetchData();
      }
    }

    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({ icon_name: "Shield", title: "", description: "", is_active: true });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত?")) return;

    const { error } = await supabase.from("why_choose_us").delete().eq("id", id);
    if (error) {
      toast({ title: "মুছে ফেলতে সমস্যা হয়েছে", variant: "destructive" });
    } else {
      toast({ title: "আইটেম মুছে ফেলা হয়েছে" });
      fetchData();
    }
  };

  const handleEdit = (item: WhyChooseItem) => {
    setEditingItem(item);
    setFormData({
      icon_name: item.icon_name,
      title: item.title,
      description: item.description,
      is_active: item.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (item: WhyChooseItem) => {
    const { error } = await supabase
      .from("why_choose_us")
      .update({ is_active: !item.is_active })
      .eq("id", item.id);

    if (!error) fetchData();
  };

  if (loading) return <div className="p-6">লোড হচ্ছে...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">কেন আমাদের বেছে নেবেন</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingItem(null);
              setFormData({ icon_name: "Shield", title: "", description: "", is_active: true });
            }}>
              <Plus className="w-4 h-4 mr-2" /> নতুন যোগ করুন
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "এডিট করুন" : "নতুন যোগ করুন"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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
                <Label>শিরোনাম</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="শিরোনাম লিখুন"
                />
              </div>
              <div>
                <Label>বিবরণ</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="বিবরণ লিখুন"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>সক্রিয়</Label>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>ব্যাজ টেক্সট</Label>
                <Input
                  value={settings.badge_text}
                  onChange={(e) => setSettings({ ...settings, badge_text: e.target.value })}
                />
              </div>
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
          <CardTitle>আইটেম তালিকা</CardTitle>
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
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-muted-foreground">{item.description}</div>
                  <div className="text-xs text-muted-foreground mt-1">আইকন: {item.icon_name}</div>
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

export default AdminWhyChooseUs;
