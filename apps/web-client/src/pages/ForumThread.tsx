import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  User,
  Calendar,
  ArrowLeft,
  Eye,
  Reply,
  Send,
  Edit,
  Trash2,
  Check,
  X,
  Image as ImageIcon,
  Pin,
  Lock,
  Unlock,
} from "lucide-react";
import Loader from "../components/UI/Loader";
import { useAuth } from "../context/AuthContext";
import RoleBadge from "../components/User/RoleBadge";
import PollDisplay from "../components/Forum/PollDisplay";
import { useTranslation } from "react-i18next";
import { supabase } from "../services/supabaseClient";
import { uploadImage } from "../services/uploadService";
import MarkdownRenderer from "../components/UI/MarkdownRenderer";
import { slugify } from "../utils/slugify";

interface ForumAuthorData {
  username: string;
  full_name: string;
  avatar_url: string;
  role: string;
  status_message: string;
  avatar_preference?: string;
  community_pref?: string;
  minecraft_uuid?: string;
  minecraft_nick?: string;
  social_discord?: string;
  discord_tag?: string;
  social_avatar_url?: string;
}

interface Thread {
  id: string | number;
  title: string;
  content: string;
  author: string;
  author_id: string;
  author_avatar: string | null;
  author_role: string;
  date: string;
  longDate: string;
  image: string | null;
  tag: string;
  category_id: number;
  views: number;
  poll: Poll | null;
  pinned: boolean;
  locked: boolean;
  title_en?: string;
  content_en?: string;
  author_data_fresh?: ForumAuthorData;
}

interface Comment {
  id: string | number;
  user: string;
  user_id: string | null;
  avatar: string | null;
  role: string;
  date: string;
  content: string;
  author_data_fresh?: ForumAuthorData;
}

interface PendingImageRepl {
  blob: Blob;
  preview: string;
}

const RANK_IMAGES: Record<string, string> = {
  admin: "/ranks/admin.png",
  developer: "/ranks/developer.png",
  moderator: "/ranks/moderator.png",
  helper: "/ranks/helper.png",
  staff: "/ranks/staff.png",
  donador: "/ranks/rank-donador.png",
  fundador: "/ranks/rank-fundador.png",
  killu: "/ranks/rank-killu.png",
  neroferno: "/ranks/rank-neroferno.png",
  user: "/ranks/user.png",
};

// Simple helper to compress images (reused)
const compressImage = async (file: File): Promise<Blob> => {
  const objectUrl = URL.createObjectURL(file);
  return await new Promise<Blob>((resolve, reject) => {
    const img = new Image();
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image load failed"));
    };
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const MAX_SIZE = 1920;
      let width = img.width;
      let height = img.height;

      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (blob) resolve(blob);
            else reject(new Error("Canvas toBlob failed"));
          },
          "image/webp",
          0.8,
        );
      } else {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Could not get canvas context"));
      }
    };
    img.src = objectUrl;
  });
};

const categoryNames: Record<number, string> = {
  1: "Anuncios",
  2: "Discusión General",
  3: "Soporte",
  4: "Off-Topic",
};

interface PollOption {
  id: string;
  label: string;
  percent: number;
  votes: number;
}

interface Poll {
  id: string;
  discord_link?: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  closesIn: string;
}

const getCategorySlug = (categoryId?: number): string => {
  switch (categoryId) {
    case 1:
      return "announcements";
    case 2:
      return "general";
    case 3:
      return "support";
    default:
      return "off-topic";
  }
};

