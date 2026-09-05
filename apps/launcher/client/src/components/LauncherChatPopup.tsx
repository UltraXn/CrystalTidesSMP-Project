import React from "react";
import { FriendEntry, ChatMessage } from "./types";

interface LauncherChatPopupProps {
  friend: FriendEntry;
  messages: ChatMessage[];
  chatInput: string;
  onChatInputChange: (val: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  onCloseChat: () => void;
}

export const LauncherChatPopup: React.FC<LauncherChatPopupProps> = ({
  friend,
  messages,
  chatInput,
  onChatInputChange,
  onSendMessage,
  onCloseChat,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        right: 345,
        width: 290,
        height: 320,
        backgroundColor: "#080c14",
        border: "1px solid rgba(45, 212, 191, 0.35)",
        borderRadius: 14,
        boxShadow: "0 20px 48px rgba(0, 0, 0, 0.8)",
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "10px 12px",
          backgroundColor: "rgba(45, 212, 191, 0.1)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src={friend.avatar} alt="" style={{ width: 22, height: 22, borderRadius: 5 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#FFF" }}>{friend.name}</div>
            <div style={{ fontSize: 9.5, color: "#2DD4BF" }}>{friend.status}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onCloseChat}
          style={{ background: "none", border: "none", color: "rgba(255, 255, 255, 0.6)", cursor: "pointer", display: "flex", padding: 2 }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Message Thread */}
      <div style={{ flex: 1, padding: 12, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: m.sender === "me" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              backgroundColor: m.sender === "me" ? "rgba(45, 212, 191, 0.2)" : "rgba(255, 255, 255, 0.06)",
              border: m.sender === "me" ? "1px solid rgba(45, 212, 191, 0.35)" : "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 10,
              padding: "6px 10px",
              fontSize: 11,
              color: "#FFF",
            }}
          >
            <div>{m.text}</div>
            <div style={{ fontSize: 8.5, color: "rgba(255, 255, 255, 0.4)", textAlign: "right", marginTop: 2 }}>
              {m.time}
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={onSendMessage} style={{ padding: 8, borderTop: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", gap: 6, backgroundColor: "#05070d" }}>
        <input
          type="text"
          placeholder="Send a message..."
          value={chatInput}
          onChange={(e) => onChatInputChange(e.target.value)}
          style={{
            flex: 1,
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 8,
            padding: "6px 10px",
            color: "#FFF",
            fontSize: 11,
            outline: "none",
          }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: "#2DD4BF",
            border: "none",
            borderRadius: 8,
            padding: "0 10px",
            color: "#041C18",
            fontWeight: 800,
            fontSize: 11,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
};
