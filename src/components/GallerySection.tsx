import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Grid3X3, 
  Layers, 
  X, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Image as ImageIcon, 
  Video, 
  Play,
  Pause,
  Camera,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

interface GalleryImage {
  id: string;
  image_url: string;
  alt_text: string;
  caption: string | null;
  category: string | null;
  order_index: number;
}

interface GallerySettings {
  id: string;
  title: string;
  subtitle: string | null;
  background_color: string | null;
  is_enabled: boolean;
  video_url: string | null;
  video_enabled: boolean | null;
  video_opacity: number | null;
  video_blur: number | null;
  video_speed: number | null;
  columns_desktop: number | null;
  lightbox_enabled: boolean | null;
  show_captions: boolean | null;
}

interface GalleryVideo {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  description: string | null;
  order_index: number;
  is_active: boolean;
}

type ViewMode = "grid" | "masonry";
type ContentType = "images" | "videos";

const GallerySection = () => {
  const { t } = useTranslation();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [videos, setVideos] = useState<GalleryVideo[]>([]);
  const [settings, setSettings] = useState<GallerySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<GalleryVideo | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [contentType, setContentType] = useState<ContentType>("images");
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  
  // Lightbox state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const lightboxRef = useRef<HTMLDivElement>(null);
  const lastTouchDistance = useRef<number | null>(null);
  const lastPanPosition = useRef({ x: 0, y: 0 });

  const autoplayPlugin = Autoplay({
    delay: 4000,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
  });

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const onSelect = useCallback(() => {
    if (!carouselApi) return;
    setCurrentSlide(carouselApi.selectedScrollSnap());
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi) return;
    onSelect();
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi, onSelect]);

  const fetchGalleryData = async () => {
    try {
      const { data: settingsData } = await supabase
        .from("gallery_settings")
        .select("*")
        .maybeSingle();

      if (settingsData) {
        setSettings(settingsData);
      }

      const { data: imagesData } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("is_active", true)
        .order("order_index");

      if (imagesData) {
        setImages(imagesData);
      }

      const { data: videosData } = await supabase
        .from("gallery_videos")
        .select("*")
        .eq("is_active", true)
        .order("order_index");

      if (videosData) {
        setVideos(videosData);
      }
    } catch (error) {
      console.error("Error fetching gallery data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoplay = () => {
    if (isAutoplayPaused) {
      autoplayPlugin.play();
    } else {
      autoplayPlugin.stop();
    }
    setIsAutoplayPaused(!isAutoplayPaused);
  };

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      lightboxRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Zoom controls
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));
    if (zoomLevel <= 1.5) setPanPosition({ x: 0, y: 0 });
  };
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleCloseLightbox = () => {
    setSelectedImage(null);
    setSelectedVideo(null);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setIsFullscreen(false);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const handlePrevImage = useCallback(() => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    setSelectedImage(images[prevIndex]);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, [selectedImage, images]);

  const handleNextImage = useCallback(() => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    setSelectedImage(images[nextIndex]);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, [selectedImage, images]);

  useEffect(() => {
    if (!selectedImage) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevImage();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextImage();
      } else if (e.key === "Escape") {
        handleCloseLightbox();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, handlePrevImage, handleNextImage]);

  // Touch handlers for pinch zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchDistance.current = distance;
    } else if (e.touches.length === 1 && zoomLevel > 1) {
      lastPanPosition.current = {
        x: e.touches[0].clientX - panPosition.x,
        y: e.touches[0].clientY - panPosition.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistance.current !== null) {
      e.preventDefault();
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = distance - lastTouchDistance.current;
      const newZoom = Math.max(1, Math.min(4, zoomLevel + delta * 0.01));
      setZoomLevel(newZoom);
      lastTouchDistance.current = distance;
    } else if (e.touches.length === 1 && zoomLevel > 1) {
      const newX = e.touches[0].clientX - lastPanPosition.current.x;
      const newY = e.touches[0].clientY - lastPanPosition.current.y;
      const maxPan = (zoomLevel - 1) * 150;
      setPanPosition({
        x: Math.max(-maxPan, Math.min(maxPan, newX)),
        y: Math.max(-maxPan, Math.min(maxPan, newY)),
      });
    }
  };

  const handleTouchEnd = () => {
    lastTouchDistance.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    const newZoom = Math.max(1, Math.min(4, zoomLevel + delta));
    setZoomLevel(newZoom);
    if (newZoom <= 1) setPanPosition({ x: 0, y: 0 });
  };

  if (!loading && !settings?.is_enabled) return null;
  if (!loading && images.length === 0 && videos.length === 0) return null;

  if (loading) {
    return (
      <section id="gallery" className="py-24 bg-gradient-to-b from-background via-muted/30 to-background">
        <div className="container">
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-secondary rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentItems = contentType === "images" ? images : videos;

  return (
    <>
      <section 
        id="gallery" 
        className="py-24 relative overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background"
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/10 to-secondary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-secondary/10 to-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-primary/5 rounded-full opacity-50" />
        </div>

        <div className="container relative z-10">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 border border-primary/20 rounded-full mb-6 backdrop-blur-sm"
            >
              <Camera className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-gradient-gold">ফটো গ্যালারি</span>
              <Sparkles className="w-4 h-4 text-secondary" />
            </motion.div>

            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="text-gradient-gold">{settings?.title || "আমাদের স্মৃতির অ্যালবাম"}</span>
            </h2>
            
            <p className="font-thuluth text-secondary/70 text-xl md:text-2xl mb-4">معرض الصور والفيديو</p>
            
            {settings?.subtitle && (
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                {settings.subtitle}
              </p>
            )}

            <div className="mt-6 flex justify-center">
              <div className="h-1 w-32 bg-gradient-to-r from-transparent via-secondary to-transparent rounded-full" />
            </div>
          </motion.div>

          {/* Content Type Toggle */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mb-8"
          >
            <Button
              onClick={() => setContentType("images")}
              variant={contentType === "images" ? "default" : "outline"}
              size="lg"
              className={cn(
                "gap-3 px-8 py-6 text-base font-semibold rounded-xl transition-all duration-300",
                contentType === "images" 
                  ? "bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/25 scale-105" 
                  : "hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              <ImageIcon className="w-5 h-5" />
              ছবি ({images.length})
            </Button>

            <Button
              onClick={() => setContentType("videos")}
              variant={contentType === "videos" ? "default" : "outline"}
              size="lg"
              className={cn(
                "gap-3 px-8 py-6 text-base font-semibold rounded-xl transition-all duration-300",
                contentType === "videos" 
                  ? "bg-gradient-to-r from-secondary to-secondary/80 shadow-lg shadow-secondary/25 scale-105" 
                  : "hover:border-secondary/50 hover:bg-secondary/5"
              )}
            >
              <Video className="w-5 h-5" />
              ভিডিও ({videos.length})
            </Button>
          </motion.div>

          {/* View Mode Toggle (only for images) */}
          {contentType === "images" && images.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex justify-center gap-3 mb-10"
            >
              <div className="inline-flex p-1.5 bg-muted/50 rounded-xl border border-border/50 backdrop-blur-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "gap-2 px-4 py-2 rounded-lg transition-all",
                    viewMode === "grid" && "bg-background shadow-sm"
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                  গ্রিড
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("masonry")}
                  className={cn(
                    "gap-2 px-4 py-2 rounded-lg transition-all",
                    viewMode === "masonry" && "bg-background shadow-sm"
                  )}
                >
                  <Layers className="w-4 h-4" />
                  মেসোনরি
                </Button>
              </div>
            </motion.div>
          )}

          {/* Images Content */}
          {contentType === "images" && images.length > 0 && (
            <AnimatePresence mode="wait">
              {viewMode === "grid" ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                >
                  {images.map((image, index) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer bg-muted"
                      onClick={() => setSelectedImage(image)}
                    >
                      <img
                        src={image.image_url}
                        alt={image.alt_text || "Gallery image"}
                        loading="lazy"
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      
                      {/* Zoom icon */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                          <ZoomIn className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      {/* Caption */}
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-white text-sm font-medium line-clamp-2">{image.caption}</p>
                        </div>
                      )}

                      {/* Category badge */}
                      {image.category && image.category !== "general" && (
                        <Badge className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm">
                          {image.category}
                        </Badge>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="masonry"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5"
                >
                  {images.map((image, index) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="group relative break-inside-avoid rounded-2xl overflow-hidden cursor-pointer bg-muted"
                      onClick={() => setSelectedImage(image)}
                    >
                      <img
                        src={image.image_url}
                        alt={image.alt_text || "Gallery image"}
                        loading="lazy"
                        className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-105"
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      
                      {/* Zoom icon */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                          <ZoomIn className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      {/* Caption */}
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-white text-sm font-medium line-clamp-2">{image.caption}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Videos Content */}
          {contentType === "videos" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {videos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video, index) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="group relative rounded-2xl overflow-hidden bg-muted shadow-lg cursor-pointer"
                      onClick={() => setSelectedVideo(video)}
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video">
                        {video.thumbnail_url ? (
                          <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <Video className="w-16 h-16 text-muted-foreground/50" />
                          </div>
                        )}
                        
                        {/* Play button overlay */}
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                            <Play className="w-7 h-7 text-primary ml-1" fill="currentColor" />
                          </div>
                        </div>
                      </div>

                      {/* Video info */}
                      <div className="p-4 bg-card">
                        <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {video.title}
                        </h3>
                        {video.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {video.description}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Video className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">কোনো ভিডিও পাওয়া যায়নি</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Empty state for images */}
          {contentType === "images" && images.length === 0 && (
            <div className="text-center py-20">
              <ImageIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">কোনো ছবি পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      </section>

      {/* Image Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            ref={lightboxRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center"
            onClick={handleCloseLightbox}
          >
            {/* Controls */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full"
                onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
              >
                <ZoomOut className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full"
                onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
              >
                <ZoomIn className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full"
                onClick={(e) => { e.stopPropagation(); handleResetZoom(); }}
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full"
                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full"
                onClick={handleCloseLightbox}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12"
              onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12"
              onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>

            {/* Image */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-[90vw] max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
            >
              <img
                src={selectedImage.image_url}
                alt={selectedImage.alt_text}
                className="max-w-full max-h-[85vh] object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
                  cursor: zoomLevel > 1 ? 'grab' : 'default'
                }}
                draggable={false}
              />
            </motion.div>

            {/* Caption */}
            {selectedImage.caption && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-6 py-3 rounded-full">
                <p className="text-white text-sm">{selectedImage.caption}</p>
              </div>
            )}

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
              {images.findIndex(img => img.id === selectedImage.id) + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full z-10"
              onClick={() => setSelectedVideo(null)}
            >
              <X className="w-6 h-6" />
            </Button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
                <video
                  src={selectedVideo.video_url}
                  controls
                  autoPlay
                  className="w-full h-full"
                  poster={selectedVideo.thumbnail_url || undefined}
                />
              </div>
              
              <div className="mt-4 text-center">
                <h3 className="text-white text-xl font-semibold">{selectedVideo.title}</h3>
                {selectedVideo.description && (
                  <p className="text-white/70 mt-2">{selectedVideo.description}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GallerySection;