interface ReplySectionProps {
  readonly user: ReturnType<typeof useAuth>["user"];
  readonly threadLocked: boolean;
  readonly isAdmin: boolean;
  readonly newComment: string;
  readonly setNewComment: React.Dispatch<React.SetStateAction<string>>;
  readonly pendingImageRepl: PendingImageRepl | null;
  readonly clearReplImage: () => void;
  readonly handleReplImageSelect: (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  readonly handlePostComment: (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => void;
  readonly t: ReturnType<typeof useTranslation>["t"];
}

function ReplySection({
  user,
  threadLocked,
  isAdmin,
  newComment,
  setNewComment,
  pendingImageRepl,
  clearReplImage,
  handleReplImageSelect,
  handlePostComment,
  t,
}: Readonly<ReplySectionProps>) {
  if (!user) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "2rem",
          background: "rgba(0,0,0,0.2)",
          borderRadius: "8px",
        }}
      >
        <p style={{ color: "var(--muted)", marginBottom: "1rem" }}>
          {t("forum_thread.login_to_reply")}
        </p>
        <Link to="/login" className="btn-secondary">
          {t("forum_thread.login")}
        </Link>
      </div>
    );
  }

  if (threadLocked && !isAdmin) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "2rem",
          background: "rgba(239, 68, 68, 0.05)",
          borderRadius: "8px",
          border: "1px solid rgba(239, 68, 68, 0.2)",
        }}
      >
        <Lock size={30} style={{ color: "#ef4444", marginBottom: "1rem" }} />
        <h4 style={{ color: "#fff", margin: "0 0 0.5rem 0" }}>Tema Cerrado</h4>
        <p style={{ color: "#888", margin: 0 }}>
          Este tema ha sido bloqueado por un moderador y no admite más
          respuestas.
        </p>
      </div>
    );
  }

  const isSubmitDisabled = !newComment.trim() && !pendingImageRepl;

  return (
    <form
      onSubmit={handlePostComment}
      style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "#333",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            alt="user"
          />
        ) : (
          <User color="#888" style={{ padding: "8px" }} />
        )}
      </div>
      <div
        style={{
          flexGrow: 1,
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "8px",
          overflow: "hidden",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) =>
          (e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)")
        }
        onBlur={(e) =>
          (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")
        }
      >
        <textarea
          aria-label={t("forum_thread.write_reply", "Escribir respuesta...")}
          className="form-textarea"
          placeholder={t("forum_thread.write_reply")}
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            padding: "1rem",
            color: "#fff",
            resize: "vertical",
            minHeight: "80px",
            outline: "none",
          }}
        />

        {pendingImageRepl && (
          <div style={{ padding: "0 1rem 1rem 1rem" }}>
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: "4px",
                display: "inline-flex",
                alignItems: "center",
                gap: "1rem",
                border: "1px solid var(--accent)",
                padding: "0.5rem",
              }}
            >
              <img
                src={pendingImageRepl.preview}
                style={{
                  height: "50px",
                  borderRadius: "4px",
                  objectFit: "cover",
                }}
                alt="preview"
              />
              <div style={{ fontSize: "0.8rem", color: "#ccc" }}>
                <div style={{ fontWeight: "bold", color: "#fff" }}>
                  Imagen lista
                </div>
              </div>
              <button
                aria-label={t("common.remove", "Eliminar imagen")}
                type="button"
                onClick={clearReplImage}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ef4444",
                  cursor: "pointer",
                  padding: "0 0.5rem",
                  fontSize: "1.1rem",
                }}
              >
                <X />
              </button>
            </div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.5rem 1rem",
            background: "rgba(255,255,255,0.02)",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <label
            title="Adjuntar imagen"
            className="hover:bg-white/10 hover:text-white"
            style={{
              cursor: "pointer",
              color: pendingImageRepl ? "var(--accent)" : "#aaa",
              fontSize: "1.2rem",
              padding: "0.5rem",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition:
                "color 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.2s",
            }}
          >
            <ImageIcon />
            <input
              aria-label={t(
                "create_thread.form.attach_image",
                "Adjuntar imagen",
              )}
              type="file"
              accept="image/*"
              onChange={handleReplImageSelect}
              style={{ display: "none" }}
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            style={{
              background: isSubmitDisabled ? "#444" : "var(--accent)",
              color: isSubmitDisabled ? "#888" : "#000",
              border: "none",
              padding: "0.4rem 1.2rem",
              borderRadius: "4px",
              fontWeight: "bold",
              fontSize: "0.9rem",
              cursor: isSubmitDisabled ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "transform 0.1s",
            }}
          >
            <Send size={12} /> {t("forum_thread.publish")}
          </button>
        </div>
      </div>
    </form>
  );
}

interface DeleteConfirmModalProps {
  readonly deleteModal: {
    readonly type: "thread" | "post";
    readonly id: string | number;
  };
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}

function DeleteConfirmModal({
  deleteModal,
  onClose,
  onConfirm,
}: Readonly<DeleteConfirmModalProps>) {
  return (
    <dialog
      open
      aria-labelledby="delete-modal-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        backdropFilter: "blur(5px)",
        border: "none",
        margin: 0,
        padding: 0,
        maxWidth: "none",
        maxHeight: "none",
      }}
    >
      <button
        type="button"
        aria-label="Cerrar modal"
        onClick={onClose}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "transparent",
          border: "none",
          cursor: "default",
          padding: 0,
          margin: 0,
        }}
      />
      <div
        tabIndex={-1}
        style={{
          position: "relative",
          zIndex: 1,
          background: "#1e1e24",
          padding: "2rem",
          borderRadius: "12px",
          border: "1px solid #ef4444",
          maxWidth: "400px",
          width: "90%",
          textAlign: "center",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
            fontSize: "2rem",
          }}
        >
          <Trash2 />
        </div>
        <h3
          id="delete-modal-title"
          style={{ margin: "0 0 0.5rem 0", fontSize: "1.4rem", color: "#fff" }}
        >
          ¿Estás seguro?
        </h3>
        <p style={{ color: "#aaa", marginBottom: "2rem", lineHeight: "1.5" }}>
          {deleteModal.type === "thread"
            ? "Esta acción eliminará el post y todos sus comentarios permanentemente."
            : "Esta acción eliminará el comentario permanentemente."}
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button
            aria-label="Cancelar eliminación"
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{ flex: 1 }}
          >
            Cancelar
          </button>
          <button
            aria-label="Confirmar eliminación"
            type="button"
            className="btn-primary"
            onClick={onConfirm}
            style={{
              flex: 1,
              background: "#ef4444",
              borderColor: "#ef4444",
              color: "#fff",
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </dialog>
  );
}

interface ThreadAuthorHeaderProps {
  readonly thread: Thread;
}

