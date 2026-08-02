import React, { useState, useEffect } from "react";
import { CrystalCard } from "./CrystalCard";
import { CrystalPageHeader } from "./CrystalPageHeader";
import { SkeletonLoader } from "./SkeletonLoader";
import { fetchNews, type NewsPost } from "./mockLauncherState";

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

export const NewsPage: React.FC = () => {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    const data = await fetchNews(20);
    setPosts(data);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ padding: 32, display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
      <CrystalPageHeader
        eyebrow="Noticias"
        title="Últimas Novedades"
        trailing={
          <button aria-label="Action" type="button"
            onClick={load}
            style={{
              background: "none",
              border: "1px solid var(--border-low)",
              color: "var(--accent)",
              borderRadius: 8,
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            🔄 Actualizar
          </button>
        }
      />

      <div style={{ flex: 1, overflowY: "auto", marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        {isLoading ? (
          <>
            <SkeletonLoader height={120} />
            <SkeletonLoader height={120} />
            <SkeletonLoader height={120} />
          </>
        ) : posts.length === 0 ? (
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
            No hay noticias disponibles por el momento.
          </p>
        ) : (
          posts.map((post) => (
            <CrystalCard key={post.id} style={{ padding: 20 }} enableHoverEffect>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{
                  padding: "3px 10px",
                  borderRadius: 6,
                  backgroundColor: "rgba(94, 234, 212, 0.08)",
                  border: "1px solid var(--border-low)",
                  color: "var(--accent)",
                  fontSize: 11,
                  fontWeight: 600,
                }}>
                  {post.category}
                </span>
                <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
                  {formatDate(post.createdAt)}
                </span>
              </div>
              <h3 style={{ margin: "0 0 6px 0", fontSize: 18, fontWeight: "bold", color: "#FFFFFF" }}>
                {post.title}
              </h3>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.75)", lineHeight: 1.5, fontSize: 14 }}>
                {post.content}
              </p>
            </CrystalCard>
          ))
        )}
      </div>
    </div>
  );
};
