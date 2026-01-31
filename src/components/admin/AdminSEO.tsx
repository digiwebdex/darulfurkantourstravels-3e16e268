import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Search, Globe, Image } from "lucide-react";
import ImageUpload from "./ImageUpload";
import { useImageUpload } from "@/hooks/useImageUpload";

interface SEOSettings {
  id: string;
  page_key: string;
  meta_title: string;
  meta_description: string;
  og_image_url: string;
  og_title: string;
  og_description: string;
  canonical_url: string;
  robots: string;
}

const defaultSEO: SEOSettings = {
  id: "",
  page_key: "homepage",
  meta_title: "",
  meta_description: "",
  og_image_url: "",
  og_title: "",
  og_description: "",
  canonical_url: "",
  robots: "index, follow",
};

const AdminSEO = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seoSettings, setSeoSettings] = useState<SEOSettings>(defaultSEO);
  const { uploadImage, uploading } = useImageUpload({
    bucket: "admin-uploads",
    folder: "seo",
  });

  useEffect(() => {
    fetchSEOSettings();
  }, []);

  const fetchSEOSettings = async () => {
    const { data, error } = await supabase
      .from("seo_settings" as any)
      .select("*")
      .eq("page_key", "homepage")
      .maybeSingle();

    if (data) {
      const d = data as any;
      setSeoSettings({
        id: d.id,
        page_key: d.page_key,
        meta_title: d.meta_title || "",
        meta_description: d.meta_description || "",
        og_image_url: d.og_image_url || "",
        og_title: d.og_title || "",
        og_description: d.og_description || "",
        canonical_url: d.canonical_url || "",
        robots: d.robots || "index, follow",
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const payload = {
      meta_title: seoSettings.meta_title,
      meta_description: seoSettings.meta_description,
      og_image_url: seoSettings.og_image_url,
      og_title: seoSettings.og_title,
      og_description: seoSettings.og_description,
      canonical_url: seoSettings.canonical_url,
      robots: seoSettings.robots,
    };

    if (seoSettings.id) {
      const { error } = await supabase
        .from("seo_settings" as any)
        .update(payload)
        .eq("id", seoSettings.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "SEO settings saved successfully" });
      }
    } else {
      const { error } = await supabase
        .from("seo_settings" as any)
        .insert({ ...payload, page_key: "homepage" });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "SEO settings created successfully" });
        fetchSEOSettings();
      }
    }

    setSaving(false);
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            SEO Settings
          </CardTitle>
          <CardDescription>
            Manage meta tags and Open Graph settings for better search engine visibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Meta Tags */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Meta Tags
            </h3>
            <div>
              <label className="text-sm font-medium">Meta Title</label>
              <Input
                value={seoSettings.meta_title}
                onChange={(e) => setSeoSettings({ ...seoSettings, meta_title: e.target.value })}
                placeholder="দারুল ফুরকান ট্যুরস | হজ্জ ও উমরাহ প্যাকেজ"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {seoSettings.meta_title.length}/60 characters
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Meta Description</label>
              <Textarea
                value={seoSettings.meta_description}
                onChange={(e) => setSeoSettings({ ...seoSettings, meta_description: e.target.value })}
                placeholder="বাংলাদেশের সরকার অনুমোদিত হজ্জ ও উমরাহ এজেন্সি..."
                maxLength={160}
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {seoSettings.meta_description.length}/160 characters
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Robots</label>
              <Input
                value={seoSettings.robots}
                onChange={(e) => setSeoSettings({ ...seoSettings, robots: e.target.value })}
                placeholder="index, follow"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Canonical URL</label>
              <Input
                value={seoSettings.canonical_url}
                onChange={(e) => setSeoSettings({ ...seoSettings, canonical_url: e.target.value })}
                placeholder="https://darulfurkantourstravels.lovable.app"
              />
            </div>
          </div>

          {/* Open Graph */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold flex items-center gap-2">
              <Image className="w-4 h-4" />
              Open Graph (Social Sharing)
            </h3>
            <div>
              <label className="text-sm font-medium">OG Title</label>
              <Input
                value={seoSettings.og_title}
                onChange={(e) => setSeoSettings({ ...seoSettings, og_title: e.target.value })}
                placeholder="দারুল ফুরকান ট্যুরস এন্ড ট্রাভেলস"
              />
            </div>
            <div>
              <label className="text-sm font-medium">OG Description</label>
              <Textarea
                value={seoSettings.og_description}
                onChange={(e) => setSeoSettings({ ...seoSettings, og_description: e.target.value })}
                placeholder="হজ্জ ও উমরাহ প্যাকেজ ২০২৬..."
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">OG Image (1200x630 recommended)</label>
              <ImageUpload
                value={seoSettings.og_image_url}
                onChange={(url) => setSeoSettings({ ...seoSettings, og_image_url: url })}
                onUpload={uploadImage}
                uploading={uploading}
                label=""
                placeholder="https://example.com/og-image.jpg"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold">Search Result Preview</h3>
            <div className="p-4 border rounded-lg bg-muted/30">
              <p className="text-primary text-lg hover:underline cursor-pointer">
                {seoSettings.meta_title || "Page Title"}
              </p>
              <p className="text-secondary text-sm">
                {seoSettings.canonical_url || "https://darulfurkantourstravels.lovable.app"}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {seoSettings.meta_description || "Page description will appear here..."}
              </p>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save SEO Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSEO;