function ThreadAuthorHeader({ thread }: Readonly<ThreadAuthorHeaderProps>) {
  const metadata = thread.author_data_fresh;
  const pref = metadata?.avatar_preference || "minecraft";
  const mcNick = metadata?.minecraft_nick;
  const useMinecraft = pref === "minecraft" && mcNick;

  const displayAvatar = useMinecraft
    ? `https://mc-heads.net/avatar/${mcNick}/128`
    : metadata?.social_avatar_url ||
      metadata?.avatar_url ||
      thread.author_avatar ||
      `https://ui-avatars.com/api/?name=${thread.author}`;

  const statusMessage = metadata?.status_message;
  const displayName = useMinecraft
    ? mcNick || thread.author
    : metadata?.full_name || metadata?.username || thread.author;
  const roleRaw = (
    metadata?.role ||
    thread.author_role ||
    "user"
  ).toLowerCase();
  const roleImage =
    RANK_IMAGES[roleRaw] ||
    (roleRaw.includes("donador")
      ? RANK_IMAGES["donador"]
      : RANK_IMAGES["user"]);

  return (
    <div className="group/author relative flex items-center gap-4 p-2">
      <div className="flex cursor-pointer items-center gap-4">
        <div className="h-14 w-14 overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-lg transition-transform group-hover/author:scale-105">
          <img
            src={displayAvatar}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col text-left">
          <Link
            to={`/u/${slugify(thread.author)}`}
            className="hover:text-(--accent) font-bold leading-tight text-white transition-colors"
          >
            {displayName}
          </Link>
          <div className="mt-1 flex items-center gap-2">
            <RoleBadge role={thread.author_role} username={thread.author} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              • {thread.date}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a0a]/98 pointer-events-none absolute bottom-full left-0 z-50 mb-4 w-72 translate-y-2 rounded-2xl border border-white/10 p-5 text-left opacity-0 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-colors duration-200 group-hover/author:translate-y-0 group-hover/author:opacity-100">
        <div className="mb-4 flex items-center gap-4 border-b border-white/5 pb-4">
          <img
            src={displayAvatar}
            className="h-12 w-12 rounded-xl border border-white/10 shadow-inner"
            alt="Avatar"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold leading-tight text-white">
              {displayName}
            </p>
            {statusMessage && (
              <p className="mt-0.5 line-clamp-2 text-[10px] italic leading-relaxed text-gray-400">
                "{statusMessage}"
              </p>
            )}
            <div className="mt-2">
              <img
                src={roleImage}
                alt={roleRaw}
                className="h-4 object-contain object-left"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs text-gray-400">
          {mcNick && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                Minecraft
              </span>
              <span className="font-mono text-white">{mcNick}</span>
            </div>
          )}
          {(metadata?.social_discord || metadata?.discord_tag) && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                Discord
              </span>
              <span className="text-indigo-300">
                {metadata?.social_discord || metadata?.discord_tag}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
              Rol
            </span>
            <span className="capitalize text-white">{roleRaw}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CommentItemProps {
  readonly comment: Comment;
  readonly isOwnerOrAdmin: boolean;
  readonly isEditing: boolean;
  readonly editPostContent: string;
  readonly onStartEdit: () => void;
  readonly onCancelEdit: () => void;
  readonly onSaveEdit: () => void;
  readonly onDelete: () => void;
  readonly onEditContentChange: (val: string) => void;
  readonly t: ReturnType<typeof useTranslation>["t"];
}

function CommentItem({
  comment,
  isOwnerOrAdmin,
  isEditing,
  editPostContent,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onEditContentChange,
  t,
}: Readonly<CommentItemProps>) {
  const metadata = comment.author_data_fresh;
  const pref = metadata?.avatar_preference || "minecraft";
  const mcNick = metadata?.minecraft_nick;
  const useMinecraft = pref === "minecraft" && mcNick;

  const displayAvatar = useMinecraft
    ? `https://mc-heads.net/avatar/${mcNick}/128`
    : metadata?.social_avatar_url ||
      metadata?.avatar_url ||
      comment.avatar ||
      `https://ui-avatars.com/api/?name=${comment.user}`;

  const statusMessage = metadata?.status_message;
  const displayName = useMinecraft
    ? mcNick || comment.user
    : metadata?.full_name || metadata?.username || comment.user;
  const roleRaw = (metadata?.role || comment.role || "user").toLowerCase();
  const roleImage =
    RANK_IMAGES[roleRaw] ||
    (roleRaw.includes("donador")
      ? RANK_IMAGES["donador"]
      : RANK_IMAGES["user"]);

  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      {/* Avatar Sidebar with Tooltip */}
      <div className="group/comment relative flex shrink-0 items-center">
        <div className="h-12 w-12 cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-black/20 shadow-lg transition-transform group-hover/comment:scale-105">
          <img
            src={displayAvatar}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="pointer-events-none absolute bottom-full left-0 z-50 mb-3 w-64 translate-y-2 rounded-xl border border-white/10 bg-[#0a0a0a]/95 p-4 text-left opacity-0 shadow-2xl backdrop-blur-xl transition-colors duration-300 group-hover/comment:translate-y-0 group-hover/comment:opacity-100">
          <div className="mb-3 flex items-center gap-3 border-b border-white/5 pb-3">
            <img
              src={displayAvatar}
              className="h-10 w-10 rounded-lg border border-white/10 shadow-inner"
              alt="Avatar"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold leading-tight text-white">
                {displayName}
              </p>
              {statusMessage && (
                <p className="mt-0.5 line-clamp-2 text-[10px] italic text-gray-400">
                  "{statusMessage}"
                </p>
              )}
              <div className="mt-1">
                <img
                  src={roleImage}
                  alt={roleRaw}
                  className="h-4 object-contain object-left"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs text-gray-400">
            {mcNick && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                  Minecraft
                </span>
                <span className="font-mono text-white">{mcNick}</span>
              </div>
            )}
            {(metadata?.social_discord || metadata?.discord_tag) && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                  Discord
                </span>
                <span className="text-indigo-300">
                  {metadata?.social_discord || metadata?.discord_tag}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                Rol
              </span>
              <span className="capitalize text-white">{roleRaw}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/u/${slugify(comment.user)}`}
              className="text-(--accent) font-bold transition-colors hover:text-white"
            >
              {displayName}
            </Link>
            <RoleBadge role={comment.role} username={comment.user} />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 opacity-70">
              • {comment.date}
            </span>
          </div>

          {/* Actions for Comment */}
          {isOwnerOrAdmin && !isEditing && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={t("forum_thread.edit_comment", "Editar comentario")}
                onClick={onStartEdit}
                className="hover:text-(--accent) text-[11px] font-black uppercase tracking-tighter text-gray-500 transition-colors"
              >
                Editar
              </button>
              <button
                type="button"
                aria-label={t(
                  "forum_thread.delete_comment",
                  "Eliminar comentario",
                )}
                onClick={onDelete}
                className="text-[11px] font-black uppercase tracking-tighter text-red-500/70 transition-colors hover:text-red-500"
              >
                Eliminar
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div style={{ marginTop: "0.5rem" }}>
            <textarea
              aria-label={t("forum_thread.edit_comment", "Editar comentario")}
              value={editPostContent}
              onChange={(e) => onEditContentChange(e.target.value)}
              style={{
                width: "100%",
                background: "#222",
                border: "1px solid #444",
                color: "#fff",
                padding: "0.5rem",
                borderRadius: "4px",
              }}
              rows={3}
            />
            <div
              style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}
            >
              <button
                type="button"
                aria-label={t("common.save", "Guardar")}
                onClick={onSaveEdit}
                className="btn-primary"
                style={{ fontSize: "0.8rem", padding: "0.3rem 0.8rem" }}
              >
                Guardar
              </button>
              <button
                type="button"
                aria-label={t("common.cancel", "Cancelar")}
                onClick={onCancelEdit}
                className="btn-secondary"
                style={{ fontSize: "0.8rem", padding: "0.3rem 0.8rem" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div style={{ color: "#ccc", lineHeight: "1.5", margin: 0 }}>
            <MarkdownRenderer content={comment.content} />
          </div>
        )}
      </div>
    </div>
  );
}

async function fetchThreadDetail(
  type: string,
  id: string | undefined,
  apiUrl: string,
) {
  if (!id) return null;
  const isTopic = type === "topic";
  const threadPromise = isTopic
    ? fetch(`${apiUrl}/forum/thread/${id}`)
    : fetch(`${apiUrl}/news/${id}`);

  const threadRes = await threadPromise;
  if (!threadRes.ok) throw new Error("Not Found");
  const threadData = await threadRes.json();

  const parsedThread: Thread = {
    id: threadData.id,
    title: threadData.title,
    content: threadData.content,
    title_en: threadData.title_en,
    content_en: threadData.content_en,
    author: isTopic ? threadData.author_name || "Anónimo" : "CrystalTidesSMP",
    author_id: isTopic ? threadData.user_id : threadData.author_id,
    author_avatar: isTopic ? threadData.author_avatar : "/images/ui/logo.webp",
    author_role: isTopic ? threadData.author_role : "staff",
    date: new Date(threadData.created_at).toLocaleDateString(),
    longDate:
      new Date(threadData.created_at).toLocaleDateString() +
      " " +
      new Date(threadData.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    image: isTopic ? null : threadData.image,
    tag: isTopic
      ? categoryNames[threadData.category_id] || "General"
      : threadData.category,
    category_id: threadData.category_id,
    views: threadData.views || 0,
    poll: threadData.poll || null,
    pinned: threadData.pinned || false,
    locked: threadData.locked || false,
    author_data_fresh: threadData.author_data_fresh,
  };

  const commentsPromise = isTopic
    ? fetch(`${apiUrl}/forum/thread/${id}/posts`)
    : fetch(`${apiUrl}/news/${id}/comments`);

  const commentsRes = await commentsPromise;
  const commentsData = await commentsRes.json();
  const parsedComments: Comment[] = Array.isArray(commentsData)
    ? commentsData.map(
        (c: {
          id: string | number;
          author_name?: string;
          user_name?: string;
          author_id?: string;
          user_id?: string;
          author_avatar?: string;
          user_avatar?: string;
          author_role?: string;
          user_role?: string;
          content: string;
          content_en?: string;
          created_at: string;
          image_url?: string;
          author_data_fresh?: unknown;
        }) => ({
          id: c.id,
          user: (isTopic ? c.author_name : c.user_name) || "Anónimo",
          user_id: c.author_id || c.user_id || null,
          avatar: (isTopic ? c.author_avatar : c.user_avatar) || null,
          role: (isTopic ? c.author_role : c.user_role) || "user",
          content: c.content,
          date:
            new Date(c.created_at).toLocaleDateString() +
            " " +
            new Date(c.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          author_data_fresh: c.author_data_fresh as ForumAuthorData,
        }),
      )
    : [];

  return { thread: parsedThread, comments: parsedComments };
}

function checkIsAdmin(user: ReturnType<typeof useAuth>["user"]): boolean {
  if (!user) return false;
  const role = (user.user_metadata?.role || "").toLowerCase();
  const username = (
    user.user_metadata?.username ||
    user.user_metadata?.name ||
    ""
  ).toLowerCase();
  return (
    [
      "admin",
      "staff",
      "helper",
      "moderator",
      "developer",
      "neroferno",
      "killu",
    ].includes(role) || ["admin", "neroferno", "killu"].includes(username)
  );
}

interface ThreadActionButtonsProps {
  readonly isTopic: boolean;
  readonly isOwnerOrAdmin: boolean;
  readonly isEditingThread: boolean;
  readonly isAdmin: boolean;
  readonly pinned: boolean;
  readonly locked: boolean;
  readonly onTogglePin: () => void;
  readonly onToggleLock: () => void;
  readonly onStartEditThread: () => void;
  readonly onDeleteThread: () => void;
  readonly onUpdateThread: () => void;
  readonly onCancelEditThread: () => void;
}

function ThreadActionButtons({
  isTopic,
  isOwnerOrAdmin,
  isEditingThread,
  isAdmin,
  pinned,
  locked,
  onTogglePin,
  onToggleLock,
  onStartEditThread,
  onDeleteThread,
  onUpdateThread,
  onCancelEditThread,
}: Readonly<ThreadActionButtonsProps>) {
  if (isEditingThread) {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onUpdateThread}
          className="btn-primary"
          style={{
            padding: "0.5rem 1rem",
            display: "flex",
            gap: "0.5rem",
            fontSize: "0.8rem",
          }}
        >
          <Check size={16} /> Guardar
        </button>
        <button
          type="button"
          onClick={onCancelEditThread}
          className="btn-secondary"
          style={{
            padding: "0.5rem 1rem",
            display: "flex",
            gap: "0.5rem",
            fontSize: "0.8rem",
          }}
        >
          <X size={16} /> Cancelar
        </button>
      </div>
    );
  }

  if (!isTopic || !isOwnerOrAdmin) return null;

  return (
    <div className="flex items-center gap-3">
      {/* Mod Tools - Only for Staff */}
      {isAdmin && (
        <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/20 p-1.5">
          <button
            type="button"
            onClick={onTogglePin}
            className="rounded p-1 transition-colors hover:bg-white/5"
            title={pinned ? "Desfijar" : "Fijar"}
          >
            <Pin
              size={14}
              className={pinned ? "text-(--accent)" : "text-gray-500"}
              style={{
                transform: pinned ? "rotate(0deg)" : "rotate(45deg)",
                transition:
                  "color 0.3s, background-color 0.3s, border-color 0.3s, opacity 0.3s",
              }}
            />
          </button>
          <button
            type="button"
            onClick={onToggleLock}
            className="rounded p-1 transition-colors hover:bg-white/5"
            title={locked ? "Desbloquear" : "Bloquear"}
          >
            {locked ? (
              <Lock size={14} className="text-red-500" />
            ) : (
              <Unlock size={14} className="text-gray-500" />
            )}
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onStartEditThread}
          className="bg-(--accent)/10 hover:bg-(--accent)/20 text-(--accent) rounded-xl p-2 transition-colors"
          title="Editar"
        >
          <Edit size={16} />
        </button>
        <button
          type="button"
          onClick={onDeleteThread}
          className="rounded-xl bg-red-500/10 p-2 text-red-500 transition-colors hover:bg-red-500/20"
          title="Eliminar"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

interface ThreadArticleProps {
  readonly thread: Thread;
  readonly isTopic: boolean;
  readonly isEditingThread: boolean;
  readonly editThreadData: { title: string; content: string };
  readonly isOwnerOrAdmin: boolean;
  readonly isAdmin: boolean;
  readonly onEditThreadDataChange: React.Dispatch<
    React.SetStateAction<{ title: string; content: string }>
  >;
  readonly onStartEditThread: () => void;
  readonly onCancelEditThread: () => void;
  readonly onUpdateThread: () => void;
  readonly onDeleteThread: () => void;
  readonly onTogglePin: () => void;
  readonly onToggleLock: () => void;
  readonly t: ReturnType<typeof useTranslation>["t"];
  readonly language: string;
}

function ThreadArticle({
  thread,
  isTopic,
  isEditingThread,
  editThreadData,
  isOwnerOrAdmin,
  isAdmin,
  onEditThreadDataChange,
  onStartEditThread,
  onCancelEditThread,
  onUpdateThread,
  onDeleteThread,
  onTogglePin,
  onToggleLock,
  t,
  language,
}: Readonly<ThreadArticleProps>) {
  return (
    <article
      style={{
        background: "rgba(30, 30, 40, 0.6)",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.05)",
        marginBottom: "3rem",
      }}
    >
      {thread.image && (
        <div
          style={{
            width: "100%",
            height: "300px",
            overflow: "hidden",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <img
            src={thread.image}
            alt={thread.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

      <div style={{ padding: "3rem" }}>
        <div
          style={{
            marginBottom: "2rem",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            paddingBottom: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            {thread.tag && (
              <span
                style={{
                  background: "var(--accent)",
                  color: "#000",
                  padding: "0.3rem 0.8rem",
                  borderRadius: "4px",
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                }}
              >
                {thread.tag}
              </span>
            )}
            <span
              style={{
                color: "var(--muted)",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Calendar /> {thread.longDate}
            </span>
            <span
              style={{
                color: "var(--muted)",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Eye /> {thread.views} {t("forum_thread.views")}
            </span>
          </div>

          {/* Thread Title Area - Edit or View */}
          {isEditingThread ? (
            <div style={{ marginBottom: "1.5rem" }}>
              <input
                aria-label={t(
                  "forum_thread.edit_title",
                  "Editar título del tema",
                )}
                className="form-input"
                style={{
                  width: "100%",
                  fontSize: "1.5rem",
                  marginBottom: "1rem",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid #444",
                  color: "#fff",
                }}
                value={editThreadData.title}
                onChange={(e) =>
                  onEditThreadDataChange((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
            </div>
          ) : (
            <h1 style={{ fontSize: "2.5rem", color: "#fff", lineHeight: 1.2 }}>
              {language === "en" && thread?.title_en
                ? thread.title_en
                : thread.title}
            </h1>
          )}

          <div className="mb-6 mt-8 flex items-center justify-between border-b border-white/5 pb-6">
            <ThreadAuthorHeader thread={thread} />
            <ThreadActionButtons
              isTopic={isTopic}
              isOwnerOrAdmin={isOwnerOrAdmin}
              isEditingThread={isEditingThread}
              isAdmin={isAdmin}
              pinned={thread.pinned}
              locked={thread.locked}
              onTogglePin={onTogglePin}
              onToggleLock={onToggleLock}
              onStartEditThread={onStartEditThread}
              onDeleteThread={onDeleteThread}
              onUpdateThread={onUpdateThread}
              onCancelEditThread={onCancelEditThread}
            />
          </div>
        </div>

        {/* Thread Content Area - Edit or View */}
        {isEditingThread ? (
          <textarea
            aria-label={t(
              "forum_thread.edit_content",
              "Editar contenido del tema",
            )}
            className="form-textarea"
            value={editThreadData.content}
            onChange={(e) =>
              onEditThreadDataChange((prev) => ({
                ...prev,
                content: e.target.value,
              }))
            }
            rows={10}
            style={{
              width: "100%",
              background: "rgba(0,0,0,0.3)",
              border: "1px solid #444",
              color: "#e0e0e0",
              fontSize: "1.1rem",
              padding: "1rem",
            }}
          />
        ) : (
          <div
            className="thread-content"
            style={{
              color: "#e0e0e0",
              fontSize: "1.1rem",
              lineHeight: 1.8,
              whiteSpace: "pre-wrap",
            }}
          >
            <MarkdownRenderer
              content={
                language === "en" && thread?.content_en
                  ? thread.content_en
                  : thread.content
              }
            />
          </div>
        )}

        {/* POLL RENDER */}
        {!isEditingThread && thread.poll && (
          <PollDisplay
            poll={thread.poll}
            refreshPoll={() => {
              window.location.reload();
            }}
          />
        )}
      </div>
    </article>
  );
}

// MarkdownRenderer is now imported from shared components

export default function ForumThread() {
  const params = useParams<{ type?: string; id?: string }>();
  const type = params.id ? params.type || "topic" : "topic";
  const id = params.id || params.type; // This is the slug or ID from the URL
  const { user } = useAuth();
  const navigate = useNavigate();
  const [overrideThread, setOverrideThread] = useState<Thread | null>(null);
  const [overrideComments, setOverrideComments] = useState<Comment[]>([]);
  const [isEditingThread, setIsEditingThread] = useState(false);
  const [editThreadData, setEditThreadData] = useState({
    title: "",
    content: "",
  });
  const isSubmittingRef = useRef(false);
  const isSubmitting = isSubmittingRef.current;
  const setIsSubmitting = (val: boolean) => {
    isSubmittingRef.current = val;
  };
  const [newComment, setNewComment] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | number | null>(
    null,
  );
  const [editPostContent, setEditPostContent] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  const isTopic = type === "topic";
  const { t, i18n } = useTranslation();

  const [deleteModal, setDeleteModal] = useState<{
    type: "thread" | "post";
    id: string | number;
  } | null>(null);
  const {
    data: threadQueryData,
    isLoading: threadLoading,
    error: threadError,
  } = useQuery({
    queryKey: ["forumThreadDetail", type, id],
    queryFn: () => fetchThreadDetail(type, id, API_URL),
    enabled: Boolean(id),
    staleTime: 30_000,
  });

  const thread = threadQueryData?.thread ?? overrideThread;
  const comments = threadQueryData?.comments ?? overrideComments;
  const loading = threadLoading;
  const error = threadError ? (threadError as Error).message : null;

  const isAdmin = () => checkIsAdmin(user);
  const isOwnerOrAdmin = (targetUserId: string | null) =>
    isAdmin() || user?.id === targetUserId;

  const handleUpdateThread = async () => {
    if (
      isSubmitting ||
      !editThreadData.title.trim() ||
      !editThreadData.content.trim()
    )
      return;
    setIsSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${API_URL}/forum/thread/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editThreadData),
      });
      if (res.ok) {
        setOverrideThread((prev) =>
          prev
            ? {
                ...prev,
                title: editThreadData.title,
                content: editThreadData.content,
              }
            : null,
        );
        setIsEditingThread(false);
      } else {
        alert("Error al actualizar");
      }
    } catch (e: unknown) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePin = async () => {
    if (isSubmitting || !thread) return;
    setIsSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const newValue = !thread.pinned;
      const res = await fetch(`${API_URL}/forum/thread/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pinned: newValue }),
      });
      if (res.ok) setOverrideThread({ ...thread, pinned: newValue });
    } catch (e: unknown) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLock = async () => {
    if (isSubmitting || !thread) return;
    setIsSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const newValue = !thread.locked;
      const res = await fetch(`${API_URL}/forum/thread/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ locked: newValue }),
      });
      if (res.ok) setOverrideThread({ ...thread, locked: newValue });
    } catch (e: unknown) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteThread = () => {
    if (thread?.id) setDeleteModal({ type: "thread", id: thread.id });
  };

  const handleUpdatePost = async (postId: string | number) => {
    if (!editPostContent.trim()) return;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const url = isTopic
        ? `${API_URL}/forum/posts/${postId}`
        : `${API_URL}/news/comments/${postId}`;

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: editPostContent }),
      });
      if (res.ok) {
        setOverrideComments(
          comments.map((c) =>
            c.id === postId ? { ...c, content: editPostContent } : c,
          ),
        );
        setEditingPostId(null);
      }
    } catch (e: unknown) {
      console.error(e);
    }
  };

  const handleDeletePost = (postId: string | number) => {
    setDeleteModal({ type: "post", id: postId });
  };

  const deletingRef = useRef(false);

  const executeDelete = async () => {
    if (!deleteModal || deletingRef.current) return;
    deletingRef.current = true;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      const authHeaders = { Authorization: `Bearer ${token}` };

      if (deleteModal.type === "thread") {
        const res = await fetch(`${API_URL}/forum/thread/${deleteModal.id}`, {
          method: "DELETE",
          headers: authHeaders,
        });
        if (res.ok) {
          navigate("/forum");
        } else {
          alert("Error al eliminar el tema");
        }
      } else if (deleteModal.type === "post") {
        const url = isTopic
          ? `${API_URL}/forum/posts/${deleteModal.id}`
          : `${API_URL}/news/comments/${deleteModal.id}`;
        const res = await fetch(url, {
          method: "DELETE",
          headers: authHeaders,
        });
        if (res.ok) {
          setOverrideComments(comments.filter((c) => c.id !== deleteModal.id));
        } else {
          alert("Error al eliminar el comentario");
        }
      }
    } catch (e: unknown) {
      console.error(e);
      alert("Error de conexión");
    } finally {
      deletingRef.current = false;
      setDeleteModal(null);
    }
  };

  // Reply Image State
  const [pendingImageRepl, setPendingImageRepl] =
    useState<PendingImageRepl | null>(null);

  useEffect(() => {
    return () => {
      if (pendingImageRepl?.preview) {
        URL.revokeObjectURL(pendingImageRepl.preview);
      }
    };
  }, [pendingImageRepl?.preview]);

  const handleReplImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024)
      return alert("Imagen muy pesada (Max 20MB)");

    try {
      const blob = await compressImage(file);
      if (pendingImageRepl?.preview)
        URL.revokeObjectURL(pendingImageRepl.preview);
      setPendingImageRepl({
        blob,
        preview: URL.createObjectURL(blob),
      });
      e.target.value = "";
    } catch (e) {
      console.error(e);
      alert("Error al procesar imagen");
    }
  };

  const clearReplImage = () => {
    if (pendingImageRepl?.preview)
      URL.revokeObjectURL(pendingImageRepl.preview);
    setPendingImageRepl(null);
  };

  const handlePostComment = async (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const currentUser = user;
    if (
      isSubmittingRef.current ||
      !currentUser ||
      (!newComment.trim() && !pendingImageRepl)
    )
      return;
    setIsSubmitting(true);

    let finalContent = newComment;

    try {
      // 1. Upload Image (Deferred) — server-validated in backend
      if (pendingImageRepl) {
        const publicUrl = await uploadImage(
          pendingImageRepl.blob,
          "forum-uploads",
        );
        finalContent += `\n\n![Imagen](${publicUrl})`;
      }

      const currentRole = currentUser?.user_metadata?.role || "user";
      const username =
        currentUser?.user_metadata?.username ||
        currentUser?.email?.split("@")[0] ||
        "Usuario";

      // Payload logic
      const body = isTopic
        ? {
            content: finalContent,
            user_data: {
              id: currentUser.id,
              name: username,
              avatar: currentUser?.user_metadata?.avatar_url,
              role: currentRole,
            },
          }
        : {
            user_name: username,
            user_avatar: currentUser?.user_metadata?.avatar_url,
            content: finalContent,
            user_role: currentRole,
          };

      const url = isTopic
        ? `${API_URL}/forum/thread/${id}/posts`
        : `${API_URL}/news/${id}/comments`;

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const savedComment = await res.json();
        // Normalize response to add locally
        const newC: Comment = {
          id: savedComment.id,
          user: isTopic ? savedComment.author_name : savedComment.user_name,
          user_id: currentUser.id,
          avatar: isTopic
            ? savedComment.author_avatar
            : savedComment.user_avatar,
          role: isTopic ? savedComment.author_role : savedComment.user_role,
          date: t("forum_thread.just_now"),
          content: savedComment.content,
        };
        setOverrideComments([...comments, newC]);
        setNewComment("");
        clearReplImage();
      }
    } catch (error: unknown) {
      console.error("Error posting comment:", error);
      alert(t("forum_thread.comment_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div
        style={{
          minHeight: "80vh",
          paddingTop: "100px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Loader text={t("forum_thread.loading")} />
      </div>
    );

  if (error || !thread)
    return (
      <div
        style={{
          minHeight: "80vh",
          paddingTop: "100px",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <h2>{error || t("forum_thread.not_found")}</h2>
        <Link
          to="/forum"
          className="btn-secondary"
          style={{ marginTop: "1rem" }}
        >
          {t("forum_thread.back_forum")}
        </Link>
      </div>
    );

  return (
    <div
      className=""
      style={{
        minHeight: "100vh",
        paddingTop: "8rem",
        paddingBottom: "4rem",
        background: "#050505",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <Link
            to={
              isTopic
                ? `/forum/${getCategorySlug(thread.category_id)}`
                : "/forum/announcements"
            }
            style={{
              color: "var(--muted)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
              marginBottom: "1rem",
            }}
          >
            <ArrowLeft /> {t("forum_thread.back_link")}
          </Link>
        </div>

        <ThreadArticle
          thread={thread}
          isTopic={isTopic}
          isEditingThread={isEditingThread}
          editThreadData={editThreadData}
          isOwnerOrAdmin={isOwnerOrAdmin(thread.author_id)}
          isAdmin={isAdmin()}
          onEditThreadDataChange={setEditThreadData}
          onStartEditThread={() => {
            setIsEditingThread(true);
            setEditThreadData({ title: thread.title, content: thread.content });
          }}
          onCancelEditThread={() => setIsEditingThread(false)}
          onUpdateThread={handleUpdateThread}
          onDeleteThread={handleDeleteThread}
          onTogglePin={togglePin}
          onToggleLock={toggleLock}
          t={t}
          language={i18n.language}
        />

        <div
          style={{
            padding: "2rem",
            background: "rgba(255,255,255,0.02)",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <h3
            style={{
              color: "#fff",
              marginBottom: "2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Reply /> {t("forum_thread.comments")} ({comments.length})
          </h3>

          <div
            className="comments-list"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              marginBottom: "3rem",
            }}
          >
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                isOwnerOrAdmin={isOwnerOrAdmin(comment.user_id)}
                isEditing={editingPostId === comment.id}
                editPostContent={editPostContent}
                onStartEdit={() => {
                  setEditingPostId(comment.id);
                  setEditPostContent(comment.content);
                }}
                onCancelEdit={() => setEditingPostId(null)}
                onSaveEdit={() => handleUpdatePost(comment.id)}
                onDelete={() => handleDeletePost(comment.id)}
                onEditContentChange={setEditPostContent}
                t={t}
              />
            ))}
          </div>

          <ReplySection
            user={user}
            threadLocked={thread.locked}
            isAdmin={isAdmin()}
            newComment={newComment}
            setNewComment={setNewComment}
            pendingImageRepl={pendingImageRepl}
            clearReplImage={clearReplImage}
            handleReplImageSelect={handleReplImageSelect}
            handlePostComment={handlePostComment}
            t={t}
          />
        </div>

        {/* DELETE MODAL */}
        {deleteModal && (
          <DeleteConfirmModal
            deleteModal={deleteModal}
            onClose={() => setDeleteModal(null)}
            onConfirm={executeDelete}
          />
        )}
      </div>
    </div>
  );
}
