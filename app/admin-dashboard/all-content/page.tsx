"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import AdminHeader from "@/components/ui/admin-header";
import AdminSidebar from "@/components/ui/admin-sidebar";
import AdminNav from "@/components/ui/admin-nav";
import {
  FileText,
  ImageIcon,
  Video,
  Trash2,
  Save,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type MediaType = "image" | "video" | "pdf";
type MediaScope = "dashboard" | "library";

interface MediaItem {
  _id: string;
  title: string;
  type: MediaType;
  src: string;
  scope?: MediaScope;
  createdAt?: string;
}

export default function AllContentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | MediaType>("all");
  const [scopeFilter, setScopeFilter] = useState<"all" | MediaScope>("all");

  const [editing, setEditing] = useState<
    Record<string, { title: string; scope: MediaScope }>
  >({});

  const loadRef = useRef(0);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      // fetch all (no type/scope param)
      const res = await fetch("/api/media", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load media");
      const data = await res.json();
      const mapped: MediaItem[] = (data?.items || []).map((m: any) => ({
        _id: String(m._id),
        title: m.title || "Untitled",
        type: m.type as MediaType,
        src: m.src,
        scope: (m.scope as MediaScope) || "library",
        createdAt: m.createdAt,
      }));
      setItems(mapped);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRef.current += 1;
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (typeFilter !== "all" && it.type !== typeFilter) return false;
      if (scopeFilter !== "all" && (it.scope || "library") !== scopeFilter)
        return false;
      if (!q) return true;
      return (
        it.title.toLowerCase().includes(q) || it.src.toLowerCase().includes(q)
      );
    });
  }, [items, search, typeFilter, scopeFilter]);

  const beginEdit = (it: MediaItem) => {
    setEditing((prev) => ({
      ...prev,
      [it._id]: {
        title: it.title,
        scope: (it.scope || "library") as MediaScope,
      },
    }));
  };
  const cancelEdit = (id: string) => {
    setEditing((prev) => {
      const cp = { ...prev };
      delete cp[id];
      return cp;
    });
  };
  const saveEdit = async (id: string) => {
    const payload = editing[id];
    if (!payload) return;
    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: payload.title, scope: payload.scope }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setItems((prev) =>
        prev.map((x) =>
          x._id === id
            ? { ...x, title: data.item.title, scope: data.item.scope }
            : x
        )
      );
      cancelEdit(id);
      toast.success("Saved");
    } catch (e: any) {
      toast.error("Failed to save");
      console.error(e);
    }
  };
  const doDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      setItems((prev) => prev.filter((x) => x._id !== id));
      toast.success("Deleted");
    } catch (e: any) {
      toast.error("Failed to delete");
      console.error(e);
    }
  };
  const removeItem = (id: string) => {
    const tid = toast.custom(
      (t) => (
        <div className="bg-white dark:bg-gray-900 border rounded-md p-4 shadow flex flex-col gap-3 w-[320px]">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Delete this item? This action cannot be undone.
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => toast.dismiss(t)}
              className="px-3 py-1 text-sm border rounded"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                await doDelete(id);
                toast.dismiss(t);
              }}
              className="px-3 py-1 text-sm border rounded bg-red-600 text-white"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: 60000 }
    );
    return tid;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3edd7] dark:bg-gray-950 font-inter">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              All Content
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={load}
                className="px-3 py-2 rounded-md border bg-white hover:bg-gray-100 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
          </div>

<div className="flex flex-col gap-3 mb-4">
  {/* SEARCH INPUT */}
  <input
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search by title or path"
    className="px-3 py-2 rounded-md border bg-white"
  />

  {/* ROW: TYPE + SCOPE */}
  <div className="flex gap-3">
    {/* TYPE FILTER */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="justify-between flex-1 w-full flex items-center"
        >
          <span>
            {typeFilter === "all"
              ? "All types"
              : typeFilter === "image"
              ? "Images"
              : typeFilter === "video"
              ? "Videos"
              : "PDFs"}
          </span>
          <ChevronDown className="w-4 h-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[180px]">
        <DropdownMenuItem onClick={() => setTypeFilter("all")}>
          All types
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTypeFilter("image")}>
          Images
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTypeFilter("video")}>
          Videos
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTypeFilter("pdf")}>
          PDFs
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    {/* SCOPE FILTER */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="justify-between flex-1 w-full flex items-center"
        >
          <span>
            {scopeFilter === "all"
              ? "All scopes"
              : scopeFilter === "dashboard"
              ? "Dashboard"
              : "Library (Pages)"}
          </span>
          <ChevronDown className="w-4 h-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[180px]">
        <DropdownMenuItem onClick={() => setScopeFilter("all")}>
          All scopes
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setScopeFilter("dashboard")}>
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setScopeFilter("library")}>
          Library (Pages)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</div>

          {loading ? (
            <div className="text-center text-gray-600">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((it) => {
                const ed = editing[it._id];
                return (
                  <div
                    key={it._id}
                    className="bg-white rounded-lg shadow border overflow-hidden flex flex-col"
                  >
                    <div className="h-40 bg-gray-100 flex items-center justify-center">
                      {it.type === "image" ? (
                        <img
                          src={it.src}
                          alt={it.title}
                          className="w-full h-full object-cover"
                        />
                      ) : it.type === "video" ? (
                        <div className="w-full h-full flex items-center justify-center bg-black/80 text-white">
                          <Video className="w-10 h-10 opacity-80" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-10 h-10 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex-1 flex flex-col gap-2">
                      {!ed ? (
                        <>
                          <div className="text-sm font-semibold text-gray-900 break-words">
                            {it.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {it.type.toUpperCase()} ·{" "}
                            {(it.scope || "library").toUpperCase()}
                          </div>
                          <div className="text-[11px] text-gray-400 break-all">
                            {it.src}
                          </div>
                        </>
                      ) : (
                        <>
                          <input
                            value={ed.title}
                            onChange={(e) =>
                              setEditing((p) => ({
                                ...p,
                                [it._id]: {
                                  ...p[it._id],
                                  title: e.target.value,
                                },
                              }))
                            }
                            className="px-2 py-1 border rounded"
                          />
                          <select
                            value={ed.scope}
                            onChange={(e) =>
                              setEditing((p) => ({
                                ...p,
                                [it._id]: {
                                  ...p[it._id],
                                  scope: e.target.value as MediaScope,
                                },
                              }))
                            }
                            className="px-2 py-1 border rounded"
                          >
                            <option value="dashboard">Dashboard</option>
                            <option value="library">Library</option>
                          </select>
                        </>
                      )}
                    </div>
                    <div className="p-3 flex items-center justify-end gap-2 border-t">
                      {!ed ? (
                        <>
                          <button
                            onClick={() => beginEdit(it)}
                            className="px-3 py-1 text-sm border rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => removeItem(it._id)}
                            className="px-3 py-1 text-sm border rounded text-red-600 flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => saveEdit(it._id)}
                            className="px-3 py-1 text-sm border rounded text-green-700 flex items-center gap-1"
                          >
                            <Save className="w-4 h-4" /> Save
                          </button>
                          <button
                            onClick={() => cancelEdit(it._id)}
                            className="px-3 py-1 text-sm border rounded"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full text-center text-gray-600">
                  No items found.
                </div>
              )}
            </div>
          )}
        </main>

        <AdminNav />
      </div>
    </div>
  );
}
