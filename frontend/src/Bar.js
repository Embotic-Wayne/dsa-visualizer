export default function Bar({ height, active = false, sorted = false }) {
  return (
    <div
      className={`bar ${active ? "active" : ""} ${sorted ? "sorted" : ""}`}
      style={{ height }}
    />
  );
}
