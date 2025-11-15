"use client";

import { useState } from "react";
import Image from "next/image";

interface ProfileData {
  fullName: string;
  email: string;
  password: string;
  location: string;
  avatar: string;
}

export default function EditProfile() {
  const [profile, setProfile] = useState<ProfileData>({
    fullName: "Dor Alex",
    email: "alexd@gmail.com",
    password: "",
    location: "TLV, Israel",
    avatar: "/avatar.jpg", // Replace with actual path or user avatar
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated profile:", profile);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg"
      >
        <h2 className="mb-6 text-center text-xl font-semibold text-gray-800">
          Edit Profile
        </h2>

        {/* Avatar */}
        <div className="relative mx-auto mb-6 h-24 w-24">
          <Image
            src={profile.avatar}
            alt="Avatar"
            fill
            className="rounded-full object-cover"
          />
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-green-500 text-white shadow-md hover:bg-green-600"
          >
            ✏️
          </label>
          <input
            id="avatar-upload"
            type="file"
            className="hidden"
            accept="image/*"
          />
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Full name</label>
            <input
              type="text"
              name="fullName"
              value={profile.fullName}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-gray-800 focus:border-green-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-gray-800 focus:border-green-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Password</label>
            <input
              type="password"
              name="password"
              value={profile.password}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-gray-800 focus:border-green-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Location</label>
            <input
              type="text"
              name="location"
              value={profile.location}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-gray-800 focus:border-green-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            className="rounded-full border border-gray-300 px-6 py-2 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-green-500 px-6 py-2 text-white shadow-md hover:bg-green-600"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
