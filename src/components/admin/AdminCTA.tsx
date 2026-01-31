import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Eye, Phone, ArrowRight } from "lucide-react";

interface CTAContent {
  id: string;
  title: string;
  subtitle: string;
  primary_button_text: string;
  primary_button_link: string;
  secondary_button_text: string;
  secondary_button_link: string;
  show_primary_button: boolean;
  show_secondary_button: boolean;
  is_active: boolean;
}

const AdminCTA = () => {
  const { toast } = useToast();
  const [content, setContent] = useState<CTAContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("cta_content")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching CTA content:", error);
      }

      if (data) {
        setContent(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;

    setSaving(true);
    const { error } = await supabase
      .from("cta_content")
      .update({
        title: content.title,
        subtitle: content.subtitle,
        primary_button_text: content.primary_button_text,
        primary_button_link: content.primary_button_link,
        secondary_button_text: content.secondary_button_text,
        secondary_button_link: content.secondary_button_link,
        show_primary_button: content.show_primary_button,
        show_secondary_button: content.show_secondary_button,
        is_active: content.is_active,
      })
      .eq("id", content.id);

    setSaving(false);

    if (error) {
      toast({ title: "সেভ করতে সমস্যা হয়েছে", variant: "destructive" });
    } else {
      toast({ title: "সেভ হয়েছে" });
    }
  };

  if (loading) return <div className="p-6">লোড হচ্ছে...</div>;

  if (!content) return <div className="p-6">কোনো ডাটা পাওয়া যায়নি</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">কল টু অ্যাকশন (CTA) সেকশন</h2>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
        </Button>
      </div>

      {/* Preview */}
      <Card className="bg-gradient-to-r from-primary to-emerald-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" /> প্রিভিউ
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <h3 className="text-2xl md:text-3xl font-bold mb-3">{content.title}</h3>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">{content.subtitle}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            {content.show_primary_button && (
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                {content.primary_button_text}
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            {content.show_secondary_button && (
              <Button variant="outline" className="border-white text-white hover:bg-white/10 gap-2">
                <Phone className="w-4 h-4" />
                {content.secondary_button_text}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>কন্টেন্ট সেটিংস</CardTitle>
          <CardDescription>CTA সেকশনের টেক্সট এবং বাটন কাস্টমাইজ করুন</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>শিরোনাম</Label>
              <Input
                value={content.title}
                onChange={(e) => setContent({ ...content, title: e.target.value })}
                placeholder="মূল শিরোনাম"
              />
            </div>
            <div>
              <Label>সাবটাইটেল</Label>
              <Textarea
                value={content.subtitle}
                onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
                placeholder="বিস্তারিত বিবরণ"
                rows={3}
              />
            </div>
          </div>

          {/* Primary Button */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">প্রাইমারি বাটন</h4>
              <div className="flex items-center gap-2">
                <Switch
                  checked={content.show_primary_button}
                  onCheckedChange={(checked) => setContent({ ...content, show_primary_button: checked })}
                />
                <Label>দেখান</Label>
              </div>
            </div>
            {content.show_primary_button && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>বাটন টেক্সট</Label>
                  <Input
                    value={content.primary_button_text}
                    onChange={(e) => setContent({ ...content, primary_button_text: e.target.value })}
                    placeholder="এখনই বুকিং করুন"
                  />
                </div>
                <div>
                  <Label>বাটন লিংক</Label>
                  <Input
                    value={content.primary_button_link}
                    onChange={(e) => setContent({ ...content, primary_button_link: e.target.value })}
                    placeholder="#packages"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Secondary Button */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">সেকেন্ডারি বাটন</h4>
              <div className="flex items-center gap-2">
                <Switch
                  checked={content.show_secondary_button}
                  onCheckedChange={(checked) => setContent({ ...content, show_secondary_button: checked })}
                />
                <Label>দেখান</Label>
              </div>
            </div>
            {content.show_secondary_button && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>বাটন টেক্সট</Label>
                  <Input
                    value={content.secondary_button_text}
                    onChange={(e) => setContent({ ...content, secondary_button_text: e.target.value })}
                    placeholder="কল করুন"
                  />
                </div>
                <div>
                  <Label>বাটন লিংক</Label>
                  <Input
                    value={content.secondary_button_link}
                    onChange={(e) => setContent({ ...content, secondary_button_link: e.target.value })}
                    placeholder="tel:+8801339080532"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section Active */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <Switch
              checked={content.is_active}
              onCheckedChange={(checked) => setContent({ ...content, is_active: checked })}
            />
            <Label>সেকশন সক্রিয় (ওয়েবসাইটে দেখাবে)</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCTA;
