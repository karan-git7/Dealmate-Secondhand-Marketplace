import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import BoostModal from "./BoostModal";
import { Zap, Clock, Package } from "lucide-react";

function timeRemaining(boostedUntil) {
  if (!boostedUntil) return null;
  const diff = new Date(boostedUntil).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h remaining`;
  }
  return `${hours}h ${minutes}m remaining`;
}

export default function BoostedInventory({ isEmbedded = false }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [boostTarget, setBoostTarget] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/products/boosted/list");
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load boosted products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleBoosted = () => {
    setBoostTarget(null);
    load();
  };

  if (loading) return (
    <div style={{ padding: 32, textAlign: "center", color: "#6b7280" }}>Loading boosted products...</div>
  );

  return (
    <div style={{ padding: isEmbedded ? "16px 0" : "24px" }}>
      {!isEmbedded && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <Zap size={22} color="#f59e0b" />
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>Boosted Ads</h2>
        </div>
      )}

      {products.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "48px 24px", background: "#f9fafb",
          borderRadius: 12, border: "2px dashed #e5e7eb"
        }}>
          <Zap size={40} color="#d1d5db" style={{ marginBottom: 12 }} />
          <p style={{ color: "#6b7280", margin: 0 }}>No active boosted products.</p>
          <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 4 }}>
            Boost a product from Products tab to appear at the top.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {products.map(p => {
            const isActive = p.boostedUntil && new Date(p.boostedUntil) > new Date(now);
            const timeLeft = timeRemaining(p.boostedUntil);
            const pct = isActive
              ? Math.max(0, ((new Date(p.boostedUntil) - now) / (24 * 3600000)) * 100)
              : 0;

            return (
              <div key={p._id} style={{
                display: "flex", alignItems: "center", gap: 16,
                background: "#fff", borderRadius: 12, padding: "16px",
                border: `1.5px solid ${isActive ? "#fde68a" : "#e5e7eb"}`,
                boxShadow: isActive ? "0 2px 8px rgba(245,158,11,0.08)" : "0 1px 3px rgba(0,0,0,0.05)"
              }}>
                <img
                  src={p.images?.[0] || "https://via.placeholder.com/60"}
                  alt={p.name}
                  style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: 2, truncate: true }}>
                    {p.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <Clock size={13} color={isActive ? "#f59e0b" : "#9ca3af"} />
                    <span style={{ fontSize: 13, color: isActive ? "#b45309" : "#9ca3af", fontWeight: 500 }}>
                      {timeLeft}
                    </span>
                    {isActive && (
                      <span style={{
                        background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 600,
                        padding: "2px 8px", borderRadius: 99
                      }}>BOOSTED</span>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 4, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${Math.min(100, pct)}%`,
                      background: "linear-gradient(90deg, #f59e0b, #fbbf24)", borderRadius: 99,
                      transition: "width 0.5s"
                    }} />
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                    Expires: {new Date(p.boostedUntil).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => setBoostTarget(p)}
                  style={{
                    flexShrink: 0, padding: "8px 14px", borderRadius: 8, border: "none",
                    background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
                    color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 6
                  }}
                >
                  <Zap size={14} />
                  Extend
                </button>
              </div>
            );
          })}
        </div>
      )}

      {boostTarget && (
        <BoostModal
          product={boostTarget}
          onClose={() => setBoostTarget(null)}
          onBoosted={handleBoosted}
        />
      )}
    </div>
  );
}
