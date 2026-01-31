import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Type, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SectionHeader {
  id: string;
  section_key: string;
  badge_text: string;
  title: string;
  subtitle: string;
  arabic_text: string;
  description: string;
  is_active: boolean;
}

const sectionLabels: Record<string, string> = {
  hero: "হিরো সেকশন",
  services: "সেবাসমূহ",
  hajj_packages: "হজ্জ প্যাকেজ",
  umrah_packages: "উমরাহ প্যাকেজ",
  testimonials: "টেস্টিমোনিয়াল",
  team: "আমাদের টিম",
  faq: "সচরাচর জিজ্ঞাসা",
  gallery: "গ্যালারি",
  contact: "যোগাযোগ",
  notices: "নোটিশ বোর্ড",
};

const AdminSectionHeaders = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [headers, setHeaders] = useState<SectionHeader[]>([]);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["hero"]));

  useEffect(() => {
    fetchHeaders();
  }, []);

  const fetchHeaders = async () => {
    const { data, error } = await supabase
      .from("section_headers" as any)
      .select("*")
      .order("section_key");

    if (data) {
      setHeaders((data as any[]).map((h) => ({
        id: h.id,
        section_key: h.section_key,
        badge_text: h.badge_text || "",
        title: h.title,
        subtitle: h.subtitle || "",
        arabic_text: h.arabic_text || "",
        description: h.description || "",
        is_active: h.is_active,
      })));
    }
    setLoading(false);
  };

  const handleSave = async (header: SectionHeader) => {
    setSaving(header.id);

    const { error } = await supabase
      .from("section_headers" as any)
      .update({
        badge_text: header.badge_text,
        title: header.title,
        subtitle: header.subtitle,
        arabic_text: header.arabic_text,
        description: header.description,
        is_active: header.is_active,
      })
      .eq("id", header.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `${sectionLabels[header.section_key] || header.section_key} updated` });
    }

    setSaving(null);
  };

  const updateHeader = (id: string, field: keyof SectionHeader, value: string | boolean) => {
    setHeaders(headers.map((h) => (h.id === id ? { ...h, [field]: value } : h)));
  };

  const toggleSection = (key: string) => {
    const newOpen = new Set(openSections);
    if (newOpen.has(key)) {
      newOpen.delete(key);
    } else {
      newOpen.add(key);
    }
    setOpenSections(newOpen);
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
            <Type className="w-5 h-5" />
            Section Headers
          </CardTitle>
          <CardDescription>
            Manage titles, subtitles, and descriptions for all homepage sections
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {headers.map((header) => (
          <Card key={header.id}>
            <Collapsible
              open={openSections.has(header.section_key)}
              onOpenChange={() => toggleSection(header.section_key)}
            >
              <div className="flex items-center justify-between p-4 bg-muted/30">
                <div>
                  <h3 className="font-semibold">{sectionLabels[header.section_key] || header.section_key}</h3>
                  <p className="text-sm text-muted-foreground">{header.title}</p>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon">
                    {openSections.has(header.section_key) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Badge Text (Subtitle)</label>
                      <Input
                        value={header.badge_text}
                        onChange={(e) => updateHeader(header.id, "badge_text", e.target.value)}
                        placeholder="Badge text..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Main Title</label>
                      <Input
                        value={header.title}
                        onChange={(e) => updateHeader(header.id, "title", e.target.value)}
                        placeholder="Section title..."
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Subtitle</label>
                      <Input
                        value={header.subtitle}
                        onChange={(e) => updateHeader(header.id, "subtitle", e.target.value)}
                        placeholder="Optional subtitle..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Arabic Text</label>
                      <Input
                        value={header.arabic_text}
                        onChange={(e) => updateHeader(header.id, "arabic_text", e.target.value)}
                        placeholder="Arabic text..."
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={header.description}
                      onChange={(e) => updateHeader(header.id, "description", e.target.value)}
                      placeholder="Section description..."
                      rows={2}
                    />
                  </div>

                  <Button
                    onClick={() => handleSave(header)}
                    disabled={saving === header.id}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving === header.id ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}

        {headers.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Type className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No section headers found. They will be created automatically.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminSectionHeaders;
