import React from "react";

export const LauncherNewsFeed: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 9,
        width: "100%",
        flex: 1,
        minHeight: 0,
        marginTop: 80,
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Header: NEWS FEED (Figma Node 10:1622 at y: 441) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 2px",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "#FAFCFF",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontFamily: "'Figtree', 'Inter', sans-serif",
          }}
        >
          NEWS FEED
        </span>
      </div>

      {/* Scrollable Feed Container (Fills to bottom edge of window) */}
      <div
        className="custom-scrollbar"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          width: "100%",
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: 16,
          paddingBottom: 64,
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* ── ROW 1: CHANGELOG (Left) + NEW VERSION (Right) ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            alignItems: "stretch",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Card 1: N CHANGELOG (Figma Node 10:1586) */}
          <div
            onClick={() => window.open("https://crystaltidessmp.net/news", "_blank")}
            style={{
              width: "100%",
              height: 169,
              borderRadius: 14,
              backgroundColor: "#11131A",
              border: "1px solid #262E42",
              display: "flex",
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              transition: "all 160ms ease",
              boxSizing: "border-box",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#404D6B";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#262E42";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Left Glyph Artwork Panel (130px) - Exact Figma Gradient */}
            <div
              style={{
                width: 130,
                height: "100%",
                background: "linear-gradient(135deg, #D9E0F2 0%, #737A94 50%, #1F2433 100%)",
                borderRight: "1px solid #262E42",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: "#F2FAFF",
                fontSize: 26,
                fontWeight: 900,
                lineHeight: 1.2,
                userSelect: "none",
              }}
            >
              <div>▲▼</div>
              <div style={{ fontSize: 18, color: "#F2FAFF", marginTop: 4 }}>✦</div>
            </div>

            {/* Right Details */}
            <div
              style={{
                flex: 1,
                padding: "16px 18px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxSizing: "border-box",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#FAFCFF",
                    fontFamily: "'Figtree', 'Inter', sans-serif",
                    lineHeight: 1.3,
                  }}
                >
                  <span style={{ color: "#2DD4BF" }}>N </span> CHANGELOG
                </div>
                <div
                  style={{
                    fontSize: 10.5,
                    color: "#949EB8",
                    fontFamily: "monospace",
                    marginTop: 2,
                  }}
                >
                  &gt; fetching build_0.9.2...
                </div>

                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                    fontSize: 10,
                    color: "#949EB8",
                    fontFamily: "'Figtree', 'Inter', sans-serif",
                    lineHeight: 1.35,
                  }}
                >
                  <div>- Performance optimizations</div>
                  <div>- General bug fixes &amp; stability</div>
                </div>
              </div>

              {/* Bottom Actions: READ MORE + ↗ Icon */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 6,
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    backgroundColor: "#1F2638",
                    border: "1px solid #404D6B",
                    borderRadius: 6,
                    padding: "4px 10px",
                    fontSize: 9.5,
                    fontWeight: 800,
                    color: "#FAFCFF",
                    letterSpacing: "0.04em",
                    fontFamily: "'Figtree', 'Inter', sans-serif",
                  }}
                >
                  READ MORE
                </div>
                <span style={{ color: "#616B85", fontSize: 14 }}>↗</span>
              </div>
            </div>
          </div>

          {/* Card 2: NEW VERSION / 26.1 (Figma Node 10:1587) */}
          <div
            onClick={() => window.open("https://crystaltidessmp.net/download", "_blank")}
            style={{
              width: "100%",
              height: 169,
              borderRadius: 14,
              background: "linear-gradient(180deg, #142E1F 0%, #0A140F 100%)",
              border: "1px solid #38734D",
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              transition: "all 160ms ease",
              boxSizing: "border-box",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#61F27A";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#38734D";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div>
              {/* Green Badge: NEW VERSION! */}
              <div
                style={{
                  display: "inline-block",
                  backgroundColor: "#2EA647",
                  color: "#E5FFE5",
                  fontSize: 8.5,
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: 4,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontFamily: "'Figtree', 'Inter', sans-serif",
                }}
              >
                NEW VERSION!
              </div>

              {/* Subtitle */}
              <div
                style={{
                  fontSize: 11,
                  color: "#FAFCFF",
                  marginTop: 6,
                  fontFamily: "'Figtree', 'Inter', sans-serif",
                }}
              >
                New Minecraft version!
              </div>

              {/* Giant Version: 26.1 */}
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 900,
                  color: "#61F27A",
                  fontFamily: "'Figtree', 'Inter', sans-serif",
                  lineHeight: 1,
                  marginTop: 4,
                  letterSpacing: "-0.03em",
                }}
              >
                26.1
              </div>
            </div>

            {/* Bottom: Ready in Noctra + ↗ Icon */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#FAFCFF",
                  fontFamily: "'Figtree', 'Inter', sans-serif",
                }}
              >
                Ready in <span style={{ color: "#61F27A" }}>∿</span> Noctra
              </span>
              <span style={{ color: "#616B85", fontSize: 14 }}>↗</span>
            </div>
          </div>
        </div>

        {/* ── ROW 2: BECOME A CREATOR (Left) + NEW MODS (Right) ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            alignItems: "stretch",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Card 3: PARTNER PROGRAM / BECOME A CREATOR (Figma Node 10:1590) */}
          <div
            onClick={() => window.open("https://crystaltidessmp.net", "_blank")}
            style={{
              width: "100%",
              height: 169,
              borderRadius: 14,
              backgroundColor: "#1F140F",
              border: "1px solid #593826",
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              transition: "all 160ms ease",
              boxSizing: "border-box",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#FACC66";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#593826";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div>
              {/* Partner Badge */}
              <div
                style={{
                  display: "inline-block",
                  backgroundColor: "#80471A",
                  color: "#FACC66",
                  fontSize: 8.5,
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: 4,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontFamily: "'Figtree', 'Inter', sans-serif",
                }}
              >
                PARTNER PROGRAM
              </div>

              {/* Title: BECOME A CREATOR */}
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  color: "#FAFCFF",
                  fontFamily: "'Figtree', 'Inter', sans-serif",
                  lineHeight: 1.1,
                  marginTop: 10,
                  letterSpacing: "-0.01em",
                }}
              >
                BECOME A<br />CREATOR
              </div>

              {/* Subtitle */}
              <div
                style={{
                  fontSize: 10.5,
                  color: "#949EB8",
                  fontFamily: "'Figtree', 'Inter', sans-serif",
                  marginTop: 6,
                  lineHeight: 1.3,
                }}
              >
                Get your custom code, earn revenue, and unlock creator cosmetics
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <span style={{ color: "#616B85", fontSize: 14 }}>↗</span>
            </div>
          </div>

          {/* Card 4: NEW MODS! (Figma Node 10:1589) */}
          <div
            style={{
              width: "100%",
              height: 169,
              borderRadius: 14,
              backgroundColor: "#140D12",
              border: "1px solid #381F26",
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          >
            {/* Top: NEW MODS! Badge */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div
                style={{
                  display: "inline-block",
                  backgroundColor: "#731F29",
                  color: "#FF7380",
                  fontSize: 8.5,
                  fontWeight: 800,
                  padding: "2px 7px",
                  borderRadius: 4,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontFamily: "'Figtree', 'Inter', sans-serif",
                }}
              >
                NEW MODS!
              </div>
              <span style={{ color: "#616B85", fontSize: 14 }}>↗</span>
            </div>

            {/* 3 Mod mini cards with exact Figma colors */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
                marginTop: 6,
              }}
            >
              {[
                { icon: "⌘", title: "ADVANCED\nKEYSTROKES", bg: "#1F141A" },
                { icon: "🛡️", title: "COMBAT\nHUD", bg: "#1A241F" },
                { icon: "🌧️", title: "WEATHER\nCHANGER", bg: "#241714" },
              ].map((mod, mIdx) => (
                <div
                  key={mIdx}
                  style={{
                    height: 84,
                    borderRadius: 8,
                    backgroundColor: mod.bg,
                    border: "1px solid rgba(64, 46, 56, 0.6)",
                    padding: "8px 6px",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    gap: 6,
                    cursor: "pointer",
                    transition: "all 140ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#FF7380";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(64, 46, 56, 0.6)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <span style={{ fontSize: 16 }}>{mod.icon}</span>
                  <span
                    style={{
                      fontSize: 8.5,
                      fontWeight: 800,
                      color: "#D9E0F2",
                      lineHeight: 1.2,
                      whiteSpace: "pre-line",
                      fontFamily: "'Figtree', 'Inter', sans-serif",
                    }}
                  >
                    {mod.title}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom Tag: NEW MODULES */}
            <div style={{ textAlign: "center", marginTop: 2 }}>
              <span
                style={{
                  fontSize: 8.5,
                  fontWeight: 800,
                  color: "#616B85",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontFamily: "'Figtree', 'Inter', sans-serif",
                }}
              >
                NEW MODULES
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade Overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          background: "linear-gradient(to bottom, transparent 0%, rgba(9, 10, 13, 0.7) 50%, rgba(9, 10, 13, 1) 100%)",
          pointerEvents: "none",
          zIndex: 20,
        }}
      />
    </div>
  );
};
