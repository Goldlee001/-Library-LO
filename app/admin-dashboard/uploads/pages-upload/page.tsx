"use client";

import React, { useState, useRef } from "react";
import { toast } from "sonner";
import AdminHeader from "@/components/ui/admin-header";
import AdminSidebar from "@/components/ui/admin-sidebar";
import AdminNav from "@/components/ui/admin-nav";

interface FileItem {
  file: File;
  title: string;
  description: string;
}

export default function UploadPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputIdRef = useRef<string>(`pages-file-input-${Math.random().toString(36).slice(2)}`);

  const handleFiles = (selectedFiles: FileList) => {
    const newFiles: FileItem[] = Array.from(selectedFiles).map((file) => ({
      file,
      title: file.name,
      description: "",
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleDescriptionChange = (index: number, value: string) => {
    setFiles((prev) => {
      const updated = [...prev];
      updated[index].description = value;
      return updated;
    });
  };

  const handleTitleChange = (index: number, value: string) => {
    setFiles((prev) => {
      const updated = [...prev];
      updated[index].title = value;
      return updated;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    const missing = files.find((f) => !f.title || !f.title.trim());
    if (missing) {
      toast.error("Please enter a title for all files");
      return;
    }
    try {
      setUploading(true);
      for (const item of files) {
        const fd = new FormData();
        fd.append("file", item.file);
        fd.append("title", item.title?.trim() || item.file.name);
        if (item.description) fd.append("description", item.description);
        fd.append("scope", "library");
        const mime = item.file.type || "";
        let type: "video" | "image" | "pdf" | null = null;
        if (mime.startsWith("image/")) type = "image";
        else if (mime.startsWith("video/")) type = "video";
        else if (mime === "application/pdf") type = "pdf";
        if (!type) {
          toast.error(`Unsupported file type: ${mime || item.file.name}`);
          continue;
        }
        fd.append("type", type);

        const res = await fetch("/api/admin/uploads", { method: "POST", body: fd });
        if (!res.ok) {
          const t = await res.text();
          toast.error(`Failed to upload ${item.file.name}: ${t || res.status}`);
          continue;
        }
        await res.json();
        toast.success(`Uploaded ${item.file.name}`);
      }
      setFiles([]);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3edd7] dark:bg-gray-950 font-inter">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
            Upload your files
          </h1>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:border-blue-400 transition-colors bg-white dark:bg-gray-900"
          >
            <div className="text-blue-500 mb-2 text-4xl">⬆️</div>
            <p className="text-gray-600 dark:text-gray-300 mb-2">Drag & Drop your files or</p>
            <label
              onClick={(e) => e.stopPropagation()}
              htmlFor={inputIdRef.current}
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
            >
              Browse File
            </label>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*,video/*,application/pdf"
              id={inputIdRef.current}
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
            />
            <p className="text-gray-400 text-sm mt-2">Files should be jpg, png, or pdf</p>
          </div>

          {files.length > 0 && (
            <div className="mt-6 space-y-4">
              {files.map((item, idx) => (
                <div key={idx} className="border p-4 rounded bg-white dark:bg-gray-900 space-y-2">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{item.file.name}</p>
                  <input
                    type="text"
                    placeholder="Enter title"
                    value={item.title}
                    onChange={(e) => handleTitleChange(idx, e.target.value)}
                    className="w-full border rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-200"
                  />
                  <input
                    type="text"
                    placeholder="Enter description"
                    value={item.description}
                    onChange={(e) => handleDescriptionChange(idx, e.target.value)}
                    className="w-full border rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-200"
                  />
                </div>
              ))}
            </div>
          )}

          {files.length > 0 && (
            <button disabled={uploading} onClick={handleUpload} className={`mt-6 w-full text-white px-4 py-2 rounded ${uploading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          )}
        </main>

        <AdminNav />
      </div>
    </div>
  );
}
