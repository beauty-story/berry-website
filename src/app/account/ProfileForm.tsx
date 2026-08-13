"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ProfileFormProps = {
  userId: string;
  initialName: string;
  initialPhone: string | null;
};

export default function ProfileForm({
  userId,
  initialName,
  initialPhone,
}: ProfileFormProps) {
  const supabase = createClient();

  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone ?? "");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      setError(
        "Enter a valid 10-digit Indian phone number."
      );
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        phone: phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    setIsLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Profile updated successfully.");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-5"
    >
      <div>
        <label
          htmlFor="fullName"
          className="text-sm font-medium text-gray-700"
        >
          Full Name
        </label>

        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="text-sm font-medium text-gray-700"
        >
          Phone Number
        </label>

        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="9876543210"
          maxLength={10}
          className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      {message && (
        <p className="text-sm text-green-700">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {isLoading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}