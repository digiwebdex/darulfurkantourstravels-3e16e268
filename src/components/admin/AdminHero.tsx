import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ImageUpload from "./ImageUpload";
import { useImageUpload } from "@/hooks/useImageUpload";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  background_image_url: string;
  order_index: number;
  is_active: boolean;
}

const defaultSlide: Omit<HeroSlide, "id"> = {
  title: "New Slide",
  subtitle: "",
  background_image_url: "",
  order_index: 0,
  is_active: true,
};

const AdminHero = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [openSlides, setOpenSlides] = useState<Set<string>>(new Set());
  const { uploadImage, uploading } = useImageUpload({
    bucket: "admin-uploads",
    folder: "hero-banners",
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    const { data, error } = await supabase
      .from("hero_content")
      .select("*")
      .order("order_index", { ascending: true });
    
    if (!error && data) {
      const formattedSlides = data.map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle || "",
        background_image_url: item.background_image_url || "",
        order_index: item.order_index || 0,
        is_active: item.is_active,
      }));
      setSlides(formattedSlides);
      if (formattedSlides.length > 0) {
        setOpenSlides(new Set([formattedSlides[0].id]));
      }
    }
    setLoading(false);
  };

  const handleSave = async (slide: HeroSlide) => {
    setSaving(slide.id);
    
    const { error } = await supabase
      .from("hero_content")
      .update({
        title: slide.title,
        subtitle: slide.subtitle,
        background_image_url: slide.background_image_url,
        order_index: slide.order_index,
        is_active: slide.is_active,
      })
      .eq("id", slide.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Slide updated successfully" });
    }
    setSaving(null);
  };

  const handleAddSlide = async () => {
    const newOrderIndex = slides.length > 0 ? Math.max(...slides.map(s => s.order_index)) + 1 : 0;
    
    const { data, error } = await supabase
      .from("hero_content")
      .insert({
        ...defaultSlide,
        order_index: newOrderIndex,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (data) {
      const newSlide: HeroSlide = {
        id: data.id,
        ...defaultSlide,
        order_index: newOrderIndex,
      };
      setSlides([...slides, newSlide]);
      setOpenSlides(new Set([...openSlides, data.id]));
      toast({ title: "Success", description: "New slide added" });
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (slides.length <= 1) {
      toast({ title: "Error", description: "You must have at least one slide", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from("hero_content")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSlides(slides.filter(s => s.id !== id));
      toast({ title: "Success", description: "Slide deleted" });
    }
  };

  const updateSlide = (id: string, updates: Partial<HeroSlide>) => {
    setSlides(slides.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const moveSlide = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;

    const newSlides = [...slides];
    [newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]];
    
    newSlides[index].order_index = index;
    newSlides[newIndex].order_index = newIndex;
    
    setSlides(newSlides);

    await Promise.all([
      supabase.from("hero_content").update({ order_index: index }).eq("id", newSlides[index].id),
      supabase.from("hero_content").update({ order_index: newIndex }).eq("id", newSlides[newIndex].id),
    ]);
  };

  const toggleSlide = (id: string) => {
    const newOpen = new Set(openSlides);
    if (newOpen.has(id)) {
      newOpen.delete(id);
    } else {
      newOpen.add(id);
    }
    setOpenSlides(newOpen);
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Hero Banner Slider</CardTitle>
            <CardDescription>Manage your homepage hero banners</CardDescription>
          </div>
          <Button onClick={handleAddSlide} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Slide
          </Button>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {slides.map((slide, index) => (
          <Card key={slide.id} className="overflow-hidden">
            <Collapsible open={openSlides.has(slide.id)} onOpenChange={() => toggleSlide(slide.id)}>
              <div className="flex items-center gap-4 p-4 bg-muted/50">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => moveSlide(index, "up")}
                    disabled={index === 0}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => moveSlide(index, "down")}
                    disabled={index === slides.length - 1}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold">{slide.title}</span>
                    {!slide.is_active && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/20 text-destructive">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{slide.subtitle}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={slide.is_active}
                    onCheckedChange={(checked) => updateSlide(slide.id, { is_active: checked })}
                  />
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon">
                      {openSlides.has(slide.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>

              <CollapsibleContent>
                <CardContent className="pt-6 space-y-6">
                  <div>
                    <Label>Background Image</Label>
                    <ImageUpload
                      value={slide.background_image_url}
                      onChange={(url) => updateSlide(slide.id, { background_image_url: url })}
                      onUpload={uploadImage}
                      uploading={uploading}
                      label=""
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={slide.title}
                        onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
                        placeholder="Your Sacred Journey"
                      />
                    </div>
                    <div>
                      <Label>Subtitle</Label>
                      <Input
                        value={slide.subtitle}
                        onChange={(e) => updateSlide(slide.id, { subtitle: e.target.value })}
                        placeholder="Begins Here"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={() => handleSave(slide)} disabled={saving === slide.id} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      {saving === slide.id ? "Saving..." : "Save Slide"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteSlide(slide.id)}
                      disabled={slides.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminHero;
