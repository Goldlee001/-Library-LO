"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, FileText, Heart, Monitor, Download } from "lucide-react";
import UserHeader from "@/components/user-header";
import Footer from "@/components/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ⭐ NEW IMPORT
import AIChat from "@/components/AIChat";


interface MediaItem {
  _id?: string;
  id: number; // fallback index
  title: string;
  src: string;
}

interface MediaSectionProps {
  title: string;
  color: string;
  items: MediaItem[];
  description: string;
  handleOpen: (item: MediaItem, type: string) => void;
  handleDownload: (src: string) => void;
}

const EMPTY_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

export default function Home() {
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: string; src: string; title: string } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [images, setImages] = useState<MediaItem[]>([]);
  const [pdfs, setPdfs] = useState<MediaItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [vRes, iRes, pRes] = await Promise.all([
          fetch("/api/media?type=video&scope=dashboard", { cache: "no-store" }),
          fetch("/api/media?type=image&scope=dashboard", { cache: "no-store" }),
          fetch("/api/media?type=pdf&scope=dashboard", { cache: "no-store" }),
        ]);
        if (!vRes.ok || !iRes.ok || !pRes.ok) throw new Error("Failed to load media");
        const [vData, iData, pData] = await Promise.all([vRes.json(), iRes.json(), pRes.json()]);
        const mapItems = (arr: any[]): MediaItem[] => (arr || []).map((m: any, idx: number) => ({ _id: m._id, id: idx, title: m.title || "Untitled", src: m.src }));
        setVideos(mapItems(vData?.items));
        setImages(mapItems(iData?.items));
        setPdfs(mapItems(pData?.items));
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleOpen = (item: MediaItem, type: string) => {
    setSelectedItem({ ...item, type });
    setOpen(true);
  };

  const handleDownload = (src: string) => {
    toast.info(
      <div className="text-sm">
        Do you want to download this file?
        <div className="mt-2 flex gap-3">
          <Button
            size="sm"
            onClick={() => {
              const link = document.createElement("a");
              link.href = src;
              link.download = src.split("/").pop() || "file";
              link.click();
              toast.dismiss();
              toast.success("Download started!");
            }}
          >
            Yes
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.dismiss()}>
            No
          </Button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false }
    );
  };

  return (
    <main className="flex flex-col min-h-screen bg-gray-100 text-[#1d72b5]">
      <UserHeader />

      <div className="px-4 md:px-8 py-3 bg-white flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center border border-gray-300 rounded w-full max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Search journals, books, images, and primary sources"
            className="w-full px-4 py-2 text-base text-gray-700 focus:outline-none bg-transparent"
          />
          <button className="p-2 text-gray-500 hover:text-[#1d72b5] transition border-l border-gray-300">
            <Search size={20} />
          </button>
        </div>
      </div>

      <section className="px-4 md:px-8 py-10 md:py-16 flex justify-center">
        <div className="max-w-6xl w-full flex flex-col md:flex-row bg-white rounded-xl overflow-hidden border border-gray-200 shadow-lg">
          <div className="md:w-1/2 w-full p-6 md:p-10 flex flex-col justify-start space-y-6">
            <p className="text-sm text-gray-500 font-medium">Part of Reveal Digital</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Independent Voices
            </h1>
            <div>
              <h2 className="text-lg md:text-xl font-bold mb-2 text-gray-900">About this Collection:</h2>
              <p className="text-base text-gray-700 leading-relaxed">
                Independent Voices is an open access digital collection of alternative press newspapers, magazines, and
                journals, drawn from the special collections of participating libraries.
              </p>
            </div>
          </div>

          <div className="md:w-1/2 w-full flex justify-center items-center md:p-10">
            <img
              src="/images/book.jpeg"
              alt="Book Cover"
              width={350}
              height={400}
              loading="lazy"
              className="object-contain bg-white rounded-none lg:rounded-lg"
              onError={(e) => {
                const t = e.currentTarget as HTMLImageElement;
                if (t && t.src !== EMPTY_PIXEL) t.src = EMPTY_PIXEL;
              }}
            />
          </div>
        </div>
      </section>

      {loading && (
        <div className="text-center text-gray-600">Loading...</div>
      )}
      {error && (
        <div className="text-center text-red-600">{error}</div>
      )}

      <MediaSection
        title=" Video Collection"
        color="blue"
        items={videos}
        description="Explore a variety of educational and creative videos available for free viewing and download."
        handleOpen={handleOpen}
        handleDownload={handleDownload}
      />
      <MediaSection
        title="Image Collection"
        color="blue"
        items={images}
        description="Browse through a gallery of captivating and artistic images from our archives."
        handleOpen={handleOpen}
        handleDownload={handleDownload}
      />
      <MediaSection
        title="PDF Documents"
        color="blue"
        items={pdfs}
        description="Access and read a selection of academic and creative PDF documents directly from our library."
        handleOpen={handleOpen}
        handleDownload={handleDownload}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-bold">{selectedItem?.title}</DialogTitle>
          </DialogHeader>

          {selectedItem?.type === "video" && (
            <video src={selectedItem.src} controls className="w-full rounded-lg mt-3 max-h-[70vh] object-contain" />
          )}
          {selectedItem?.type === "image" && (
            <div className="w-full flex justify-center mt-3">
              <img
                src={selectedItem?.src || EMPTY_PIXEL}
                alt={selectedItem?.title || "image"}
                width={700}
                height={500}
                loading="lazy"
                className="rounded-lg object-contain max-h-[70vh] w-auto h-auto"
                onError={(e) => {
                  const t = e.currentTarget as HTMLImageElement;
                  if (t && t.src !== EMPTY_PIXEL) t.src = EMPTY_PIXEL;
                }}
              />
            </div>
          )}
          {selectedItem?.type === "pdf" && (
            <iframe src={selectedItem.src} className="w-full h-[70vh] mt-3 rounded-lg border" title={selectedItem.title} />
          )}
        </DialogContent>
      </Dialog>

      <Footer />
      <ToastContainer position="top-center" />
    </main>
  );
}

