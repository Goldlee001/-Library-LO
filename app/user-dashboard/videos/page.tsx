"use client"; 

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, X, Heart, MessageCircle } from "lucide-react";
import UserHeader from "@/components/user-header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ---------- TYPES ----------
interface Video {
  _id?: string;
  title: string;
  src: string;
  description?: string;
}

// ---------- MAIN COMPONENT ----------
export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [userLiked, setUserLiked] = useState<Record<string, boolean>>({});
  const [visibleVideos, setVisibleVideos] = useState(4);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // comments
  const [comments, setComments] = useState<
    Record<string, { user: string; text: string }[]>
  >({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [activeCommentVideo, setActiveCommentVideo] = useState<string | null>(
    null
  );

  // Load comments when opening the modal for a specific video
  useEffect(() => {
    if (!activeCommentVideo) return;
    (async () => {
      try {
        const res = await fetch(`/api/comments?mediaId=${activeCommentVideo}`);
        if (!res.ok) return;
        const data = await res.json();
        const mapped = (data?.items || []).map((it: any) => ({
          user: it.userName || 'User',
          text: it.text as string,
        }));
        setComments((prev) => ({ ...prev, [activeCommentVideo]: mapped }));
      } catch {}
    })();
  }, [activeCommentVideo]);

  // ---------- LIKE TOGGLE ----------
  const toggleLike = async (id: string) => {
    const isLiked = !!userLiked[id];
    setLikes((prev) => ({
      ...prev,
      [id]: isLiked ? Math.max((prev[id] || 1) - 1, 0) : (prev[id] || 0) + 1,
    }));
    setUserLiked((prev) => ({ ...prev, [id]: !isLiked }));
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId: id, action: 'toggle' }),
      });
      if (res.status === 401) {
        toast.error('Please sign in to like');
        throw new Error('unauthorized');
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLikes((p) => ({ ...p, [id]: data.count as number }));
      setUserLiked((p) => ({ ...p, [id]: !!data.liked }));
    } catch {
      setLikes((p) => ({ ...p, [id]: isLiked ? (p[id] || 0) + 1 : Math.max((p[id] || 1) - 1, 0) }));
      setUserLiked((p) => ({ ...p, [id]: isLiked }));
    }
  };

  // ---------- ADD COMMENT ----------
  const handleAddComment = async (videoId: string, username: string) => {
    const text = newComment[videoId]?.trim();
    if (!text) return;
    const optimistic = { user: username, text };
    setComments((prev) => ({
      ...prev,
      [videoId]: [...(prev[videoId] || []), optimistic],
    }));
    setNewComment((prev) => ({ ...prev, [videoId]: "" }));
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId: videoId, text }),
      });
      if (res.status === 401) {
        toast.error('Please sign in to comment');
        throw new Error('unauthorized');
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      const serverItem = { user: username, text };
      setComments((prev) => ({
        ...prev,
        [videoId]: (prev[videoId] || []).map((c, i, arr) => (i === arr.length - 1 ? serverItem : c)),
      }));
    } catch {
      setComments((prev) => ({
        ...prev,
        [videoId]: (prev[videoId] || []).filter((c, i, arr) => !(i === arr.length - 1 && c === optimistic)),
      }));
    }
  };

  // ---------- LOAD VIDEOS ----------
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/media?type=video&scope=library", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load videos");
        const data = await res.json();
        const items: Video[] = (data?.items || []).map((m: any, i: number) => ({
          _id: m._id || String(i),
          title: m.title || "Untitled",
          src: m.src,
          description: m.description || "No description available",
        }));
        setVideos(items);
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Bulk load likes after videos fetched
  useEffect(() => {
    const ids = (videos || [])
      .map((v) => v._id)
      .filter((id): id is string => typeof id === 'string');
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
        setLikes(data.counts || {});
        setUserLiked(data.liked || {});
      } catch {}
    })();
  }, [videos]);

  // ---------- SORTED / FILTERED LIST ----------
  const sortedVideos = useMemo(() => {
    if (!searchTerm.trim()) return videos;
    const lower = searchTerm.toLowerCase();
    const matches = videos.filter((v) => v.title.toLowerCase().includes(lower));
    const nonMatches = videos.filter(
      (v) => !v.title.toLowerCase().includes(lower)
    );
    return [...matches, ...nonMatches];
  }, [searchTerm, videos]);

  const hasMatches = useMemo(() => {
    if (!searchTerm.trim()) return true;
    return videos.some((v) =>
      v.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, videos]);

  // ---------- DOWNLOAD ----------
  const handleDownload = (item: { title: string; src: string }) => {
    toast.info(
      <div className="text-center">
        <p className="mb-2 text-sm font-medium">
          Download <strong>{item.title}</strong>?
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => {
              fetch(item.src)
                .then((res) => res.blob())
                .then((blob) => {
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = item.title;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  window.URL.revokeObjectURL(url);
                  toast.success("✅ Download started!");
                  toast.dismiss();
                })
                .catch(() => toast.error("❌ Failed to download"));
            }}
            className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 transition"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 transition"
          >
            No
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false }
    );
  };

  // ---------- RENDER ----------
  return (
    <div className="pt-20 pb-10 min-h-screen bg-[#f3edd7]">
      <ToastContainer />
      <UserHeader />

      {/* Search */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search videos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 rounded-md border border-gray-300 w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <SectionHeader title="videos" />

      {loading && (
        <div className="text-center text-gray-600 mt-10">Loading...</div>
      )}
      {!loading && error && (
        <div className="text-center text-red-600 mt-10">{error}</div>
      )}

      {!loading && !error && !hasMatches ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-red-600 font-semibold text-lg mt-10"
        >
          404 — No results found for{" "}
          <span className="font-semibold">&quot;{searchTerm}&quot;</span>
        </motion.div>
      ) : (
        <>
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 px-6"
          >
            <AnimatePresence>
              {sortedVideos.slice(0, visibleVideos).map((video, idx) => {
                const key = video._id || String(idx);
                const liked = userLiked[key] || false;
                const likeCount = likes[key] || 0;

                return (
                  <motion.div
                    key={key}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white shadow rounded-xl overflow-hidden"
                  >
                    <div className="relative">
                      <video
                        src={video.src}
                        className="w-full h-40 object-cover"
                        muted
                        preload="none"
                      />
                      <PlayCircle className="absolute inset-0 m-auto text-white w-10 h-10 opacity-70" />
                    </div>

                    {/* Title + Description */}
                    <p className="p-2 text-sm font-medium text-center">
                      {video.title}
                    </p>
                    <p className="px-2 text-xs text-gray-500 text-center">
                      {video.description}
                    </p>

                    {/* Likes + Comments Button */}
                    <div className="flex justify-center gap-4 items-center py-2">
                      <button
                        onClick={() => toggleLike(key)}
                        className="flex items-center gap-1 text-sm"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            liked
                              ? "fill-red-500 text-red-500"
                              : "text-gray-400"
                          }`}
                        />
                        <span>{likeCount}</span>
                      </button>

                      <button
                        onClick={() => setActiveCommentVideo(key)}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>
                          {comments[key]?.length || 0} Comment
                          {(comments[key]?.length || 0) !== 1 && "s"}
                        </span>
                      </button>
                    </div>

                    {/* Watch + Download */}
                    <div className="flex justify-center gap-3 pb-3">
                      <button
                        onClick={() => setSelectedVideo(video.src)}
                        className="px-3 py-1 text-sm border rounded-md hover:shadow-md"
                      >
                        Watch
                      </button>
                      <button
                        onClick={() => handleDownload(video)}
                        className="px-3 py-1 text-sm border rounded-md hover:shadow-md"
                      >
                        Download
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          <ViewMoreButton
            visibleCount={visibleVideos}
            totalCount={sortedVideos.length}
            setVisible={setVisibleVideos}
          />
        </>
      )}

      {/* ---------- Comment Popup ---------- */}
      <AnimatePresence>
        {activeCommentVideo && (
          <motion.div
            key="comments"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-lg w-full max-w-md p-4 shadow-lg relative"
            >
              <button
                onClick={() => setActiveCommentVideo(null)}
                className="absolute top-2 right-2 text-gray-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-semibold mb-2 text-center">
                Comments
              </h3>

              <div className="max-h-64 overflow-y-auto border rounded-md p-2 mb-3 text-sm">
                {(comments[activeCommentVideo] || []).length === 0 ? (
                  <p className="text-gray-400 text-center">
                    No comments yet. Be the first!
                  </p>
                ) : (
                  comments[activeCommentVideo].map((c, i) => (
                    <p key={i} className="mb-1">
                      <span className="font-semibold">{c.user}: </span>
                      {c.text}
                    </p>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment[activeCommentVideo] || ""}
                  onChange={(e) =>
                    setNewComment((prev) => ({
                      ...prev,
                      [activeCommentVideo]: e.target.value,
                    }))
                  }
                  className="flex-1 border rounded-md px-2 py-1 text-sm focus:outline-none"
                />
                <button
                  onClick={() => handleAddComment(activeCommentVideo, "User1")}
                  className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm"
                >
                  Post
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- Video Modal ---------- */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative w-full max-w-2xl"
            >
              <video
                src={selectedVideo}
                controls
                className="w-full max-h-[70vh] rounded-lg object-contain"
              />
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-2 right-2 bg-white/80 rounded-full p-2"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- REUSABLE COMPONENTS ----------
function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center mt-12">
      {title}
    </h2>
  );
}

function ViewMoreButton({
  visibleCount,
  totalCount,
  setVisible,
}: {
  visibleCount: number;
  totalCount: number;
  setVisible: React.Dispatch<React.SetStateAction<number>>;
}) {
  const handleToggle = () => {
    if (visibleCount < totalCount) setVisible((v) => v + 4);
    else setVisible(4);
  };
  return (
    <div className="flex justify-center mt-6">
      <button
        onClick={handleToggle}
        className="px-5 py-2 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition"
      >
        {visibleCount < totalCount ? "View More" : "Hide"}
      </button>
    </div>
  );
}
