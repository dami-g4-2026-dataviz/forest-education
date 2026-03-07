import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a1612",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" fill="#4ade80" opacity="0.15" />
          <circle cx="16" cy="12" r="6" fill="#4ade80" opacity="0.4" />
          <circle cx="10" cy="15" r="5" fill="#4ade80" opacity="0.35" />
          <circle cx="22" cy="15" r="5" fill="#4ade80" opacity="0.35" />
          <circle cx="13" cy="19" r="4.5" fill="#4ade80" opacity="0.3" />
          <circle cx="19" cy="19" r="4.5" fill="#4ade80" opacity="0.3" />
          <circle cx="16" cy="15" r="5" fill="#4ade80" opacity="0.6" />
          <circle cx="16" cy="14" r="2.5" fill="#4ade80" opacity="0.9" />
        </svg>
      </div>
    ),
    size
  );
}
