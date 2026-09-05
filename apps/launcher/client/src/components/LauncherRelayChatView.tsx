import React, { useState, useEffect, useRef } from "react";
import { MorphIcon } from "morphicons/react";
import {
  Hash,
  Megaphone,
  Swords,
  LifeBuoy,
  User,
  Search,
  Send,
  Plus,
  X,
} from "lucide";
import { useAuth } from "../services/authContext";

export interface RelayChannel {
  id: string;
  name: string;
  topic: string;
  iconType: "hash" | "megaphone" | "swords" | "support" | "user";
  type: "channel" | "dm";
  unreadCount?: number;
  onlineCount?: number;
}

export interface RelayMessage {
  id: string;
  sender: string;
  senderAvatar: string;
  isMe: boolean;
  text: string;
  time: string;
  roleBadge?: string;
}

const DEFAULT_CHANNELS: RelayChannel[] = [
  {
    id: "global",
    name: "global",
    topic: "Chat general de la comunidad CrystalTides",
    iconType: "hash",
    type: "channel",
    onlineCount: 42,
  },
  {
    id: "anuncios",
    name: "anuncios",
    topic: "Novedades oficiales, torneos y actualizaciones",
    iconType: "megaphone",
    type: "channel",
    onlineCount: 128,
  },
  {
    id: "clanes",
    name: "clanes-squads",
    topic: "Reclutamiento de equipos, alianzas y facciones",
    iconType: "swords",
    type: "channel",
    onlineCount: 19,
  },
  {
    id: "ayuda",
    name: "soporte-staff",
    topic: "Canal de asistencia técnica y reportes",
    iconType: "support",
    type: "channel",
    onlineCount: 8,
  },
];

const INITIAL_CHANNEL_MESSAGES: Record<string, RelayMessage[]> = {
  global: [
    {
      id: "g1",
      sender: "CrystalBot",
      senderAvatar: "/logo.png",
      isMe: false,
      text: "¡Bienvenidos al Relay de CrystalTides! Sincronizado en tiempo real entre el Launcher y el Servidor.",
      time: "12:00",
      roleBadge: "SISTEMA",
    },
    {
      id: "g2",
      sender: "Vortex_Dev",
      senderAvatar: "https://mc-heads.net/avatar/Alex/32",
      isMe: false,
      text: "El nuevo parche de optimización de FPS y texturas 3D ya está activo para todos los jugadores.",
      time: "12:05",
      roleBadge: "STAFF",
    },
  ],
  anuncios: [
    {
      id: "a1",
      sender: "CrystalTides Staff",
      senderAvatar: "/logo.png",
      isMe: false,
      text: "¡Apertura de la Temporada 3 este fin de semana! Prepárense para nuevos biomas y dungeons custom.",
      time: "10:30",
      roleBadge: "ANUNCIO",
    },
  ],
  clanes: [
    {
      id: "c1",
      sender: "ShadowKnight",
      senderAvatar: "https://mc-heads.net/avatar/Steve/32",
      isMe: false,
      text: "Buscamos 2 builders y 1 redstoner para megabase en las coordenadas -1400 / 2200.",
      time: "11:15",
    },
  ],
  ayuda: [
    {
      id: "h1",
      sender: "Soporte_Andy",
      senderAvatar: "https://mc-heads.net/avatar/Andy/32",
      isMe: false,
      text: "¿Tienes problemas con tu skin o conexión? Déjanos tu ticket aquí o en Discord.",
      time: "09:00",
      roleBadge: "SOPORTE",
    },
  ],
};

const ChannelIcon: React.FC<{ iconType: RelayChannel["iconType"]; size?: number }> = ({ iconType, size = 14 }) => {
  switch (iconType) {
    case "hash":
      return <MorphIcon icon={Hash} size={size} color="currentColor" strokeWidth={2.2} />;
    case "megaphone":
      return <MorphIcon icon={Megaphone} size={size} color="currentColor" strokeWidth={2.2} />;
    case "swords":
      return <MorphIcon icon={Swords} size={size} color="currentColor" strokeWidth={2.2} />;
    case "support":
      return <MorphIcon icon={LifeBuoy} size={size} color="currentColor" strokeWidth={2.2} />;
    case "user":
    default:
      return <MorphIcon icon={User} size={size} color="currentColor" strokeWidth={2.2} />;
  }
};

