"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { changePassword, updateProfile } from "./actions";

type ProfileRecord = {
  id: string;
  name: string | null;
  title: string | null;
  location: string | null;
  website: string | null;
  bio: string | null;
  image: string | null;
  email: string;
};

interface ProfileCardProps {
  profile: ProfileRecord;
}

type ProfileDraft = {
  fullName: string;
  title: string;
  location: string;
  website: string;
  bio: string;
  image: string;
};

export function ProfileCard({ profile }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [securityMessage, setSecurityMessage] = useState("");
  const [form, setForm] = useState<ProfileDraft>({
    fullName: profile.name ?? "",
    title: profile.title ?? "SEO Content Strategist",
    location: profile.location ?? "Remote",
    website: profile.website ?? "aurelia.example.com",
    bio: profile.bio ?? "I create polished, search-ready stories that balance clarity and performance.",
    image: profile.image ?? "",
  });

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({
        ...current,
        image: typeof reader.result === "string" ? reader.result : current.image,
      }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    try {
      const result = await updateProfile(profile.id, form);
      setForm(result.profile);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsChangingPassword(true);
    setSecurityMessage("");

    try {
      const result = await changePassword(profile.id, new FormData(event.currentTarget));
      setSecurityMessage(result.message);
      event.currentTarget.reset();
    } catch (error) {
      setSecurityMessage(error instanceof Error ? error.message : "Unable to update password");
    } finally {
      setIsChangingPassword(false);
    }
  }

  const displayName = form.fullName.trim() || profile.email;
  const avatarFallback = (displayName.slice(0, 2) || "PW").toUpperCase();

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Profile</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Writer profile</h1>
          <p className="mt-3 text-slate-600">Keep your account details, bio, publishing preferences, and profile photo in sync.</p>
        </div>
        <Button type="button" onClick={() => setIsEditing((value) => !value)} className="bg-cyan-600 text-white hover:bg-cyan-500">
          {isEditing ? "Cancel" : "Edit profile"}
        </Button>
      </div>

      <form onSubmit={handleSave} className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-start gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white">
              {form.image ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.image} alt={displayName} className="h-full w-full object-cover" />
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500 to-slate-900 text-lg font-semibold text-white">
                  {avatarFallback}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Profile photo</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">{displayName}</h2>
              <p className="mt-1 text-sm text-slate-600">Upload a photo or paste a URL to personalize your public profile.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {isEditing ? (
              <>
                <div>
                  <label className="text-sm font-medium text-slate-700">Full name</label>
                  <input
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Professional title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-slate-500">Full name</p>
                  <p className="mt-1 text-base font-medium text-slate-900">{form.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Professional title</p>
                  <p className="mt-1 text-base font-medium text-slate-900">{form.title}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Bio</p>
                  <p className="mt-1 text-base leading-7 text-slate-700">{form.bio}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">Profile settings</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Location</label>
              {isEditing ? (
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
                />
              ) : (
                <p className="mt-2 text-sm text-slate-700">{form.location}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Website</label>
              {isEditing ? (
                <input
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
                />
              ) : (
                <p className="mt-2 text-sm text-slate-700">{form.website}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Profile picture</label>
              {isEditing ? (
                <div className="mt-2 space-y-3">
                  <input
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="Paste an image URL or upload a file below"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, image: "" })}
                    className="text-sm font-medium text-slate-500 underline-offset-4 hover:text-slate-900 hover:underline"
                  >
                    Remove photo
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-700">{form.image ? "Photo uploaded" : "No photo uploaded yet"}</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Add notification preferences, preferred publishing cadence, or collaboration access in this section.
            </div>

            {isEditing ? (
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full bg-slate-900 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? "Saving changes..." : "Save changes"}
              </Button>
            ) : null}
          </div>
        </div>

      </form>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handlePasswordChange} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div>
            <p className="text-sm font-medium text-slate-700">Change password</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Use a strong password with uppercase, lowercase, number, and special character.</p>
          </div>
          <input
            name="currentPassword"
            type="password"
            placeholder="Current password"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
          />
          <input
            name="newPassword"
            type="password"
            placeholder="New password"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
          />
          {securityMessage ? <p className="text-sm text-slate-600">{securityMessage}</p> : null}
          <Button
            type="submit"
            disabled={isChangingPassword}
            className="w-full bg-slate-900 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isChangingPassword ? "Updating password..." : "Update password"}
          </Button>
        </form>
      </section>
    </div>
  );
}
