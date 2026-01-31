import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseVideoThumbnailOptions {
  bucket: string;
  folder: string;
}

/**
 * Hook to generate and upload video thumbnails automatically
 * Captures a frame from the video at a specific time point
 */
export const useVideoThumbnail = ({ bucket, folder }: UseVideoThumbnailOptions) => {
  const [generating, setGenerating] = useState(false);

  /**
   * Generate a thumbnail from a video file
   * @param videoFile - The video file to extract thumbnail from
   * @param seekTime - Time in seconds to capture the frame (default: 1 second)
   * @returns Promise<string | null> - The public URL of the uploaded thumbnail
   */
  const generateThumbnail = async (
    videoFile: File,
    seekTime: number = 1
  ): Promise<string | null> => {
    setGenerating(true);

    return new Promise((resolve) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");

      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;

      const cleanup = () => {
        video.pause();
        video.removeAttribute("src");
        video.load();
        URL.revokeObjectURL(video.src);
      };

      video.onloadedmetadata = () => {
        // Seek to the specified time or 10% of duration (whichever is less)
        const captureTime = Math.min(seekTime, video.duration * 0.1);
        video.currentTime = captureTime;
      };

      video.onseeked = async () => {
        try {
          // Set canvas dimensions to match video
          canvas.width = video.videoWidth || 1280;
          canvas.height = video.videoHeight || 720;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            console.error("Could not get canvas context");
            cleanup();
            setGenerating(false);
            resolve(null);
            return;
          }

          // Draw the video frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Convert to blob
          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                console.error("Failed to create blob from canvas");
                cleanup();
                setGenerating(false);
                resolve(null);
                return;
              }

              try {
                // Upload to Supabase storage
                const fileName = `${folder}/${Date.now()}-thumbnail.webp`;
                
                const { error: uploadError } = await supabase.storage
                  .from(bucket)
                  .upload(fileName, blob, {
                    contentType: "image/webp",
                    cacheControl: "31536000",
                    upsert: false,
                  });

                if (uploadError) {
                  console.error("Thumbnail upload error:", uploadError);
                  cleanup();
                  setGenerating(false);
                  resolve(null);
                  return;
                }

                const { data: urlData } = supabase.storage
                  .from(bucket)
                  .getPublicUrl(fileName);

                cleanup();
                setGenerating(false);
                resolve(urlData.publicUrl);
              } catch (uploadError) {
                console.error("Error uploading thumbnail:", uploadError);
                cleanup();
                setGenerating(false);
                resolve(null);
              }
            },
            "image/webp",
            0.85
          );
        } catch (error) {
          console.error("Error generating thumbnail:", error);
          cleanup();
          setGenerating(false);
          resolve(null);
        }
      };

      video.onerror = () => {
        console.error("Video load error for thumbnail generation");
        cleanup();
        setGenerating(false);
        resolve(null);
      };

      // Create object URL and load video
      video.src = URL.createObjectURL(videoFile);
      video.load();
    });
  };

  /**
   * Generate thumbnail from a video URL (for already uploaded videos)
   * Note: This only works for same-origin or CORS-enabled videos
   */
  const generateThumbnailFromUrl = async (
    videoUrl: string,
    seekTime: number = 1
  ): Promise<string | null> => {
    setGenerating(true);

    return new Promise((resolve) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");

      video.crossOrigin = "anonymous";
      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;

      const cleanup = () => {
        video.pause();
        video.removeAttribute("src");
        video.load();
      };

      video.onloadedmetadata = () => {
        const captureTime = Math.min(seekTime, video.duration * 0.1);
        video.currentTime = captureTime;
      };

      video.onseeked = async () => {
        try {
          canvas.width = video.videoWidth || 1280;
          canvas.height = video.videoHeight || 720;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            cleanup();
            setGenerating(false);
            resolve(null);
            return;
          }

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                cleanup();
                setGenerating(false);
                resolve(null);
                return;
              }

              try {
                const fileName = `${folder}/${Date.now()}-thumbnail.webp`;
                
                const { error: uploadError } = await supabase.storage
                  .from(bucket)
                  .upload(fileName, blob, {
                    contentType: "image/webp",
                    cacheControl: "31536000",
                    upsert: false,
                  });

                if (uploadError) {
                  cleanup();
                  setGenerating(false);
                  resolve(null);
                  return;
                }

                const { data: urlData } = supabase.storage
                  .from(bucket)
                  .getPublicUrl(fileName);

                cleanup();
                setGenerating(false);
                resolve(urlData.publicUrl);
              } catch (error) {
                cleanup();
                setGenerating(false);
                resolve(null);
              }
            },
            "image/webp",
            0.85
          );
        } catch (error) {
          cleanup();
          setGenerating(false);
          resolve(null);
        }
      };

      video.onerror = () => {
        cleanup();
        setGenerating(false);
        resolve(null);
      };

      video.src = videoUrl;
      video.load();
    });
  };

  return { generateThumbnail, generateThumbnailFromUrl, generating };
};
