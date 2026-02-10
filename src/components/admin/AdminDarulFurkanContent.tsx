import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";

interface FlightPackage {
  type: string;
  typeBn: string;
  typeAr: string;
  price: number;
  flightDate: string;
  flightDateBn: string;
  flightDateAr: string;
  highlight: boolean;
}

interface ItikafPackage {
  days: number;
  daysBn: string;
  daysAr: string;
  daysEn: string;
  price: number;
  label: string;
  labelBn: string;
  labelAr: string;
}

interface DarulFurkanData {
  id: string;
  section_badge: string;
  section_title: string;
  section_title_highlight: string;
  section_subtitle: string;
  lottery_title: string;
  lottery_subtitle: string;
  special_offer_label: string;
  offer_dates: string;
  includes_title: string;
  includes_subtitle: string;
  package_inclusions: string[];
  flight_packages: FlightPackage[];
  itikaf_badge: string;
  itikaf_title: string;
  itikaf_packages: ItikafPackage[];
  contact_title: string;
  contact_subtitle: string;
  contact_address: string;
  contact_phones: string[];
  discount_text: string;
  book_now_text: string;
  select_package_text: string;
}

const AdminDarulFurkanContent = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<DarulFurkanData | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data: rows, error } = await supabase
      .from("darul_furkan_content" as any)
      .select("*")
      .limit(1)
      .single();

    if (!error && rows) {
      const row = rows as any;
      setData({
        id: row.id,
        section_badge: row.section_badge || "",
        section_title: row.section_title || "",
        section_title_highlight: row.section_title_highlight || "",
        section_subtitle: row.section_subtitle || "",
        lottery_title: row.lottery_title || "",
        lottery_subtitle: row.lottery_subtitle || "",
        special_offer_label: row.special_offer_label || "",
        offer_dates: row.offer_dates || "",
        includes_title: row.includes_title || "",
        includes_subtitle: row.includes_subtitle || "",
        package_inclusions: (row.package_inclusions as string[]) || [],
        flight_packages: (row.flight_packages as FlightPackage[]) || [],
        itikaf_badge: row.itikaf_badge || "",
        itikaf_title: row.itikaf_title || "",
        itikaf_packages: (row.itikaf_packages as ItikafPackage[]) || [],
        contact_title: row.contact_title || "",
        contact_subtitle: row.contact_subtitle || "",
        contact_address: row.contact_address || "",
        contact_phones: (row.contact_phones as string[]) || [],
        discount_text: row.discount_text || "",
        book_now_text: row.book_now_text || "",
        select_package_text: row.select_package_text || "",
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);

    const { id, ...updateData } = data;
    const { error } = await supabase
      .from("darul_furkan_content" as any)
      .update(updateData as any)
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to save content", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Darul Furkan content updated successfully" });
    }
    setSaving(false);
  };

  const updateField = (field: keyof DarulFurkanData, value: any) => {
    if (!data) return;
    setData({ ...data, [field]: value });
  };

  // Package Inclusions helpers
  const addInclusion = () => {
    if (!data) return;
    setData({ ...data, package_inclusions: [...data.package_inclusions, ""] });
  };
  const removeInclusion = (index: number) => {
    if (!data) return;
    setData({ ...data, package_inclusions: data.package_inclusions.filter((_, i) => i !== index) });
  };
  const updateInclusion = (index: number, value: string) => {
    if (!data) return;
    const updated = [...data.package_inclusions];
    updated[index] = value;
    setData({ ...data, package_inclusions: updated });
  };

  // Flight Package helpers
  const addFlightPackage = () => {
    if (!data) return;
    setData({
      ...data,
      flight_packages: [...data.flight_packages, {
        type: "", typeBn: "", typeAr: "", price: 0,
        flightDate: "", flightDateBn: "", flightDateAr: "", highlight: false,
      }],
    });
  };
  const removeFlightPackage = (index: number) => {
    if (!data) return;
    setData({ ...data, flight_packages: data.flight_packages.filter((_, i) => i !== index) });
  };
  const updateFlightPackage = (index: number, field: keyof FlightPackage, value: any) => {
    if (!data) return;
    const updated = [...data.flight_packages];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, flight_packages: updated });
  };

  // Itikaf Package helpers
  const addItikafPackage = () => {
    if (!data) return;
    setData({
      ...data,
      itikaf_packages: [...data.itikaf_packages, {
        days: 0, daysBn: "", daysAr: "", daysEn: "", price: 0,
        label: "", labelBn: "", labelAr: "",
      }],
    });
  };
  const removeItikafPackage = (index: number) => {
    if (!data) return;
    setData({ ...data, itikaf_packages: data.itikaf_packages.filter((_, i) => i !== index) });
  };
  const updateItikafPackage = (index: number, field: keyof ItikafPackage, value: any) => {
    if (!data) return;
    const updated = [...data.itikaf_packages];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, itikaf_packages: updated });
  };

  // Contact phones helpers
  const addPhone = () => {
    if (!data) return;
    setData({ ...data, contact_phones: [...data.contact_phones, ""] });
  };
  const removePhone = (index: number) => {
    if (!data) return;
    setData({ ...data, contact_phones: data.contact_phones.filter((_, i) => i !== index) });
  };
  const updatePhone = (index: number, value: string) => {
    if (!data) return;
    const updated = [...data.contact_phones];
    updated[index] = value;
    setData({ ...data, contact_phones: updated });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No content found. Please check database.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save All Changes
        </Button>
      </div>

      {/* Section Header */}
      <Card>
        <CardHeader><CardTitle>সেকশন হেডার / Section Header</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Badge Text</Label>
              <Input value={data.section_badge} onChange={(e) => updateField("section_badge", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Title Highlight</Label>
              <Input value={data.section_title_highlight} onChange={(e) => updateField("section_title_highlight", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Section Title</Label>
            <Input value={data.section_title} onChange={(e) => updateField("section_title", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Section Subtitle</Label>
            <Textarea value={data.section_subtitle} onChange={(e) => updateField("section_subtitle", e.target.value)} rows={2} />
          </div>
        </CardContent>
      </Card>

      {/* Lottery Banner */}
      <Card>
        <CardHeader><CardTitle>লটারি ব্যানার / Lottery Banner</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Lottery Title</Label>
              <Input value={data.lottery_title} onChange={(e) => updateField("lottery_title", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Lottery Subtitle</Label>
              <Input value={data.lottery_subtitle} onChange={(e) => updateField("lottery_subtitle", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Special Offer Label</Label>
              <Input value={data.special_offer_label} onChange={(e) => updateField("special_offer_label", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Offer Dates</Label>
              <Input value={data.offer_dates} onChange={(e) => updateField("offer_dates", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Package Inclusions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>প্যাকেজ ইনক্লুশন / Package Inclusions</span>
            <Button size="sm" variant="outline" onClick={addInclusion} className="gap-1">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Includes Title</Label>
              <Input value={data.includes_title} onChange={(e) => updateField("includes_title", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Includes Subtitle</Label>
              <Input value={data.includes_subtitle} onChange={(e) => updateField("includes_subtitle", e.target.value)} />
            </div>
          </div>
          {data.package_inclusions.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={item}
                onChange={(e) => updateInclusion(index, e.target.value)}
                placeholder={`Item ${index + 1}`}
              />
              <Button size="icon" variant="ghost" className="text-destructive shrink-0" onClick={() => removeInclusion(index)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Flight Packages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>ফ্লাইট প্যাকেজ / Flight Packages</span>
            <Button size="sm" variant="outline" onClick={addFlightPackage} className="gap-1">
              <Plus className="w-4 h-4" /> Add Flight
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.flight_packages.map((pkg, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4 relative">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Flight #{index + 1}</h4>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeFlightPackage(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Type (EN)</Label>
                  <Input value={pkg.type} onChange={(e) => updateFlightPackage(index, "type", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Type (BN)</Label>
                  <Input value={pkg.typeBn} onChange={(e) => updateFlightPackage(index, "typeBn", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Type (AR)</Label>
                  <Input value={pkg.typeAr} onChange={(e) => updateFlightPackage(index, "typeAr", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Price (৳)</Label>
                  <Input type="number" value={pkg.price} onChange={(e) => updateFlightPackage(index, "price", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Flight Date (EN)</Label>
                  <Input value={pkg.flightDate} onChange={(e) => updateFlightPackage(index, "flightDate", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Flight Date (BN)</Label>
                  <Input value={pkg.flightDateBn} onChange={(e) => updateFlightPackage(index, "flightDateBn", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Flight Date (AR)</Label>
                  <Input value={pkg.flightDateAr} onChange={(e) => updateFlightPackage(index, "flightDateAr", e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={pkg.highlight} onCheckedChange={(checked) => updateFlightPackage(index, "highlight", checked)} />
                <Label>Highlighted (Recommended)</Label>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Itikaf Packages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>ইতেকাফ প্যাকেজ / Itikaf Packages</span>
            <Button size="sm" variant="outline" onClick={addItikafPackage} className="gap-1">
              <Plus className="w-4 h-4" /> Add Itikaf
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Itikaf Badge</Label>
              <Input value={data.itikaf_badge} onChange={(e) => updateField("itikaf_badge", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Itikaf Title</Label>
              <Input value={data.itikaf_title} onChange={(e) => updateField("itikaf_title", e.target.value)} />
            </div>
          </div>
          {data.itikaf_packages.map((pkg, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Itikaf #{index + 1}</h4>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeItikafPackage(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Days</Label>
                  <Input type="number" value={pkg.days} onChange={(e) => updateItikafPackage(index, "days", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Days (BN)</Label>
                  <Input value={pkg.daysBn} onChange={(e) => updateItikafPackage(index, "daysBn", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Days (AR)</Label>
                  <Input value={pkg.daysAr} onChange={(e) => updateItikafPackage(index, "daysAr", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Days (EN)</Label>
                  <Input value={pkg.daysEn} onChange={(e) => updateItikafPackage(index, "daysEn", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Price (৳)</Label>
                  <Input type="number" value={pkg.price} onChange={(e) => updateItikafPackage(index, "price", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Label (EN)</Label>
                  <Input value={pkg.label} onChange={(e) => updateItikafPackage(index, "label", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Label (BN)</Label>
                  <Input value={pkg.labelBn} onChange={(e) => updateItikafPackage(index, "labelBn", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Label (AR)</Label>
                  <Input value={pkg.labelAr} onChange={(e) => updateItikafPackage(index, "labelAr", e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Contact & Button Text */}
      <Card>
        <CardHeader><CardTitle>যোগাযোগ ও বাটন টেক্সট / Contact & Button Text</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contact Title</Label>
              <Input value={data.contact_title} onChange={(e) => updateField("contact_title", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Contact Subtitle</Label>
              <Input value={data.contact_subtitle} onChange={(e) => updateField("contact_subtitle", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Textarea value={data.contact_address} onChange={(e) => updateField("contact_address", e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Phone Numbers</Label>
              <Button size="sm" variant="outline" onClick={addPhone} className="gap-1">
                <Plus className="w-4 h-4" /> Add Phone
              </Button>
            </div>
            {data.contact_phones.map((phone, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input value={phone} onChange={(e) => updatePhone(index, e.target.value)} placeholder="01xxx-xxxxxx" />
                <Button size="icon" variant="ghost" className="text-destructive shrink-0" onClick={() => removePhone(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Discount Text</Label>
              <Input value={data.discount_text} onChange={(e) => updateField("discount_text", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Book Now Button Text</Label>
              <Input value={data.book_now_text} onChange={(e) => updateField("book_now_text", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Select Package Button Text</Label>
              <Input value={data.select_package_text} onChange={(e) => updateField("select_package_text", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save All Changes
        </Button>
      </div>
    </div>
  );
};

export default AdminDarulFurkanContent;
