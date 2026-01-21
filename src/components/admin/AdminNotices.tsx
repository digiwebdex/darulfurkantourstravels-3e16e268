import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Loader2,
  Pencil,
  Trash2,
  Bell,
  Pin,
  ExternalLink,
  FileText,
  Upload,
  X
} from "lucide-react";

interface Notice {
  id: string;
  title: string;
  content: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  external_link: string | null;
  external_link_text: string | null;
  priority: string;
  notice_type: string;
  is_active: boolean;
  is_pinned: boolean;
  start_date: string | null;
  end_date: string | null;
  order_index: number;
  created_at: string;
}

const emptyNotice: Omit<Notice, "id" | "created_at"> = {
  title: "",
  content: "",
  attachment_url: null,
  attachment_name: null,
  external_link: null,
  external_link_text: "Learn More",
  priority: "normal",
  notice_type: "general",
  is_active: true,
  is_pinned: false,
  start_date: null,
  end_date: null,
  order_index: 0
};

// Attachment upload component
const AttachmentUpload = ({ 
  value, 
  attachmentName, 
  onChange 
}: { 
  value: string | null; 
  attachmentName: string | null;
  onChange: (url: string | null, name: string | null) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `notices/${fileName}`;

      const { error } = await supabase.storage
        .from("admin-uploads")
        .upload(filePath, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("admin-uploads")
        .getPublicUrl(filePath);

      onChange(urlData.publicUrl, file.name);
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Attachment (PDF, Image, Document)</Label>
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="gap-2"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload File
        </Button>
        {value && (
          <>
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate max-w-[200px]">
              {attachmentName || "View file"}
            </a>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onChange(null, null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

const AdminNotices = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [formData, setFormData] = useState<Omit<Notice, "id" | "created_at">>(emptyNotice);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotices(data || []);
    } catch (error) {
      console.error("Error fetching notices:", error);
      toast.error("Failed to load notices");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    try {
      if (editingNotice) {
        const { error } = await supabase
          .from("notices")
          .update(formData)
          .eq("id", editingNotice.id);
        if (error) throw error;
        toast.success("Notice updated successfully");
      } else {
        const { error } = await supabase
          .from("notices")
          .insert([formData]);
        if (error) throw error;
        toast.success("Notice created successfully");
      }
      
      setDialogOpen(false);
      setEditingNotice(null);
      setFormData(emptyNotice);
      fetchNotices();
    } catch (error) {
      console.error("Error saving notice:", error);
      toast.error("Failed to save notice");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      attachment_url: notice.attachment_url,
      attachment_name: notice.attachment_name,
      external_link: notice.external_link,
      external_link_text: notice.external_link_text,
      priority: notice.priority,
      notice_type: notice.notice_type,
      is_active: notice.is_active,
      is_pinned: notice.is_pinned,
      start_date: notice.start_date,
      end_date: notice.end_date,
      order_index: notice.order_index
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;

    try {
      const { error } = await supabase.from("notices").delete().eq("id", id);
      if (error) throw error;
      toast.success("Notice deleted");
      fetchNotices();
    } catch (error) {
      console.error("Error deleting notice:", error);
      toast.error("Failed to delete notice");
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("notices")
        .update({ is_active: !isActive })
        .eq("id", id);
      if (error) throw error;
      fetchNotices();
    } catch (error) {
      console.error("Error toggling notice:", error);
    }
  };

  const togglePinned = async (id: string, isPinned: boolean) => {
    try {
      const { error } = await supabase
        .from("notices")
        .update({ is_pinned: !isPinned })
        .eq("id", id);
      if (error) throw error;
      fetchNotices();
    } catch (error) {
      console.error("Error toggling pin:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "default";
      case "normal": return "secondary";
      default: return "outline";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notice Board Management
            </CardTitle>
            <CardDescription>
              Create and manage announcements with attachments and links
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingNotice(null);
              setFormData(emptyNotice);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Notice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingNotice ? "Edit Notice" : "Create New Notice"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Notice title..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content || ""}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Notice content..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={formData.notice_type}
                      onValueChange={(value) => setFormData({ ...formData, notice_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="hajj">Hajj</SelectItem>
                        <SelectItem value="umrah">Umrah</SelectItem>
                        <SelectItem value="visa">Visa</SelectItem>
                        <SelectItem value="offer">Special Offer</SelectItem>
                        <SelectItem value="important">Important</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>External Link</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={formData.external_link || ""}
                      onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
                      placeholder="https://..."
                    />
                    <Input
                      value={formData.external_link_text || ""}
                      onChange={(e) => setFormData({ ...formData, external_link_text: e.target.value })}
                      placeholder="Link text (e.g., Learn More)"
                    />
                  </div>
                </div>

                <AttachmentUpload
                  value={formData.attachment_url}
                  attachmentName={formData.attachment_name}
                  onChange={(url, name) => setFormData({ ...formData, attachment_url: url, attachment_name: name })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date (Optional)</Label>
                    <Input
                      type="datetime-local"
                      value={formData.start_date ? formData.start_date.slice(0, 16) : ""}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date (Optional)</Label>
                    <Input
                      type="datetime-local"
                      value={formData.end_date ? formData.end_date.slice(0, 16) : ""}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label>Active</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_pinned}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_pinned: checked })}
                    />
                    <Label>Pinned</Label>
                  </div>
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingNotice ? "Update Notice" : "Create Notice"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {notices.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No notices yet. Create your first announcement!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notices.map((notice, index) => (
                <motion.div
                  key={notice.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                    notice.is_active ? "bg-card" : "bg-muted/50 opacity-60"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {notice.is_pinned && (
                        <Badge variant="secondary" className="gap-1">
                          <Pin className="h-3 w-3" /> Pinned
                        </Badge>
                      )}
                      <Badge variant={getPriorityColor(notice.priority) as any}>
                        {notice.priority.charAt(0).toUpperCase() + notice.priority.slice(1)}
                      </Badge>
                      <Badge variant="outline">{notice.notice_type}</Badge>
                      {notice.external_link && (
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      )}
                      {notice.attachment_url && (
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <h4 className="font-medium truncate">{notice.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(notice.created_at), "dd MMM yyyy, HH:mm")}
                      {notice.end_date && (
                        <span className="ml-2">
                          • Expires: {format(new Date(notice.end_date), "dd MMM yyyy")}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePinned(notice.id, notice.is_pinned)}
                      className={notice.is_pinned ? "text-primary" : "text-muted-foreground"}
                    >
                      <Pin className="h-4 w-4" />
                    </Button>
                    <Switch
                      checked={notice.is_active}
                      onCheckedChange={() => toggleActive(notice.id, notice.is_active)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(notice)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(notice.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminNotices;
