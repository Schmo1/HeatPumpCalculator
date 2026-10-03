// Shared chart chrome so every chart in the app reads as one system.

export const axisTick = { fill: "var(--muted)", fontSize: 12 };

export const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  boxShadow: "0 6px 16px rgba(26, 26, 24, 0.08)",
  fontSize: 12,
};

export const legendStyle = { fontSize: 12, paddingTop: 10 };
export const barCursor = { fill: "rgba(26, 26, 24, 0.04)" };

// Identity rides the legend swatch, never the label text.
export const legendLabel = (value: string) => (
  <span style={{ color: "var(--text-secondary)" }}>{value}</span>
);
