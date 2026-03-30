import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";

export default function ListingKhaltiReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying payment...");

  useEffect(() => {
    const completePayment = async () => {
      const pidx = searchParams.get("pidx");
      if (!pidx) {
        setStatus("Missing payment reference. Redirecting...");
        setTimeout(() => navigate("/list-product"), 2000);
        return;
      }

      const savedData = localStorage.getItem("tempProductFormData");
      if (!savedData) {
        setStatus("Session data missing. Please try listing again.");
        setTimeout(() => navigate("/list-product"), 3000);
        return;
      }

      let formData;
      try {
        formData = JSON.parse(savedData);
      } catch {
        setStatus("Form data corrupted. Please try again.");
        setTimeout(() => navigate("/list-product"), 3000);
        return;
      }

      const verifyWithRetry = async (retryCount = 0) => {
        try {
          setStatus(retryCount === 0 ? "Verifying payment..." : "Payment is processing, please wait...");
          const { data } = await api.post("/payment/verify-khalti", { pidx, purpose: 'product_listing_fee' });

          if (data.success) {
            setStatus("Payment verified! Creating your listing...");
            const token = localStorage.getItem("token");
            const res = await api.post("/products", {
              ...formData,
              payment: data.paymentDetails,
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data) {
              localStorage.removeItem("tempProductFormData");
              setStatus("✅ Product listed successfully!");
              setTimeout(() => navigate("/seller"), 1200);
            }
          } else {
            const isPending = data.message &&
              (data.message.includes("Pending") || data.message.includes("Initiated"));
            if (isPending && retryCount < 60) {
              setTimeout(() => verifyWithRetry(retryCount + 1), 2000);
            } else {
              setStatus(`Payment failed: ${data.message || "Timeout"}. Please contact support.`);
            }
          }
        } catch (err) {
          setStatus(err.response?.data?.message || "Verification failed. Please contact support.");
        }
      };

      verifyWithRetry();
    };

    completePayment();
  }, []);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "60vh", gap: "16px", padding: "24px"
    }}>
      {!status.startsWith("✅") && (
        <div style={{
          width: "48px", height: "48px", border: "4px solid #e5e7eb",
          borderTop: "4px solid #5c2d91", borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
      )}
      <h2 style={{ fontSize: "1.25rem", fontWeight: "600", textAlign: "center", color: "#1f2937" }}>
        {status}
      </h2>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