export const LauncherRelayChatView: React.FC = () => {
  const { currentSession } = useAuth();
  const myUsername = currentSession?.username || "Player";
  const myAvatar = currentSession?.username
    ? `https://mc-heads.net/avatar/${currentSession.username}/32`
    : "https://mc-heads.net/avatar/Steve/32";

  const [channels, setChannels] = useState<RelayChannel[]>(DEFAULT_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState<string>("global");
  const [messagesMap, setMessagesMap] = useState<Record<string, RelayMessage[]>>(INITIAL_CHANNEL_MESSAGES);
  const [messageInput, setMessageInput] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [showAddFriend, setShowAddFriend] = useState<boolean>(false);
  const [newFriendNick, setNewFriendNick] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
  const activeMessages = messagesMap[activeChannelId] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages.length, activeChannelId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = messageInput.trim();
    if (!trimmed) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newMsg: RelayMessage = {
      id: `msg_${Date.now()}`,
      sender: myUsername,
      senderAvatar: myAvatar,
      isMe: true,
      text: trimmed,
      time: timeStr,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMsg],
    }));

    setMessageInput("");
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    const nick = newFriendNick.trim();
    if (!nick) return;

    const newDmChannel: RelayChannel = {
      id: `dm_${nick.toLowerCase()}`,
      name: nick,
      topic: `Mensajes directos con ${nick}`,
      iconType: "user",
      type: "dm",
      onlineCount: 1,
    };

    setChannels((prev) => {
      if (prev.some((c) => c.id === newDmChannel.id)) return prev;
      return [...prev, newDmChannel];
    });

    if (!messagesMap[newDmChannel.id]) {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      setMessagesMap((prev) => ({
        ...prev,
        [newDmChannel.id]: [
          {
            id: `dm_init_${Date.now()}`,
            sender: nick,
            senderAvatar: `https://mc-heads.net/avatar/${nick}/32`,
            isMe: false,
            text: `¡Hola ${myUsername}! Conectado a través de Crystal Relay.`,
            time: timeStr,
          },
        ],
      }));
    }

    setActiveChannelId(newDmChannel.id);
    setNewFriendNick("");
    setShowAddFriend(false);
  };

  const filteredChannels = channels.filter(
    (c) =>
      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.topic.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const officialChannels = filteredChannels.filter((c) => c.type === "channel");
  const directMessages = filteredChannels.filter((c) => c.type === "dm");

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "250px 1fr",
        width: "100%",
        height: "100%",
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#050307",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxSizing: "border-box",
        userSelect: "none",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* ── LEFT SIDEBAR: CHANNELS & DMS ── */}
      <div
        style={{
          backgroundColor: "#06080E",
          borderRight: "1px solid rgba(255, 255, 255, 0.07)",
          display: "flex",
          flexDirection: "column",
          padding: "14px 12px",
          gap: 12,
          overflowY: "auto",
        }}
      >
        {/* Title & Live Status */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.01em" }}>
              Crystal Relay
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              backgroundColor: "rgba(45, 212, 191, 0.1)",
              border: "1px solid rgba(45, 212, 191, 0.25)",
              borderRadius: 6,
              padding: "2px 6px",
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#2DD4BF" }} />
            <span style={{ fontSize: 9.5, fontWeight: 700, color: "#2DD4BF" }}>ONLINE</span>
          </div>
        </div>

        {/* Channel Search Input */}
        <div style={{ position: "relative", width: "100%" }}>
          <div
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <MorphIcon icon={Search} size={12} color="rgba(255, 255, 255, 0.4)" strokeWidth={2.2} />
          </div>
          <input
            type="text"
            placeholder="Buscar canal o amigo..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{
              width: "100%",
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.07)",
              borderRadius: 8,
              padding: "6px 10px 6px 28px",
              color: "#FFFFFF",
              fontSize: 11.5,
              outline: "none",
              boxSizing: "border-box",
              transition: "all 120ms ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.4)";
              e.currentTarget.style.backgroundColor = "rgba(45, 212, 191, 0.03)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)";
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
            }}
          />
        </div>

        {/* 1. Official Server Channels */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 9.5, fontWeight: 800, color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 4px" }}>
            Canales del Servidor
          </span>
          {officialChannels.map((chan) => {
            const isActive = activeChannelId === chan.id;
            return (
              <div
                key={chan.id}
                onClick={() => setActiveChannelId(chan.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "7px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                  backgroundColor: isActive ? "rgba(45, 212, 191, 0.1)" : "transparent",
                  border: isActive ? "1px solid rgba(45, 212, 191, 0.25)" : "1px solid transparent",
                  transition: "all 120ms ease",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <span style={{ fontSize: 12, color: isActive ? "#2DD4BF" : "rgba(255, 255, 255, 0.45)", fontWeight: 700, display: "flex" }}>
                    <ChannelIcon iconType={chan.iconType} size={14} />
                  </span>
                  <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {chan.name}
                  </span>
                </div>
                {chan.onlineCount && (
                  <span style={{ fontSize: 9.5, color: "rgba(255, 255, 255, 0.35)", fontWeight: 600 }}>
                    {chan.onlineCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* 2. Direct Messages & Friends */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
            <span style={{ fontSize: 9.5, fontWeight: 800, color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Mensajes Directos
            </span>
            <button
              type="button"
              onClick={() => setShowAddFriend(!showAddFriend)}
              style={{
                background: "none",
                border: "none",
                color: "#2DD4BF",
                fontSize: 10,
                fontWeight: 700,
                cursor: "pointer",
                padding: "2px 4px",
                display: "flex",
                alignItems: "center",
                gap: 3,
                transition: "opacity 120ms ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              <MorphIcon icon={showAddFriend ? X : Plus} size={11} color="currentColor" strokeWidth={2.5} />
              <span>{showAddFriend ? "Cerrar" : "Añadir"}</span>
            </button>
          </div>

          {/* Add Friend Input Modal/Inline */}
          {showAddFriend && (
            <form
              onSubmit={handleAddFriend}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                padding: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(45, 212, 191, 0.25)",
                borderRadius: 8,
                marginBottom: 4,
              }}
            >
              <input
                type="text"
                value={newFriendNick}
                onChange={(e) => setNewFriendNick(e.target.value)}
                placeholder="Nickname de amigo..."
                maxLength={16}
                autoFocus
                style={{
                  width: "100%",
                  height: 26,
                  borderRadius: 5,
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#FFFFFF",
                  fontSize: 11,
                  padding: "0 6px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="submit"
                style={{
                  height: 24,
                  borderRadius: 5,
                  backgroundColor: "#2DD4BF",
                  border: "none",
                  color: "#061A17",
                  fontSize: 10.5,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Iniciar Chat
              </button>
            </form>
          )}

          {directMessages.length > 0 ? (
            directMessages.map((dm) => {
              const isActive = activeChannelId === dm.id;
              return (
                <div
                  key={dm.id}
                  onClick={() => setActiveChannelId(dm.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 10px",
                    borderRadius: 8,
                    cursor: "pointer",
                    backgroundColor: isActive ? "rgba(45, 212, 191, 0.1)" : "transparent",
                    border: isActive ? "1px solid rgba(45, 212, 191, 0.25)" : "1px solid transparent",
                    transition: "all 120ms ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <img
                    src={`https://mc-heads.net/avatar/${dm.name}/22`}
                    alt=""
                    style={{ width: 20, height: 20, borderRadius: 4 }}
                    onError={(e) => { e.currentTarget.src = "/logo.png"; }}
                  />
                  <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {dm.name}
                  </span>
                </div>
              );
            })
          ) : (
            <div style={{ fontSize: 10.5, color: "rgba(255, 255, 255, 0.35)", padding: "4px 6px" }}>
              Sin chats privados
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT COLUMN: ACTIVE CHAT CONVERSATION VIEW ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          backgroundColor: "#07090F",
          position: "relative",
        }}
      >
        {/* Top Channel Header */}
        <div
          style={{
            height: 52,
            padding: "0 20px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "rgba(6, 8, 14, 0.6)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {activeChannel.type === "dm" ? (
              <img
                src={`https://mc-heads.net/avatar/${activeChannel.name}/30`}
                alt=""
                style={{ width: 28, height: 28, borderRadius: 6 }}
                onError={(e) => { e.currentTarget.src = "/logo.png"; }}
              />
            ) : (
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  backgroundColor: "rgba(45, 212, 191, 0.1)",
                  border: "1px solid rgba(45, 212, 191, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#2DD4BF",
                }}
              >
                <ChannelIcon iconType={activeChannel.iconType} size={15} />
              </div>
            )}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#FFFFFF" }}>
                  {activeChannel.type === "channel" ? `#${activeChannel.name}` : activeChannel.name}
                </span>
              </div>
              <div style={{ fontSize: 10.5, color: "rgba(255, 255, 255, 0.45)", fontWeight: 500 }}>
                {activeChannel.topic}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.4)", backgroundColor: "rgba(255, 255, 255, 0.04)", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(255, 255, 255, 0.07)" }}>
              Servidor CrystalTides
            </span>
          </div>
        </div>

        {/* Message Thread */}
        <div
          style={{
            flex: 1,
            padding: "16px 20px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {activeMessages.length > 0 ? (
            activeMessages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  gap: 10,
                  alignSelf: m.isMe ? "flex-end" : "flex-start",
                  maxWidth: "75%",
                  flexDirection: m.isMe ? "row-reverse" : "row",
                }}
              >
                <img
                  src={m.senderAvatar}
                  alt={m.sender}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 7,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                  onError={(e) => { e.currentTarget.src = "/logo.png"; }}
                />

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: m.isMe ? "flex-end" : "flex-start",
                  }}
                >
                  {/* Sender Name & Role */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 3,
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 700, color: m.isMe ? "#2DD4BF" : "rgba(255, 255, 255, 0.85)" }}>
                      {m.sender}
                    </span>
                    {m.roleBadge && (
                      <span
                        style={{
                          fontSize: 8.5,
                          fontWeight: 800,
                          backgroundColor: "rgba(45, 212, 191, 0.15)",
                          border: "1px solid rgba(45, 212, 191, 0.3)",
                          color: "#2DD4BF",
                          padding: "1px 5px",
                          borderRadius: 4,
                          textTransform: "uppercase",
                        }}
                      >
                        {m.roleBadge}
                      </span>
                    )}
                    <span style={{ fontSize: 9.5, color: "rgba(255, 255, 255, 0.35)" }}>
                      {m.time}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    style={{
                      backgroundColor: m.isMe ? "rgba(45, 212, 191, 0.12)" : "rgba(255, 255, 255, 0.035)",
                      border: m.isMe ? "1px solid rgba(45, 212, 191, 0.28)" : "1px solid rgba(255, 255, 255, 0.07)",
                      borderRadius: 12,
                      padding: "8px 12px",
                      color: m.isMe ? "#FFFFFF" : "rgba(255, 255, 255, 0.9)",
                      fontSize: 12,
                      lineHeight: 1.45,
                      wordBreak: "break-word",
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255, 255, 255, 0.35)", fontSize: 12 }}>
              Sé el primero en enviar un mensaje en este canal.
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <form
          onSubmit={handleSendMessage}
          style={{
            padding: "12px 18px",
            borderTop: "1px solid rgba(255, 255, 255, 0.07)",
            backgroundColor: "#06080E",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <input
            type="text"
            placeholder={
              activeChannel.type === "channel"
                ? `Enviar mensaje a #${activeChannel.name}...`
                : `Enviar mensaje a ${activeChannel.name}...`
            }
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            style={{
              flex: 1,
              backgroundColor: "rgba(255, 255, 255, 0.035)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 10,
              padding: "10px 14px",
              color: "#FFFFFF",
              fontSize: 12,
              outline: "none",
              transition: "all 120ms ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.4)";
              e.currentTarget.style.backgroundColor = "rgba(45, 212, 191, 0.03)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.035)";
            }}
          />
          <button
            type="submit"
            style={{
              height: 38,
              padding: "0 16px",
              borderRadius: 10,
              background: "linear-gradient(180deg, #3ec5b6 0%, #1ea596 55%, #158b7e 100%)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#FFFFFF",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 800,
              boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)",
              transition: "all 120ms ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; }}
          >
            <span>Enviar</span>
            <MorphIcon icon={Send} size={13} color="currentColor" strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
};
