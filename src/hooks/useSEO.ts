import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SEOData {
  meta_title: string;
  meta_description: string;
  og_image_url: string;
  og_title: string;
  og_description: string;
  canonical_url: string;
  robots: string;
}

const defaultSEO: SEOData = {
  meta_title: "দারুল ফুরকান ট্যুরস এন্ড ট্রাভেলস | হজ্জ ও উমরাহ প্যাকেজ ২০২৬",
  meta_description: "বাংলাদেশের সরকার অনুমোদিত হজ্জ ও উমরাহ এজেন্সি। প্রিমিয়াম প্যাকেজ, ভিসা সার্ভিস এবং ২৪/৭ সাপোর্ট সহ আপনার পবিত্র যাত্রার বিশ্বস্ত সঙ্গী।",
  og_image_url: "/images/og-logo.jpeg",
  og_title: "দারুল ফুরকান ট্যুরস এন্ড ট্রাভেলস",
  og_description: "হজ্জ ও উমরাহ প্যাকেজ ২০২৬ - আপনার পবিত্র যাত্রার বিশ্বস্ত সঙ্গী",
  canonical_url: "",
  robots: "index, follow",
};

export const useSEO = (pageKey: string = "homepage") => {
  const [seo, setSeo] = useState<SEOData>(defaultSEO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSEO = async () => {
      const { data } = await supabase
        .from("seo_settings" as any)
        .select("*")
        .eq("page_key", pageKey)
        .maybeSingle();

      if (data) {
        const d = data as any;
        setSeo({
          meta_title: d.meta_title || defaultSEO.meta_title,
          meta_description: d.meta_description || defaultSEO.meta_description,
          og_image_url: d.og_image_url || defaultSEO.og_image_url,
          og_title: d.og_title || defaultSEO.og_title,
          og_description: d.og_description || defaultSEO.og_description,
          canonical_url: d.canonical_url || defaultSEO.canonical_url,
          robots: d.robots || defaultSEO.robots,
        });
      }
      setLoading(false);
    };

    fetchSEO();
  }, [pageKey]);

  // Update document meta tags
  useEffect(() => {
    if (loading) return;

    // Title
    document.title = seo.meta_title;

    // Meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", seo.meta_description);

    // Robots
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement("meta");
      metaRobots.setAttribute("name", "robots");
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute("content", seo.robots);

    // OG Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute("content", seo.og_title);

    // OG Description
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement("meta");
      ogDescription.setAttribute("property", "og:description");
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute("content", seo.og_description);

    // OG Image
    if (seo.og_image_url) {
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement("meta");
        ogImage.setAttribute("property", "og:image");
        document.head.appendChild(ogImage);
      }
      ogImage.setAttribute("content", seo.og_image_url);
    }

    // Canonical URL
    if (seo.canonical_url) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", seo.canonical_url);
    }
  }, [seo, loading]);

  return { seo, loading };
};

export default useSEO;