function MediaSection({ title, color, items, description, handleOpen, handleDownload }: MediaSectionProps) {
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [userLiked, setUserLiked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const ids = (items || [])
      .map((it: any) => it._id)
      .filter((v: any): v is string => typeof v === 'string');
    if (!ids.length) return;
    (async () => {
      try {
        const res = await fetch('/api/likes/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mediaIds: ids }),
        });
        if (!res.ok) return;
        const data = await res.json();
        setLikeCounts(data.counts || {});
        setUserLiked(data.liked || {});
      } catch {}
    })();
  }, [items]);

  const toggleLike = async (key: string) => {
    const isLiked = !!userLiked[key];
    setLikeCounts((p) => ({ ...p, [key]: isLiked ? Math.max((p[key] || 1) - 1, 0) : (p[key] || 0) + 1 }));
    setUserLiked((p) => ({ ...p, [key]: !isLiked }));
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId: key, action: 'toggle' }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLikeCounts((p) => ({ ...p, [key]: data.count as number }));
      setUserLiked((p) => ({ ...p, [key]: !!data.liked }));
    } catch {
      setLikeCounts((p) => ({ ...p, [key]: isLiked ? (p[key] || 0) + 1 : Math.max((p[key] || 1) - 1, 0) }));
      setUserLiked((p) => ({ ...p, [key]: isLiked }));
    }
  };

  const colorClass = color === 'blue' ? 'text-blue-700' : color === 'purple' ? 'text-purple-700' : 'text-indigo-700';

  return (
    <section className="bg-[#f3edd7] max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-12">
      <h2 className={`text-3xl font-bold mb-4 ${colorClass}`}>{title}</h2>
      <p className="text-gray-600 mb-8">{description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
        {items.map((item) => {
          const key = (item as any)._id as string | undefined;
          const counts = key ? (likeCounts[key] || 0) : 0;
          const isLiked = key ? !!userLiked[key] : false;
          const itemType = item.src.endsWith(".mp4") ? "video" : item.src.endsWith(".pdf") ? "pdf" : "image";

          return (
            <Card key={`${title}-${item.id}`} className="p-0 shadow-md hover:shadow-xl transition-all rounded-2xl overflow-hidden bg-white border border-gray-200">
              <CardHeader className="p-0 relative">
                {item.src.endsWith(".mp4") ? (
                  <video src={item.src} className="rounded-t-lg w-full h-56 sm:h-64 object-cover" controls={false} muted loop />
                ) : item.src.endsWith(".pdf") ? (
                  <div className="bg-gray-100 h-56 sm:h-64 flex justify-center items-center">
                    <FileText className="text-gray-700 w-16 h-16" />
                  </div>
                ) : (
                  <img
                    src={item.src}
                    alt={item.title}
                    width={400}
                    height={300}
                    loading="lazy"
                    className="rounded-t-lg object-cover w-full h-56 sm:h-64"
                    onError={(e) => {
                      const t = e.currentTarget as HTMLImageElement;
                      if (t && t.src !== EMPTY_PIXEL) t.src = EMPTY_PIXEL;
                    }}
                  />
                )}
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 text-gray-800">{item.title}</h3>

                <div className="flex justify-end mb-3">
                  <button
                    onClick={() => key && toggleLike(key)}
                    disabled={!key}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition disabled:opacity-50"
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                    <span className="text-sm font-medium">{counts}</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" variant="outline" onClick={() => handleOpen(item, itemType)}>
                    <Monitor className="w-4 h-4 mr-1" /> View
                  </Button>
                  <Button className="flex-1" variant="outline" onClick={() => handleDownload(item.src)}>
                    <Download className="w-4 h-4 mr-1" /> Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <AIChat />
    </section>
  );
}