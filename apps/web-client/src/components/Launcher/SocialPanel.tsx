import React, { useState } from "react";
import { MessageSquare, X, Send, CheckCheck } from "lucide-react";

export interface FriendItem {
  id: string;
  name: string;
  avatar: string;
  status: "in-game" | "in-launcher" | "in-menus" | "idle" | "offline";
  activity?: string;
  isFavorite?: boolean;
}

const DEFAULT_FRIENDS: FriendItem[] = [
  { id: "1", name: "172px", avatar: "https://mc-heads.net/avatar/172px/64", status: "in-game", activity: "CrystalTides SMP 👑", isFavorite: true },
  { id: "2", name: "daaaavidds", avatar: "https://mc-heads.net/avatar/daaaavidds/64", status: "in-game", activity: "CrystalTides Survival", isFavorite: true },
  { id: "3", name: "masaya46", avatar: "https://mc-heads.net/avatar/masaya46/64", status: "in-game", activity: "Dungeon Abyss" },
  { id: "4", name: "3wafyy", avatar: "https://mc-heads.net/avatar/3wafyy/64", status: "in-launcher", activity: "En el Launcher" },
  { id: "5", name: "cuvsa", avatar: "https://mc-heads.net/avatar/cuvsa/64", status: "in-game", activity: "CrystalTides SMP 💎" },
  { id: "6", name: "zakhbear", avatar: "https://mc-heads.net/avatar/zakhbear/64", status: "in-menus", activity: "En Menús" },
  { id: "7", name: "KingofHalo04", avatar: "https://mc-heads.net/avatar/KingofHalo04/64", status: "idle", activity: "Ausente" },
  { id: "8", name: "XerxerBro", avatar: "https://mc-heads.net/avatar/XerxerBro/64", status: "offline", activity: "Desconectado hace 3d" },
];

