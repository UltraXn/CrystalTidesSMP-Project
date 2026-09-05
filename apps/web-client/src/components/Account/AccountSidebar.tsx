import React, { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Medal,
  X,
  LogOut,
  Trophy,
  LayoutDashboard,
  Camera,
  PenTool,
  MessageSquare,
  Shield,
  Link as LinkIcon,
  Settings,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { uploadImage } from "../../services/uploadService";
import { compressImage } from "../../utils/imageOptimizer";
import Loader from "../UI/Loader";
import { User } from "@supabase/supabase-js";
import { isAdmin as checkAdmin } from "../../utils/roleUtils";
import { useGachaBalance } from "../../hooks/useAccountData";

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton = ({ active, onClick, icon, label }: NavButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`group flex w-full items-center gap-4 rounded-2xl px-6 py-4 transition-colors ${active ? "bg-(--accent)/10 text-(--accent) shadow-(--accent)/5 shadow-lg" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
  >
    <span
      className={`text-lg transition-transform group-hover:scale-110 ${active ? "text-(--accent)" : "text-gray-500"}`}
      aria-hidden="true"
    >
      {icon}
    </span>
    <span className="text-xs font-black uppercase tracking-widest">
      {label}
    </span>
  </button>
);

interface AccountSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  statsData?: { username?: string };
  mcUsername: string;
  isLinked: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const AccountSidebar: React.FC<AccountSidebarProps> = ({
  activeTab,
  setActiveTab,
  user,
  statsData,
  mcUsername,
  isLinked,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const { logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [uploading, setUploading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = checkAdmin(user);
  const { data: authoritativeBalance } = useGachaBalance(user?.id);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const compressedBlob = await compressImage(file);

      // Server-validated upload (backend namespaces the file under user.id)
      const publicUrl = await uploadImage(compressedBlob, "avatars");
      await updateUser({ avatar_url: publicUrl });
    } catch (error) {
      console.error("Avatar upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleNameUpdate = async () => {
    if (!newName.trim()) return setIsEditingName(false);
    try {
      await updateUser({
        full_name: newName.trim(),
        username: newName.trim(),
      });
      setIsEditingName(false);
    } catch {
      alert(t("account.name.error_update"));
    }
  };

  const handleNav = (tab: string) => {
    setActiveTab(tab);
    if (onClose) onClose();
  };

  return (
    <aside
      className={`w-75 z-200 lg:rounded-4xl fixed inset-y-0 left-0 border border-white/10 bg-[#0a0a0a]/90 backdrop-blur-2xl transition-transform duration-500 lg:sticky lg:top-24 lg:z-50 lg:h-[calc(100vh-120px)] lg:translate-x-0 ${isOpen ? "translate-x-0 shadow-2xl shadow-black" : "-translate-x-full"}`}
    >
      <button
        aria-label={t("common.close", "Cerrar menú")}
        type="button"
        className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-gray-400 transition-colors hover:bg-white/10 lg:hidden"
        onClick={onClose}
      >
        <X size={18} />
      </button>

      <div className="flex h-full flex-col p-8">
        {/* User Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div
            className="group/avatar relative mb-5 cursor-pointer"
            onClick={handleAvatarClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleAvatarClick();
              }
            }}
          >
            <div className="bg-linear-to-tr from-(--accent)/40 ring-(--accent)/30 group-hover/avatar:ring-(--accent)/70 relative h-24 w-24 overflow-hidden rounded-full via-white/10 to-white/5 p-1 shadow-2xl ring-2 transition-colors duration-300">
              {uploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md">
                  <Loader minimal />
                </div>
              ) : (
                <img
                  src={
                    user?.user_metadata?.avatar_preference === "social" &&
                    user?.user_metadata?.avatar_url
                      ? user.user_metadata.avatar_url
                      : isLinked
                        ? `https://mc-heads.net/avatar/${statsData?.username || mcUsername}/128`
                        : "https://ui-avatars.com/api/?name=" +
                          (user?.user_metadata?.full_name || "User")
                  }
                  alt="Avatar"
                  className="h-full w-full rounded-full object-cover transition-transform duration-500 group-hover/avatar:scale-105"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity duration-300 group-hover/avatar:opacity-100">
                <Camera className="text-xl text-white" />
              </div>
            </div>
            <div className="group-hover/avatar:border-(--accent)/40 animate-spin-slow pointer-events-none absolute -inset-2 rounded-full border border-dashed border-white/10 transition-colors"></div>
          </div>

          <input
            aria-label={t("account.upload_avatar", "Subir avatar")}
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarUpload}
            className="hidden"
            accept="image/*"
          />

          <div className="space-y-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  aria-label={t("account.edit_name", "Editar nombre")}
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="focus:border-(--accent)/40 w-32 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-bold text-white focus:outline-none"
                />
                <button
                  aria-label={t("common.save", "Guardar")}
                  type="button"
                  onClick={handleNameUpdate}
                  className="bg-(--accent) shadow-(--accent)/20 rounded-lg p-2 text-[10px] font-black uppercase text-black shadow-lg"
                >
                  {t("common.save", "Guardar")}
                </button>
              </div>
            ) : (
              <h3 className="group/name flex items-center justify-center gap-2 text-lg font-black uppercase tracking-tighter text-white">
                {user?.user_metadata?.full_name || mcUsername}
                <PenTool
                  className="cursor-pointer text-[10px] text-gray-600 transition-colors group-hover/name:text-white"
                  onClick={() => {
                    setNewName(user?.user_metadata?.full_name || "");
                    setIsEditingName(true);
                  }}
                />
              </h3>
            )}
            <p className="max-w-45 truncate text-[10px] font-bold uppercase tracking-widest text-gray-500">
              {user?.email}
            </p>

            {user?.user_metadata?.status_message && (
              <div className="mt-3 flex max-w-full items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3.5 py-1.5 backdrop-blur-md">
                <div className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                <p className="max-w-45 truncate text-[10px] font-bold italic text-gray-300">
                  "{user.user_metadata.status_message}"
                </p>
              </div>
            )}

            {/* 🪙 Compact KilluCoins (KC) Balance Pill */}
            <div className="mt-3 flex w-full items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 backdrop-blur-md">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-400">
                <img
                  src="/images/killucoin.png"
                  alt="KC"
                  className="h-4 w-4 object-contain [image-rendering:pixelated]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                KilluCoins
              </span>
              <span className="font-mono text-xs font-black text-amber-300">
                {(
                  (authoritativeBalance !== undefined &&
                  authoritativeBalance !== null
                    ? authoritativeBalance
                    : user?.user_metadata?.gacha_balance) ?? 0
                ).toLocaleString()}{" "}
                KC
              </span>
            </div>
          </div>

          {isAdmin && (
            <Link
              to="/admin"
              className="mt-5 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-red-400 shadow-lg shadow-red-500/5 transition-colors hover:bg-red-500/20 active:scale-95"
            >
              <Shield size={14} /> {t("account.admin_panel")}
            </Link>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto pb-24 pr-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:pb-0 [&::-webkit-scrollbar]:hidden">
          <NavButton
            active={activeTab === "overview"}
            onClick={() => handleNav("overview")}
            icon={<LayoutDashboard size={18} />}
            label={t("account.nav.overview")}
          />
          <NavButton
            active={activeTab === "posts"}
            onClick={() => handleNav("posts")}
            icon={<MessageSquare size={18} />}
            label={t("account.nav.posts")}
          />
          <NavButton
            active={activeTab === "medals"}
            onClick={() => handleNav("medals")}
            icon={<Medal size={18} />}
            label={t("account.nav.medals", "Medallas")}
          />
          <NavButton
            active={activeTab === "achievements"}
            onClick={() => handleNav("achievements")}
            icon={<Trophy size={18} />}
            label={t("account.nav.achievements")}
          />
          <NavButton
            active={activeTab === "connections"}
            onClick={() => handleNav("connections")}
            icon={<LinkIcon size={18} />}
            label={t("account.nav.connections")}
          />
          <NavButton
            active={activeTab === "settings"}
            onClick={() => handleNav("settings")}
            icon={<Settings size={18} />}
            label={t("account.nav.settings", "Configuración")}
          />
        </nav>

        <div className="mt-4 border-t border-white/5 pt-5">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-4 rounded-2xl px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-red-400/70 transition-colors hover:bg-red-500/10 hover:text-red-400 active:scale-95"
          >
            <LogOut size={16} /> {t("account.nav.logout")}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AccountSidebar;
