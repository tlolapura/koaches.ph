import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "PickleKoach — Pickleball Coaching Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const mascotPath = join(process.cwd(), "public/illustrations/mascot.png");
  const mascot = await readFile(mascotPath);
  const mascotSrc = `data:image/png;base64,${mascot.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#FAFAF8",
        }}
      >
        <div style={{ height: 14, width: "100%", backgroundColor: "#16A34A" }} />
        <div
          style={{
            height: 5,
            width: "72%",
            backgroundColor: "#FACC15",
            margin: "10px auto 0",
          }}
        />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 72px",
            gap: 56,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- next/og ImageResponse */}
          <img src={mascotSrc} width={240} height={240} style={{ objectFit: "contain" }} alt="" />
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                fontSize: 84,
                fontWeight: 800,
                letterSpacing: -3,
                lineHeight: 1,
              }}
            >
              <span style={{ color: "#16A34A" }}>Pickle</span>
              <span style={{ color: "#4F8FF7" }}>Koach</span>
            </div>
            <div style={{ fontSize: 34, color: "#6B7280", fontWeight: 600, lineHeight: 1.3 }}>
              Pickleball coaching in the Philippines
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
