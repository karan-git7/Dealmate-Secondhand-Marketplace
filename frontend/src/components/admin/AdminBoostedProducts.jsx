import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { Zap, Clock } from "lucide-react";

function timeRemaining(boostedUntil) {
  const diff = new Date(boostedUntil).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export default function AdminBoostedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/admin/boosted-products");
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load admin boosted products", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div style={{ padding: 32, textAlign: "center", color: "#6b7280" }}>Loading...</div>
  );

  return (
    <div className="dashboard-home">
      <div className="page-header" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Zap size={22} color="#f59e0b" />
        <h2 className="page-title" style={{ margin: 0 }}>Active Boosted Products</h2>
        <span style={{
          marginLeft: 8, background: "#fef3c7", color: "#92400e", fontWeight: 700,
          fontSize: 12, padding: "3px 10px", borderRadius: 99
        }}>{products.length} active</span>
      </div>

      {products.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: "center", color: "#6b7280" }}>
          No products are currently boosted.
        </div>
      ) : (
        <div className="table-card">
          <div className="table-container">
            <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 600, color: "#374151", borderBottom: "1px solid #f3f4f6" }}>Product</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 600, color: "#374151", borderBottom: "1px solid #f3f4f6" }}>Seller</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 600, color: "#374151", borderBottom: "1px solid #f3f4f6" }}>Category</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 600, color: "#374151", borderBottom: "1px solid #f3f4f6" }}>Price</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 600, color: "#374151", borderBottom: "1px solid #f3f4f6" }}>Expires At</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 600, color: "#374151", borderBottom: "1px solid #f3f4f6" }}>Remaining</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id} style={{ borderBottom: "1px solid #f9fafb" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <img
                          src={p.images?.[0] || "https://via.placeholder.com/40"}
                          style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover" }}
                          alt={p.name}
                        />
                        <span style={{ fontWeight: 500, fontSize: 14 }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#374151" }}>
                      {p.seller?.name || "—"}
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>{p.seller?.email}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#6b7280" }}>{p.category}</td>
                    <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600 }}>Rs. {p.price?.toLocaleString()}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>
                      {new Date(p.boostedUntil).toLocaleString()}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        background: "#fef3c7", color: "#92400e", fontWeight: 600,
                        fontSize: 12, padding: "4px 10px", borderRadius: 99
                      }}>
                        <Clock size={12} /> {timeRemaining(p.boostedUntil)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
