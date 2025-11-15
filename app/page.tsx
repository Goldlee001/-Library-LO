"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import { useEffect, useState } from "react";

type MediaItem = { _id?: string; title: string; type: "image" | "video" | "pdf"; src: string; createdAt?: string; description?: string };

export default function LandingPage() {
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [images, setImages] = useState<MediaItem[]>([]);
  const [pdfs, setPdfs] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [vRes, iRes, pRes] = await Promise.all([
          fetch("/api/media?type=video&scope=dashboard", { cache: "no-store" }),
          fetch("/api/media?type=image&scope=dashboard", { cache: "no-store" }),
          fetch("/api/media?type=pdf&scope=dashboard", { cache: "no-store" }),
        ]);
        if (!vRes.ok || !iRes.ok || !pRes.ok) throw new Error("Failed to load media");
        const [vData, iData, pData] = await Promise.all([
          vRes.json(),
          iRes.json(),
          pRes.json(),
        ]);
        const vItems: MediaItem[] = (vData?.items || [])
          .slice(0, 3)
          .map((m: any) => ({ _id: m._id, title: m.title || "Untitled", type: "video", src: m.src, createdAt: m.createdAt, description: m.description }));
        const iItems: MediaItem[] = (iData?.items || [])
          .slice(0, 3)
          .map((m: any) => ({ _id: m._id, title: m.title || "Untitled", type: "image", src: m.src, createdAt: m.createdAt, description: m.description }));
        const pItems: MediaItem[] = (pData?.items || [])
          .slice(0, 3)
          .map((m: any) => ({ _id: m._id, title: m.title || "Untitled", type: "pdf", src: m.src, createdAt: m.createdAt, description: m.description }));
        setVideos(vItems);
        setImages(iItems);
        setPdfs(pItems);
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Header />
      <HeroSection />

      <main className="bg-[#f9f6ef] min-h-screen">
        <section className="container mx-auto px-4 py-12 grid md:grid-cols-3 gap-10">
          {/* Left: Main Book Overview */}
          <div className="md:col-span-1">
            <img
              src="/images/Beyond.jpeg"
              alt="Beyond Words: A Journey Through Learning"
              loading="lazy"
              className="rounded-lg shadow-md w-full object-cover"
            />

            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-4">
                Beyond Words: A Journey Through Learning
              </h2>

              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to our digital library — a hub of knowledge and
                discovery. This platform provides students with access to
                a diverse collection of resources, including books, academic
                PDFs, instructional videos, and educational images. Inspired
                by the enduring message of “The Book Thief,” our library
                celebrates the transformative power of learning and the written word.
              </p>

              <p className="text-gray-700 leading-relaxed mb-4">
                Set during a time of conflict and transformation, this story
                reflects the resilience of a young learner who discovers hope
                and strength through the power of words. Just as Liesel
                Meminger found comfort in books amid hardship, our library
                encourages students to seek knowledge, share ideas, and find
                inspiration through reading, viewing, and learning.
              </p>

              <p className="text-gray-700 leading-relaxed">
                As the pursuit of knowledge deepens, awareness and
                understanding grow. Just as Liesel’s love for books opened her
                eyes to the world around her, our library aims to foster
                curiosity, empathy, and intellectual resilience.
              </p>
            </div>
          </div>

          {/* Right: Learning Materials by Type */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-semibold mb-6">Learning Materials</h3>

            {loading && (
              <div className="text-center text-gray-600">Loading...</div>
            )}
            {error && (
              <div className="text-center text-red-600">{error}</div>
            )}

            {!loading && !error && (
              <div className="space-y-10">
                {/* Videos Row */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Videos</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((item, index) => (
                      <div key={`v-${index}`} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                        <video
                          key={item.src}
                          controls
                          preload="metadata"
                          className="rounded-md mb-3 w-full h-64 object-cover"
                        >
                          <source src={item.src} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        <h4 className="text-sm font-medium text-center text-gray-800">{item.title}</h4>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Images Row */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Images</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images.map((item, index) => (
                      <div key={`i-${index}`} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                        <img
                          src={item.src}
                          alt={item.title}
                          loading="lazy"
                          className="rounded-md mb-3 w-full h-64 object-cover"
                        />
                        <h4 className="text-sm font-medium text-center text-gray-800">{item.title}</h4>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PDFs Row */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">PDFs</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pdfs.map((item, index) => (
                      <div key={`p-${index}`} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                        <div className="relative">
                          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded">PDF</span>
                          <iframe
                            src={`${item.src}#toolbar=0&navpanes=0&scrollbar=0&page=1&view=FitH`}
                            title={item.title}
                            className="rounded-md mb-3 w-full h-64 border"
                          >
                            This browser does not support PDFs. Please download the PDF to view it.
                          </iframe>
                        </div>
                        <h4 className="text-sm font-medium text-center text-gray-800">{item.title}</h4>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2 text-center">{item.description || 'PDF document'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
