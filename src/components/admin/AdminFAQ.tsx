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
import { Plus, Edit, Trash2 } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order_index: number;
  is_active: boolean;
}

const AdminFAQ = () => {
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
  const [formData, setFormData] = useState({ question: "", answer: "" });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    const { data, error } = await supabase.from("faq_items").select("*").order("order_index");
    if (!error && data) setFaqs(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      const { error } = await supabase.from("faq_items").update(formData).eq("id", editingItem.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Success", description: "FAQ updated" });
    } else {
      const maxOrder = Math.max(...faqs.map(f => f.order_index), 0);
      const { error } = await supabase.from("faq_items").insert({ ...formData, order_index: maxOrder + 1 });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Success", description: "FAQ created" });
    }
    
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({ question: "", answer: "" });
    fetchFaqs();
  };

  const handleEdit = (item: FAQItem) => {
    setEditingItem(item);
    setFormData({ question: item.question, answer: item.answer });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await supabase.from("faq_items").delete().eq("id", id);
    toast({ title: "Success", description: "FAQ deleted" });
    fetchFaqs();
  };

  const toggleActive = async (item: FAQItem) => {
    await supabase.from("faq_items").update({ is_active: !item.is_active }).eq("id", item.id);
    fetchFaqs();
  };

  const moveItem = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= faqs.length) return;

    const updates = [
      { id: faqs[index].id, order_index: faqs[newIndex].order_index },
      { id: faqs[newIndex].id, order_index: faqs[index].order_index },
    ];

    for (const update of updates) {
      await supabase.from("faq_items").update({ order_index: update.order_index }).eq("id", update.id);
    }
    fetchFaqs();
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>FAQ Section</CardTitle>
          <CardDescription>Manage frequently asked questions</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setEditingItem(null); setFormData({ question: "", answer: "" }); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add FAQ</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Question *</label>
                <Input value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium">Answer *</label>
                <Textarea value={formData.answer} onChange={(e) => setFormData({ ...formData, answer: e.target.value })} required rows={5} />
              </div>
              <Button type="submit" className="w-full">{editingItem ? "Update" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Order</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faqs.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItem(index, "up")} disabled={index === 0}>↑</Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItem(index, "down")} disabled={index === faqs.length - 1}>↓</Button>
                  </div>
                </TableCell>
                <TableCell className="font-medium max-w-md truncate">{item.question}</TableCell>
                <TableCell><Switch checked={item.is_active} onCheckedChange={() => toggleActive(item)} /></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {faqs.length === 0 && <p className="text-center text-muted-foreground py-8">No FAQs yet.</p>}
      </CardContent>
    </Card>
  );
};

export default AdminFAQ;
