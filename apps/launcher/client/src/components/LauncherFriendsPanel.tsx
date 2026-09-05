import React, { useState } from "react";
import { MorphIcon } from "morphicons/react";
import {
  UserPlus,
  Check,
  X,
  Search,
  Users,
  Star,
} from "lucide";
import { FriendEntry } from "./types";
import {
  FriendRequest,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  toggleFavoriteFriend,
} from "../services/friendsService";

interface LauncherFriendsPanelProps {
  friendsOnline: FriendEntry[];
  friendsOffline: FriendEntry[];
  friendRequests?: FriendRequest[];
  searchFriend: string;
  onSearchFriendChange: (val: string) => void;
  onSelectFriendChat: (friend: FriendEntry) => void;
  onRefreshFriends?: () => void;
}

const getStatusDotColor = (type: string) => {
  switch (type) {
    case "online":
      return "#2ED96B"; // Green (Online in Figma)
    case "launcher":
      return "#F2B82E"; // Yellow/Amber (In Launcher/Menus)
    case "menu":
      return "#F2B82E"; // Yellow
    case "idle":
      return "#F2B82E"; // Amber
    default:
      return "#737A8C"; // Gray (Offline)
  }
};

export const LauncherFriendsPanel: React.FC<LauncherFriendsPanelProps> = ({
  friendsOnline,
  friendsOffline,
  friendRequests = [],
  searchFriend,
  onSearchFriendChange,
  onSelectFriendChat,
  onRefreshFriends,
}) => {
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addUsernameInput, setAddUsernameInput] = useState("");
  const [addFeedback, setAddFeedback] = useState<{ msg: string; success: boolean } | null>(null);

  const filteredOnline = friendsOnline.filter((f) =>
    f.name.toLowerCase().includes(searchFriend.toLowerCase())
  );
  const filteredOffline = friendsOffline.filter((f) =>
    f.name.toLowerCase().includes(searchFriend.toLowerCase())
  );

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUsernameInput.trim()) return;
    const res = await sendFriendRequest(addUsernameInput);
    setAddFeedback({ msg: res.message, success: res.success });
    if (res.success) {
      setAddUsernameInput("");
      onRefreshFriends?.();
      setTimeout(() => {
        setAddFeedback(null);
        setIsAddModalOpen(false);
      }, 1500);
    }
  };

  const handleAccept = (reqId: string) => {
    acceptFriendRequest(reqId);
    onRefreshFriends?.();
  };

  const handleReject = (reqId: string) => {
    rejectFriendRequest(reqId);
    onRefreshFriends?.();
  };

  const handleRemove = (friendName: string) => {
    if (confirm(`¿Eliminar a ${friendName} de tu lista de amigos?`)) {
      removeFriend(friendName);
      onRefreshFriends?.();
    }
  };

  const handleFavorite = (friendName: string) => {
    toggleFavoriteFriend(friendName);
    onRefreshFriends?.();
  };

  const isFriendsEmpty = filteredOnline.length === 0 && filteredOffline.length === 0;

  return (
    <aside
      style={{
        width: 331,
        minWidth: 331,
        backgroundColor: "#090A0D",
        borderLeft: "1px solid #1F2430",
        display: "flex",
        flexDirection: "column",
        padding: "18px 24px",
        gap: 12,
        boxSizing: "border-box",
        zIndex: 10,
        height: "100%",
        userSelect: "none",
        position: "relative",
      }}
    >
      {/* Header Tabs (Exact Noctra / Figma Style) */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 900 }}>
          <span
            onClick={() => setActiveTab("friends")}
            style={{
              color: activeTab === "friends" ? "#FAFCFF" : "#73809E",
              cursor: "pointer",
              letterSpacing: "-0.01em",
              transition: "color 150ms ease",
            }}
          >
            Friends
          </span>
          <span style={{ color: "#262E42", fontWeight: 400 }}>|</span>
          <span
            onClick={() => setActiveTab("requests")}
            style={{
              color: activeTab === "requests" ? "#FAFCFF" : "#73809E",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              letterSpacing: "-0.01em",
              transition: "color 150ms ease",
            }}
          >
            <span>Requests</span>
            {friendRequests.length > 0 && (
              <span
                style={{
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: "#F2B82E",
                  color: "#090A0D",
                  fontSize: 9.5,
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                }}
              >
                {friendRequests.length}
              </span>
            )}
          </span>
        </div>

        {/* Add Friend Button with Squircle Box */}
        <button
          type="button"
          onClick={() => setIsAddModalOpen(!isAddModalOpen)}
          aria-label="Add Friend"
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            backgroundColor: isAddModalOpen ? "#1A1F29" : "#12141C",
            border: isAddModalOpen ? "1px solid #2E384D" : "1px solid #292E40",
            color: isAddModalOpen ? "#2DD4BF" : "#73809E",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 150ms ease",
          }}
          title="Add Friend"
        >
          <MorphIcon icon={UserPlus} size={15} color="currentColor" strokeWidth={2.2} />
        </button>
      </div>

      {/* Add Friend Inline Drawer */}
      {isAddModalOpen && (
        <form
          onSubmit={handleSendRequest}
          style={{
            backgroundColor: "#0B0D12",
            border: "1px solid #262E42",
            borderRadius: 12,
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, color: "#FAFCFF" }}>Añadir Amigo</div>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              type="text"
              placeholder="Username de Minecraft..."
              value={addUsernameInput}
              onChange={(e) => setAddUsernameInput(e.target.value)}
              style={{
                flex: 1,
                backgroundColor: "#12141C",
                border: "1px solid #292E40",
                borderRadius: 6,
                padding: "6px 10px",
                color: "#FAFCFF",
                fontSize: 11,
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "0 12px",
                backgroundColor: "#2DD4BF",
                border: "none",
                borderRadius: 6,
                color: "#090A0D",
                fontWeight: 800,
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              Enviar
            </button>
          </div>
          {addFeedback && (
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: addFeedback.success ? "#2DD4BF" : "#EF4444",
              }}
            >
              {addFeedback.msg}
            </div>
          )}
        </form>
      )}

      {/* Tab Content: FRIENDS vs REQUESTS */}
      {activeTab === "requests" ? (
        /* ── REQUESTS TAB ── */
        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, overflowY: "auto" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#73809E", textTransform: "uppercase" }}>
            Solicitudes Pendientes ({friendRequests.length})
          </div>

          {friendRequests.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#616B85", fontSize: 11.5 }}>
              No tienes solicitudes de amistad pendientes.
            </div>
          ) : (
            friendRequests.map((req) => (
              <div
                key={req.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "rgba(14, 16, 22, 0.35)",
                  border: "1px solid #1F2430",
                  borderRadius: 10,
                  padding: "10px 12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <img
                    src={req.avatar}
                    alt={req.username}
                    style={{ width: 28, height: 28, borderRadius: 6, imageRendering: "pixelated" }}
                  />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#FAFCFF" }}>{req.username}</div>
                    <div style={{ fontSize: 9.5, color: "#8591AD" }}>{req.sentAt}</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => handleAccept(req.id)}
                    title="Aceptar"
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      backgroundColor: "rgba(45, 212, 191, 0.2)",
                      border: "1px solid rgba(45, 212, 191, 0.5)",
                      color: "#2DD4BF",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MorphIcon icon={Check} size={13} color="#2DD4BF" strokeWidth={3} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(req.id)}
                    title="Rechazar"
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      backgroundColor: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                      color: "#EF4444",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MorphIcon icon={X} size={13} color="#EF4444" strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* ── FRIENDS TAB ── */
        <>
          {/* Search Box */}
          <div style={{ position: "relative", width: "100%" }}>
            <div
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
              }}
            >
              <MorphIcon icon={Search} size={14} color="#73809E" strokeWidth={2.2} />
            </div>
            <input
              type="text"
              placeholder="Find a player..."
              value={searchFriend}
              onChange={(e) => onSearchFriendChange(e.target.value)}
              style={{
                width: "100%",
                backgroundColor: "#12141C",
                border: "1px solid #292E40",
                borderRadius: 10,
                padding: "9px 12px 9px 36px",
                color: "#FAFCFF",
                fontSize: 12,
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 150ms ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.4)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#292E40";
              }}
            />
          </div>

          {/* Friends List or Empty State */}
          {isFriendsEmpty ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "24px 16px",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: "#12141C",
                  border: "1px solid #292E40",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#73809E",
                }}
              >
                <MorphIcon icon={Users} size={22} color="#73809E" strokeWidth={1.8} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#FAFCFF" }}>
                  {searchFriend ? "No se encontraron jugadores" : "No tienes amigos aún"}
                </div>
                <div style={{ fontSize: 11, color: "#8591AD", lineHeight: 1.4 }}>
                  {searchFriend
                    ? `No hay resultados para "${searchFriend}"`
                    : "Agrega a tus amigos de CrystalTides o Minecraft para ver cuándo están en línea y jugar juntos."}
                </div>
              </div>
              {!searchFriend && (
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  style={{
                    marginTop: 4,
                    padding: "8px 16px",
                    borderRadius: 8,
                    backgroundColor: "rgba(45, 212, 191, 0.12)",
                    border: "1px solid rgba(45, 212, 191, 0.35)",
                    color: "#2DD4BF",
                    fontSize: 11.5,
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all 150ms ease",
                  }}
                >
                  + Añadir Primer Amigo
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minHeight: 0, overflowY: "auto" }}>
              {/* Online Friends Section */}
              {filteredOnline.length > 0 && (
                <>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#73809E",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      paddingLeft: 2,
                    }}
                  >
                    Online — {filteredOnline.length}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {filteredOnline.map((friend) => (
                      <div
                        key={friend.name}
                        onClick={() => onSelectFriendChat(friend)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 10px",
                          borderRadius: 10,
                          backgroundColor: "rgba(14, 16, 22, 0.35)",
                          cursor: "pointer",
                          transition: "all 120ms ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(14, 16, 22, 0.75)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(14, 16, 22, 0.35)";
                        }}
                      >
                        {/* Left: Avatar + Indicator + Name + Status */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ position: "relative" }}>
                            <img
                              src={friend.avatar}
                              alt={friend.name}
                              style={{ width: 32, height: 32, borderRadius: 8, imageRendering: "pixelated" }}
                            />
                            <span
                              style={{
                                position: "absolute",
                                bottom: -2,
                                right: -2,
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: getStatusDotColor(friend.statusType),
                                border: "2px solid #090A0D",
                              }}
                            />
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 12.5, fontWeight: 800, color: "#F5F7FF" }}>
                                {friend.name}
                              </span>
                              {friend.hasUnreadMessage && (
                                <span
                                  style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    backgroundColor: "#2DD4BF",
                                  }}
                                />
                              )}
                            </div>
                            <span style={{ fontSize: 10.5, color: "#8591AD" }}>
                              {friend.status}
                            </span>
                          </div>
                        </div>

                        {/* Right quick actions (Favorite + Remove) */}
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavorite(friend.name);
                            }}
                            title="Favorite"
                            style={{
                              background: "none",
                              border: "none",
                              color: "#73809E",
                              cursor: "pointer",
                              padding: 2,
                              display: "flex",
                            }}
                          >
                            <MorphIcon icon={Star} size={13} color="currentColor" strokeWidth={2} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemove(friend.name);
                            }}
                            title="Remove Friend"
                            style={{
                              background: "none",
                              border: "none",
                              color: "#616B85",
                              cursor: "pointer",
                              padding: 2,
                              display: "flex",
                            }}
                          >
                            <MorphIcon icon={X} size={13} color="currentColor" strokeWidth={2.2} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Offline Section */}
              {filteredOffline.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#616B85",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      paddingLeft: 2,
                    }}
                  >
                    Offline — {filteredOffline.length}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {filteredOffline.map((friend) => (
                      <div
                        key={friend.name}
                        onClick={() => onSelectFriendChat(friend)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 10px",
                          borderRadius: 10,
                          backgroundColor: "rgba(11, 13, 17, 0.25)",
                          cursor: "pointer",
                          transition: "all 120ms ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(11, 13, 17, 0.55)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(11, 13, 17, 0.25)";
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <img
                            src={friend.avatar}
                            alt={friend.name}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 7,
                              filter: "grayscale(100%)",
                              imageRendering: "pixelated",
                            }}
                          />
                          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#A6ADBF" }}>
                              {friend.name}
                            </span>
                            <span style={{ fontSize: 10, color: "#667085" }}>
                              {friend.status}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(friend.name);
                          }}
                          title="Remove Friend"
                          style={{
                            background: "none",
                            border: "none",
                            color: "#616B85",
                            cursor: "pointer",
                            padding: 2,
                            display: "flex",
                          }}
                        >
                          <MorphIcon icon={X} size={13} color="currentColor" strokeWidth={2.2} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </aside>
  );
};