export const SocialPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<FriendItem | null>(null);
  const [messages, setMessages] = useState<{ sender: "me" | "them"; text: string; time: string }[]>([
    { sender: "them", text: "bro ya estás listo para raidear la dungeon en CrystalTides?", time: "18:45" },
    { sender: "me", text: "dame 5 mins, estoy actualizando los mods en el nuevo launcher", time: "18:48" },
    { sender: "them", text: "dale te espero en el lobby central 🚀", time: "18:49" },
  ]);
  const [inputValue, setInputValue] = useState("");

  if (!isOpen) return null;

  const onlineFriends = DEFAULT_FRIENDS.filter((f) => f.status !== "offline");
  const offlineFriends = DEFAULT_FRIENDS.filter((f) => f.status === "offline");

  const filteredOnline = onlineFriends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    setMessages((prev) => [...prev, { sender: "me", text: inputValue, time: timeStr }]);
    setInputValue("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "them",
          text: "¡Perfecto! Nos vemos adentro.",
          time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`,
        },
      ]);
    }, 1200);
  };

  return (
    <aside
      aria-label="Panel Social de CrystalTides"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: 320,
        backgroundColor: "#070409",
        borderLeft: "1px solid rgba(45, 212, 191, 0.2)",
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
        boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <div role="tablist" aria-label="Secciones del panel social" style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <button
            role="tab"
            aria-selected={activeTab === "friends"}
            aria-label={`Amigos (${onlineFriends.length} conectados)`}
            type="button"
            onClick={() => setActiveTab("friends")}
            style={{
              background: "none",
              border: "none",
              fontSize: 14,
              fontWeight: 800,
              color: activeTab === "friends" ? "#FFFFFF" : "rgba(255, 255, 255, 0.4)",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Amigos
            <span
              style={{
                fontSize: 10,
                padding: "2px 6px",
                borderRadius: 999,
                backgroundColor: "rgba(45, 212, 191, 0.15)",
                color: "#2dd4bf",
                fontWeight: 900,
              }}
            >
              {onlineFriends.length}
            </span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "requests"}
            aria-label="Solicitudes de amistad"
            type="button"
            onClick={() => setActiveTab("requests")}
            style={{
              background: "none",
              border: "none",
              fontSize: 14,
              fontWeight: 800,
              color: activeTab === "requests" ? "#FFFFFF" : "rgba(255, 255, 255, 0.4)",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Solicitudes
          </button>
        </div>

        <button
          aria-label="Cerrar panel social"
          type="button"
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255, 255, 255, 0.5)",
            cursor: "pointer",
            padding: 4,
            display: "flex",
          }}
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      {/* Search Input */}
      <div style={{ padding: "12px 16px" }}>
        <input
          type="text"
          aria-label="Buscar un jugador en la lista de amigos"
          placeholder="Buscar un jugador..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 10,
            padding: "8px 12px",
            color: "#FFF",
            fontSize: 12,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Friends List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(255, 255, 255, 0.4)",
            padding: "8px 4px 4px",
          }}
        >
          En Línea ({filteredOnline.length})
        </div>

        {filteredOnline.map((friend) => {
          const isSelected = selectedFriend?.id === friend.id;
          return (
            <div
              key={friend.id}
              onClick={() => setSelectedFriend(friend)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 10px",
                borderRadius: 10,
                backgroundColor: isSelected
                  ? "rgba(45, 212, 191, 0.15)"
                  : "rgba(255, 255, 255, 0.02)",
                border: isSelected
                  ? "1px solid rgba(45, 212, 191, 0.4)"
                  : "1px solid transparent",
                cursor: "pointer",
                transition: "all 150ms ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Avatar + Status Indicator */}
                <div style={{ position: "relative", width: 32, height: 32 }}>
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 8,
                      backgroundColor: "#1a1222",
                    }}
                    onError={(e) => {
                      e.currentTarget.src = "https://mc-heads.net/avatar/Steve/64";
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: -2,
                      right: -2,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor:
                        friend.status === "in-game"
                          ? "#2dd4bf"
                          : friend.status === "in-launcher"
                          ? "#a855f7"
                          : "#fbbf24",
                      boxShadow: "0 0 6px rgba(0,0,0,0.8)",
                    }}
                  />
                </div>

                {/* Name & Activity */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#FFFFFF" }}>
                    {friend.name}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color:
                        friend.status === "in-game"
                          ? "#2dd4bf"
                          : "rgba(255, 255, 255, 0.5)",
                    }}
                  >
                    {friend.activity}
                  </span>
                </div>
              </div>

              {/* Chat action button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFriend(friend);
                }}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "none",
                  borderRadius: 6,
                  color: "rgba(255, 255, 255, 0.6)",
                  padding: 6,
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                <MessageSquare size={13} />
              </button>
            </div>
          );
        })}

        {/* Offline friends */}
        {offlineFriends.length > 0 && (
          <>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(255, 255, 255, 0.3)",
                padding: "16px 4px 4px",
              }}
            >
              Desconectados ({offlineFriends.length})
            </div>
            {offlineFriends.map((f) => (
              <div
                key={f.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 10px",
                  opacity: 0.45,
                }}
              >
                <img
                  src={f.avatar}
                  alt={f.name}
                  style={{ width: 28, height: 28, borderRadius: 6, filter: "grayscale(1)" }}
                />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#FFF" }}>{f.name}</span>
                  <span style={{ fontSize: 9.5, color: "#888" }}>{f.activity}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* 💬 Active Chat Overlay */}
      {selectedFriend && (
        <div
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            left: 12,
            height: 290,
            backgroundColor: "#0d0714",
            border: "1px solid rgba(45, 212, 191, 0.35)",
            borderRadius: 14,
            boxShadow: "0 16px 36px rgba(0, 0, 0, 0.9)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 60,
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              padding: "10px 12px",
              backgroundColor: "rgba(45, 212, 191, 0.12)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img
                src={selectedFriend.avatar}
                alt=""
                style={{ width: 24, height: 24, borderRadius: 6 }}
              />
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: "#FFF" }}>
                  {selectedFriend.name}
                </div>
                <div style={{ fontSize: 9, color: "#2dd4bf" }}>{selectedFriend.activity}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedFriend(null)}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255, 255, 255, 0.6)",
                cursor: "pointer",
                padding: 2,
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              padding: "10px 12px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === "me" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  backgroundColor:
                    m.sender === "me"
                      ? "rgba(45, 212, 191, 0.25)"
                      : "rgba(255, 255, 255, 0.06)",
                  border:
                    m.sender === "me"
                      ? "1px solid rgba(45, 212, 191, 0.45)"
                      : "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 10,
                  padding: "6px 10px",
                }}
              >
                <div style={{ fontSize: 11, color: "#FFF", lineHeight: 1.35 }}>{m.text}</div>
                <div
                  style={{
                    fontSize: 8.5,
                    color: "rgba(255, 255, 255, 0.4)",
                    textAlign: "right",
                    marginTop: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 3,
                  }}
                >
                  {m.time}
                  {m.sender === "me" && <CheckCheck size={10} color="#2dd4bf" />}
                </div>
              </div>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: "8px 10px",
              borderTop: "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: "rgba(0, 0, 0, 0.4)",
            }}
          >
            <input
              type="text"
              aria-label={`Escribir mensaje para ${selectedFriend.name}`}
              placeholder={`Enviar mensaje a ${selectedFriend.name}...`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{
                flex: 1,
                backgroundColor: "transparent",
                border: "none",
                outline: "none",
                color: "#FFF",
                fontSize: 11,
              }}
            />
            <button
              aria-label="Enviar mensaje"
              type="submit"
              style={{
                background: "linear-gradient(135deg, #2dd4bf, #0d9488)",
                border: "none",
                borderRadius: 6,
                padding: "4px 8px",
                color: "#022c22",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
              }}
            >
              <Send size={12} aria-hidden="true" />
            </button>
          </form>
        </div>
      )}
    </aside>
  );
};
