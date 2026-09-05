import React, { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {
  User as UserIcon,
  Camera,
  Shield,
  Twitter,
  Link,
  Lock,
  FileCode,
  Youtube,
  Coffee,
  Globe,
} from "lucide-react";
import { User, UserIdentity } from "@supabase/supabase-js";

import Loader from "../UI/Loader";
import TwoFactorSetup from "../Profile/Security/TwoFactorSetup";
import { updateUserSchema, UpdateUserFormValues } from "../../schemas/user";
import {
  useUpdateProfile,
  useUpdatePassword,
} from "../../hooks/useAccountData";

interface ProfileSettingsProps {
  user: User;
  mcUsername: string;
  discordIdentity?: UserIdentity;
  twitchIdentity?: UserIdentity;
  showToast: (message: string, type: "success" | "error" | "info") => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  user,
  mcUsername,
  discordIdentity,
  twitchIdentity,
  showToast,
}) => {
  const { t, i18n } = useTranslation();

  // Mutations (TanStack Query)
  const { mutate: updateProfile, isPending: isSavingProfile } =
    useUpdateProfile();
  const { mutate: changePassword, isPending: isUpdatingPassword } =
    useUpdatePassword();

  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [publicStats, setPublicStats] = useState(
    user?.user_metadata?.public_stats !== false,
  );

  const { register, handleSubmit, setValue, control } =
    useForm<UpdateUserFormValues>({
      resolver: zodResolver(updateUserSchema),
      defaultValues: {
        bio: user?.user_metadata?.bio || "",
        social_discord: user?.user_metadata?.social_discord || "",
        social_twitter: user?.user_metadata?.social_twitter || "",
        social_twitch: user?.user_metadata?.social_twitch || "",
        social_youtube: user?.user_metadata?.social_youtube || "",
        social_kofi: user?.user_metadata?.social_kofi || "",
        avatar_preference:
          user?.user_metadata?.avatar_preference || "minecraft",
        profile_banner_url: user?.user_metadata?.profile_banner_url || "",
        status_message: user?.user_metadata?.status_message || "",
        notify_events: user?.user_metadata?.notify_events ?? true,
        notify_mentions: user?.user_metadata?.notify_mentions ?? true,
      },
    });

  const avatarPreference = useWatch({ control, name: "avatar_preference" });
  const bannerUrl = useWatch({ control, name: "profile_banner_url" });
  const bioValue = useWatch({ control, name: "bio" });
  const notifyEvents = useWatch({ control, name: "notify_events" });
  const notifyMentions = useWatch({ control, name: "notify_mentions" });

  useEffect(() => {
    if (!user) return;

    if (discordIdentity) {
      const name =
        discordIdentity.identity_data?.full_name ||
        discordIdentity.identity_data?.name ||
        discordIdentity.identity_data?.user_name;
      if (name && !user.user_metadata?.social_discord) {
        setValue("social_discord", name);
      }
    }

    if (twitchIdentity) {
      const name =
        twitchIdentity.identity_data?.name ||
        twitchIdentity.identity_data?.login;
      if (name && !user.user_metadata?.social_twitch) {
        setValue("social_twitch", `https://twitch.tv/${name}`);
      }
    }
  }, [discordIdentity, twitchIdentity, user, setValue]);

  const handleUpdatePassword = () => {
    if (passwords.new !== passwords.confirm)
      return showToast(
        t("account.settings.password_mismatch", "Las contraseñas no coinciden"),
        "error",
      );
    if (passwords.new.length < 6)
      return showToast(
        t("account.settings.password_min", "Mínimo 6 caracteres"),
        "error",
      );

    changePassword(passwords.new, {
      onSuccess: () => {
        showToast(
          t("account.settings.success_password", "¡Contraseña actualizada!"),
          "success",
        );
        setPasswords({ new: "", confirm: "" });
      },
      onError: (err: Error) => {
        showToast(
          t("common.save_error", "Error al guardar") + ": " + err.message,
          "error",
        );
      },
    });
  };

  const handlePrivacyToggle = () => {
    const newVal = !publicStats;
    setPublicStats(newVal);
    updateProfile(
      { public_stats: newVal },
      {
        onError: () => {
          setPublicStats(!newVal); // Rollback on error
          showToast(
            t(
              "account.settings.error_privacy",
              "Error al actualizar privacidad",
            ),
            "error",
          );
        },
      },
    );
  };

  const handleSaveProfile = (data: UpdateUserFormValues) => {
    updateProfile(data as Record<string, unknown>, {
      onSuccess: () => {
        showToast(
          t(
            "account.settings.success_profile",
            "Perfil actualizado correctamente",
          ),
          "success",
        );
      },
      onError: () => {
        showToast(
          t("account.settings.error_profile", "Error al guardar el perfil"),
          "error",
        );
      },
    });
  };

  return (
    <div className="animate-fade-in space-y-10 pb-20">
      <h2 className="mb-8 border-b border-white/5 pb-4 text-2xl font-black uppercase tracking-tighter text-white">
        {t("account.settings.title", "Configuración")}
      </h2>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        {/* Profile Header Settings */}
        <div className="space-y-8 xl:col-span-2">
          {/* Avatar Preference */}
          <div className="bg-white/2 rounded-4xl space-y-6 border border-white/5 p-8">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
              {t("account.settings.avatar_pref", "Preferencia de Avatar")}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setValue("avatar_preference", "minecraft")}
                className={`flex items-center gap-4 rounded-2xl border p-5 transition-colors ${avatarPreference === "minecraft" ? "bg-(--accent)/10 border-(--accent)/40 shadow-(--accent)/5 shadow-lg" : "bg-white/2 border-white/5 hover:border-white/10 hover:bg-white/5"}`}
              >
                <img
                  src={`https://mc-heads.net/avatar/${mcUsername}/64`}
                  alt="MC"
                  className="h-12 w-12 rounded-xl object-contain [image-rendering:pixelated]"
                />
                <div className="text-left">
                  <span
                    className={`block text-xs font-black uppercase tracking-widest ${avatarPreference === "minecraft" ? "text-(--accent)" : "text-gray-400"}`}
                  >
                    {t("account.settings.mc_head", "Minecraft Head")}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-gray-600">
                    {mcUsername}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setValue("avatar_preference", "social")}
                className={`flex items-center gap-4 rounded-2xl border p-5 transition-colors ${avatarPreference === "social" ? "bg-(--accent)/10 border-(--accent)/40 shadow-(--accent)/5 shadow-lg" : "bg-white/2 border-white/5 hover:border-white/10 hover:bg-white/5"}`}
              >
                <img
                  src={
                    user?.user_metadata?.picture ||
                    user?.user_metadata?.avatar_url ||
                    "https://ui-avatars.com/api/?name=" +
                      (user?.user_metadata?.full_name || "User")
                  }
                  alt="Social"
                  className="h-12 w-12 rounded-xl object-cover"
                />
                <div className="text-left">
                  <span
                    className={`block text-xs font-black uppercase tracking-widest ${avatarPreference === "social" ? "text-(--accent)" : "text-gray-400"}`}
                  >
                    {t("account.settings.social_web", "Social / Web")}
                  </span>
                  <span className="max-w-30 truncate text-[10px] font-bold uppercase text-gray-600">
                    {user?.user_metadata?.full_name}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Profile Banner */}
          <div className="bg-white/2 rounded-4xl space-y-6 border border-white/5 p-8">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
              {t("account.settings.banner", "Banner del Perfil")}
            </div>

            <div className="group/banner relative flex h-48 w-full items-center justify-center overflow-hidden rounded-3xl border border-white/5 bg-black/40">
              {bannerUrl ? (
                <>
                  <img
                    src={bannerUrl}
                    alt="Banner Preview"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover/banner:scale-105"
                  />
                  <div className="bg-linear-to-t absolute inset-0 from-black/60 via-transparent to-transparent" />
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 text-gray-700">
                  <Camera className="text-4xl opacity-20" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {t("account.settings.no_banner", "Sin Banner")}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <div className="group/input relative flex-1">
                <div className="group-hover/input:text-(--accent) pointer-events-none absolute inset-y-0 left-5 flex items-center text-gray-500 transition-colors">
                  <Link className="text-xs" />
                </div>
                <input
                  aria-label="Input field"
                  {...register("profile_banner_url")}
                  placeholder={t(
                    "account.settings.banner_placeholder",
                    "URL de la imagen (ej: https://imgur.com/...)",
                  )}
                  className="bg-white/2 focus:border-(--accent)/40 w-full rounded-2xl border border-white/5 py-4 pl-12 pr-6 text-sm font-bold text-white shadow-inner transition-colors placeholder:text-gray-700 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Community Settings (Filler for layout balance) */}
          <div className="bg-white/2 rounded-4xl space-y-6 border border-white/5 p-8">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
              {t(
                "account.settings.community_pref",
                "Preferencias de Comunidad",
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Status Message */}
              <div className="space-y-2">
                <label
                  htmlFor="profile-status-msg"
                  className="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-600"
                >
                  {t(
                    "account.settings.status_msg",
                    "Mensaje de Estado (Corto)",
                  )}
                </label>
                <div className="group/status relative">
                  <div className="group-focus-within/status:text-(--accent) pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-500 transition-colors">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  </div>
                  <input
                    id="profile-status-msg"
                    {...register("status_message")}
                    placeholder={t(
                      "account.settings.status_placeholder",
                      "Ej: Explorando el End...",
                    )}
                    className="w-full rounded-2xl border border-white/5 bg-black/20 py-4 pl-10 pr-4 text-xs font-bold text-white transition-colors placeholder:text-gray-700 focus:border-white/20 focus:outline-none"
                  />
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="space-y-4">
                <div className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-widest text-gray-600">
                  {t("account.settings.notifications", "Notificaciones")}
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setValue("notify_events", !notifyEvents, {
                        shouldDirty: true,
                      })
                    }
                    className="group flex items-center justify-between rounded-xl border border-white/5 bg-black/20 p-3 transition-colors hover:bg-white/5"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 transition-colors group-hover:text-gray-200">
                      {t("account.settings.notify_events", "Eventos Globales")}
                    </span>
                    <div
                      className={`relative h-4 w-8 rounded-full transition-colors duration-300 ${notifyEvents ? "bg-green-500/20" : "bg-white/10"}`}
                    >
                      <div
                        className={`absolute top-0.5 h-3 w-3 rounded-full shadow-sm transition-colors duration-300 ${notifyEvents ? "left-4 bg-green-500" : "left-1 bg-gray-400"}`}
                      />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setValue("notify_mentions", !notifyMentions, {
                        shouldDirty: true,
                      })
                    }
                    className="group flex items-center justify-between rounded-xl border border-white/5 bg-black/20 p-3 transition-colors hover:bg-white/5"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 transition-colors group-hover:text-gray-200">
                      {t(
                        "account.settings.notify_mentions",
                        "Menciones / Respuestas",
                      )}
                    </span>
                    <div
                      className={`relative h-4 w-8 rounded-full transition-colors duration-300 ${notifyMentions ? "bg-green-500/20" : "bg-white/10"}`}
                    >
                      <div
                        className={`absolute top-0.5 h-3 w-3 rounded-full shadow-sm transition-colors duration-300 ${notifyMentions ? "left-4 bg-green-500" : "left-1 bg-gray-400"}`}
                      />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings (Left Column) */}
        <div className="space-y-8">
          {/* Privacy */}
          <div className="bg-white/2 rounded-4xl space-y-6 border border-white/5 p-8">
            <div className="text-(--accent) flex items-center gap-4">
              <Shield className="text-xl" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">
                {t("account.settings.privacy", "Privacidad")}
              </h3>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-black/20 p-4">
              <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-widest text-white">
                  {t("account.settings.public_stats", "Público")}
                </p>
                <p className="text-[10px] font-bold leading-tight text-gray-600">
                  {t(
                    "account.settings.public_stats_desc",
                    "Estadísticas visibles.",
                  )}
                </p>
              </div>
              <button
                aria-label="Action"
                type="button"
                onClick={handlePrivacyToggle}
                className={`relative h-7 w-14 shrink-0 rounded-full transition-colors duration-300 ${publicStats ? "bg-linear-to-r from-(--accent) to-(--accent)/80 shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]" : "border border-white/10 bg-black/50"}`}
              >
                <div
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-colors duration-300 ${publicStats ? "left-8" : "left-1 opacity-50"}`}
                />
              </button>
            </div>
          </div>

          {/* Language Settings */}
          <div className="bg-white/2 rounded-4xl space-y-6 border border-white/5 p-8">
            <div className="text-(--accent) flex items-center gap-4">
              <Globe className="text-xl" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">
                {t("account.settings.language", "Idioma / Language")}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => i18n.changeLanguage("es")}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-colors ${i18n.language?.startsWith("es") ? "bg-(--accent)/10 border-(--accent)/40 shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)]" : "border-white/5 bg-black/20 hover:border-white/10 hover:bg-white/5"}`}
              >
                <span className="text-2xl">🇪🇸</span>
                <span
                  className={`text-[10px] font-black uppercase tracking-widest ${i18n.language?.startsWith("es") ? "text-(--accent)" : "text-gray-500"}`}
                >
                  Español
                </span>
              </button>

              <button
                type="button"
                onClick={() => i18n.changeLanguage("en")}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-colors ${i18n.language?.startsWith("en") ? "bg-(--accent)/10 border-(--accent)/40 shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)]" : "border-white/5 bg-black/20 hover:border-white/10 hover:bg-white/5"}`}
              >
                <span className="text-2xl">🇺🇸</span>
                <span
                  className={`text-[10px] font-black uppercase tracking-widest ${i18n.language?.startsWith("en") ? "text-(--accent)" : "text-gray-500"}`}
                >
                  English
                </span>
              </button>
            </div>
          </div>

          {/* Social Links Section (Moved Here) */}
          <div className="bg-white/2 rounded-4xl space-y-6 border border-white/5 p-8">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
              {t("account.settings.social_links", "Redes Sociales")}
            </div>

            <div className="space-y-4">
              {[
                {
                  id: "social_discord",
                  icon: (props: React.SVGProps<SVGSVGElement>) => (
                    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.37.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  ),
                  color: "#5865F2",
                  label: "Discord",
                },
                {
                  id: "social_twitter",
                  icon: Twitter,
                  color: "#1da1f2",
                  label: "Twitter",
                },
                {
                  id: "social_youtube",
                  icon: Youtube,
                  color: "#ff0000",
                  label: "YouTube",
                },
                {
                  id: "social_twitch",
                  icon: (props: React.SVGProps<SVGSVGElement>) => (
                    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
                      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                    </svg>
                  ),
                  color: "#9146FF",
                  label: "Twitch",
                },
                {
                  id: "social_kofi",
                  icon: Coffee,
                  color: "#00AF96",
                  label: "Ko-Fi",
                },
              ].map((item) => (
                <div key={item.id} className="group/social relative">
                  <div
                    className="pointer-events-none absolute inset-y-0 left-5 flex items-center transition-transform group-focus-within/social:scale-110"
                    style={{ color: item.color }}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  <input
                    aria-label="Input field"
                    {...register(
                      item.id as keyof UpdateUserFormValues & string,
                    )}
                    autoComplete="off"
                    placeholder={item.label}
                    className="w-full rounded-2xl border border-white/5 bg-black/20 py-4 pl-12 pr-4 text-xs font-bold text-white transition-colors placeholder:text-gray-700 focus:border-white/20 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Profile Form & Security */}
        <div className="xl:col-span-3">
          <form
            onSubmit={handleSubmit(handleSaveProfile)}
            className="grid grid-cols-1 gap-8 lg:grid-cols-2"
          >
            {/* Bio Section */}
            <div className="bg-white/2 rounded-4xl flex h-full flex-col space-y-6 border border-white/5 p-8 lg:row-span-2">
              <label
                htmlFor="profile-bio"
                className="text-xs font-black uppercase tracking-[0.2em] text-gray-500"
              >
                {t("account.settings.bio_label", "Biografía")}
              </label>
              <div className="relative flex-1">
                <textarea
                  id="profile-bio"
                  {...register("bio")}
                  rows={10}
                  maxLength={500}
                  placeholder={t(
                    "account.settings.bio_ph",
                    "Cuenta tu historia...",
                  )}
                  className="min-h-50 focus:border-(--accent)/40 scrollbar-thin scrollbar-thumb-white/5 h-full w-full resize-none rounded-3xl border border-white/5 bg-black/20 p-6 text-sm font-medium leading-relaxed text-gray-300 transition-colors placeholder:text-gray-700 focus:outline-none"
                />
                <div className="absolute bottom-4 right-4 rounded-lg bg-black/40 px-2 py-1 text-[10px] font-black text-gray-700 backdrop-blur-md">
                  {bioValue?.length || 0}/500
                </div>
              </div>
              <a
                href="https://www.markdownguide.org/cheat-sheet/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-(--accent) flex cursor-help items-center gap-2 px-2 text-[10px] font-black uppercase tracking-widest text-gray-600 transition-colors"
                title="**Negrita**, *Cursiva*, [Enlace](url), > Cita"
              >
                <FileCode className="text-lg opacity-50" />
                <span>
                  {t("account.settings.markdown_support", "Soporte Markdown")}
                </span>
              </a>
            </div>

            {/* Security Section (Right Column) */}
            <div className="flex h-full flex-col gap-8">
              {/* Password Change */}
              <div className="bg-white/2 rounded-4xl space-y-6 border border-white/5 p-8">
                <div className="flex items-center gap-4 text-red-400">
                  <Lock className="text-xl" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">
                    {t("account.settings.security", "Seguridad")}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="profile-new-password"
                      className="ml-2 text-[10px] font-black uppercase tracking-widest text-gray-600"
                    >
                      {t("account.settings.new_password", "Nueva Contraseña")}
                    </label>
                    <input
                      id="profile-new-password"
                      type="password"
                      value={passwords.new}
                      onChange={(e) =>
                        setPasswords({ ...passwords, new: e.target.value })
                      }
                      className="w-full rounded-2xl border border-white/5 bg-black/20 p-4 font-mono text-sm text-white transition-colors focus:border-red-500/30 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="profile-confirm-password"
                      className="ml-2 text-[10px] font-black uppercase tracking-widest text-gray-600"
                    >
                      {t("account.settings.confirm_password", "Confirmar")}
                    </label>
                    <input
                      id="profile-confirm-password"
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) =>
                        setPasswords({ ...passwords, confirm: e.target.value })
                      }
                      className="w-full rounded-2xl border border-white/5 bg-black/20 p-4 font-mono text-sm text-white transition-colors focus:border-red-500/30 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleUpdatePassword}
                    disabled={isUpdatingPassword}
                    className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30"
                  >
                    {isUpdatingPassword ? (
                      <Loader minimal />
                    ) : (
                      t(
                        "account.settings.update_password",
                        "Actualizar Password",
                      )
                    )}
                  </button>
                </div>
              </div>

              <TwoFactorSetup />

              {/* Save Button */}
              <div className="mt-auto pt-4">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="bg-linear-to-r from-(--accent) to-(--accent)/80 shadow-(--accent)/20 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 py-5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg transition-colors hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
                >
                  {isSavingProfile ? (
                    <Loader minimal />
                  ) : (
                    <>
                      <UserIcon className="text-lg" />{" "}
                      {t("account.settings.save_profile", "Actualizar Perfil")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
