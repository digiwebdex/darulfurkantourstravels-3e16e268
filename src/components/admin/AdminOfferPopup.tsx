import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, Eye, Gift, Loader2 } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";

interface PopupSettings {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  button_text: string | null;
  button_link: string | null;
  image_url: string | null;
  background_color: string | null;
  text_color: string | null;
  is_enabled: boolean;
  show_on_every_visit: boolean;
  delay_seconds: number | null;
}

const AdminOfferPopup = () => {
  const [settings, setSettings] = useState<PopupSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const { uploadImage, uploading } = useImageUpload({ bucket: "admin-uploads", folder: "offer-popup" });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("offer_popup_settings")
        .select("*")
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
      } else {
        // Create default settings if none exist
        const { data: newData, error: insertError } = await supabase
          .from("offer_popup_settings")
          .insert({
            title: "🕋 Exclusive Hajj & Umrah Offer!",
            subtitle: "✨ Limited Time Only ✨",
            description: "Book your sacred journey now and enjoy special discounts on our premium packages.",
            button_text: "View Packages",
            button_link: "#hajj-packages",
            is_enabled: false,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newData);
      }
    } catch (error) {
      console.error("Error fetching popup settings:", error);
      toast({
        title: "Error",
        description: "Failed to load popup settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("offer_popup_settings")
        .update({
          title: settings.title,
          subtitle: settings.subtitle,
          description: settings.description,
          button_text: settings.button_text,
          button_link: settings.button_link,
          image_url: settings.image_url,
          background_color: settings.background_color,
          text_color: settings.text_color,
          is_enabled: settings.is_enabled,
          show_on_every_visit: settings.show_on_every_visit,
          delay_seconds: settings.delay_seconds,
        })
        .eq("id", settings.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Popup settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving popup settings:", error);
      toast({
        title: "Error",
        description: "Failed to save popup settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof PopupSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Offer Popup</h2>
          <p className="text-muted-foreground">
            Configure the promotional popup that appears when visitors enter your website
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <div className="space-y-6">
          {/* Enable/Disable Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Popup Status
              </CardTitle>
              <CardDescription>
                Enable or disable the offer popup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Popup</Label>
                  <p className="text-sm text-muted-foreground">
                    Show popup to website visitors
                  </p>
                </div>
                <Switch
                  checked={settings.is_enabled}
                  onCheckedChange={(checked) => updateField("is_enabled", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show on Every Visit</Label>
                  <p className="text-sm text-muted-foreground">
                    If disabled, shows once per day
                  </p>
                </div>
                <Switch
                  checked={settings.show_on_every_visit}
                  onCheckedChange={(checked) => updateField("show_on_every_visit", checked)}
                />
              </div>
              <div>
                <Label>Delay (seconds)</Label>
                <Input
                  type="number"
                  min="0"
                  max="60"
                  value={settings.delay_seconds || 2}
                  onChange={(e) => updateField("delay_seconds", parseInt(e.target.value) || 2)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Delay before showing the popup
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>
                Configure the popup text and button
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={settings.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Enter popup title"
                />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input
                  value={settings.subtitle || ""}
                  onChange={(e) => updateField("subtitle", e.target.value)}
                  placeholder="Enter subtitle (optional)"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={settings.description || ""}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Button Text</Label>
                  <Input
                    value={settings.button_text || ""}
                    onChange={(e) => updateField("button_text", e.target.value)}
                    placeholder="e.g., View Packages"
                  />
                </div>
                <div>
                  <Label>Button Link</Label>
                  <Input
                    value={settings.button_link || ""}
                    onChange={(e) => updateField("button_link", e.target.value)}
                    placeholder="e.g., #hajj-packages"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize colors and image
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.background_color || "#10b981"}
                      onChange={(e) => updateField("background_color", e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={settings.background_color || "#10b981"}
                      onChange={(e) => updateField("background_color", e.target.value)}
                      placeholder="#10b981"
                    />
                  </div>
                </div>
                <div>
                  <Label>Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.text_color || "#ffffff"}
                      onChange={(e) => updateField("text_color", e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={settings.text_color || "#ffffff"}
                      onChange={(e) => updateField("text_color", e.target.value)}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label>Banner Image (Optional)</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={settings.image_url || ""}
                      onChange={(e) => updateField("image_url", e.target.value)}
                      placeholder="Enter image URL or upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      onClick={async () => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = async (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            const url = await uploadImage(file);
                            if (url) updateField("image_url", url);
                          }
                        };
                        input.click();
                      }}
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload"}
                    </Button>
                  </div>
                  {settings.image_url && (
                    <img src={settings.image_url} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
        {showPreview && (
          <div className="lg:sticky lg:top-4">
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>
                  See how your popup will look
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="rounded-xl overflow-hidden shadow-lg"
                  style={{
                    backgroundColor: settings.background_color || "#10b981",
                    color: settings.text_color || "#ffffff",
                  }}
                >
                  <div className="relative p-6">
                    {/* Decorative */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 left-0 w-full h-full geometric-pattern" />
                    </div>

                    <div className="relative space-y-4">
                      {/* Icon */}
                      <div className="flex justify-center">
                        <div className="p-3 bg-white/20 rounded-full">
                          <Gift className="w-8 h-8" />
                        </div>
                      </div>

                      {/* Image */}
                      {settings.image_url && (
                        <div className="rounded-lg overflow-hidden">
                          <img
                            src={settings.image_url}
                            alt="Preview"
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="text-center space-y-2">
                        {settings.subtitle && (
                          <p className="text-sm opacity-90">{settings.subtitle}</p>
                        )}
                        <h3 className="text-xl font-bold">{settings.title}</h3>
                        {settings.description && (
                          <p className="text-sm opacity-90">{settings.description}</p>
                        )}
                        {settings.button_text && (
                          <div className="pt-2">
                            <button className="bg-white text-primary px-6 py-2 rounded-full font-semibold text-sm">
                              {settings.button_text}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOfferPopup;
