import express from "express";
import { productUpload } from "../../middleware/fileUpload.js";
import { protect, adminOnly } from "../../middleware/auth.js";
import Settings from "../../models/Settings.js";

const router = express.Router();

/**
 * Helper to ensure a settings document exists in MongoDB
 */
const getOrCreateSettings = async () => {
    let settings = await Settings.findOne({ key: "site_settings" });
    
    if (!settings) {
        settings = new Settings({
            key: "site_settings",
            logo: "",
            boostPackages: [
                { label: "6 Hours", hours: 6, price: 100 },
                { label: "12 Hours", hours: 12, price: 180 },
                { label: "24 Hours", hours: 24, price: 320 },
                { label: "3 Days", hours: 72, price: 800 },
                { label: "7 Days", hours: 168, price: 1600 }
            ],
            footer: {
                columns: [
                    {
                        title: "About",
                        links: [
                            { label: "About Us", url: "/about" },
                            { label: "Contact Us", url: "/contact" },
                            { label: "Careers", url: "/careers" }
                        ]
                    }
                ],
                socials: { facebook: "", instagram: "", twitter: "", youtube: "" },
                apps: { playStore: "", appStore: "" }
            }
        });
        await settings.save();
    }
    return settings;
};

// GET /api/admin/settings/logo
router.get("/logo", async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        res.json({ logo: settings.logo || "" });
    } catch (err) {
        console.error("Get Logo Error:", err);
        res.status(500).json({ message: "Failed to fetch logo" });
    }
});

// PUT /api/admin/settings/logo
router.put("/logo", protect, adminOnly, productUpload.single("logo"), async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        
        let logoPath = req.body.url;
        if (req.file) {
            logoPath = req.file.path; // Cloudinary URL
        }

        if (req.body.reset === "true") {
            logoPath = "";
        } else if (!logoPath) {
            logoPath = settings.logo;
        }

        settings.logo = logoPath;
        await settings.save();
        
        res.json({ message: "Logo updated", logo: logoPath });
    } catch (err) {
        console.error("Update Logo Error:", err);
        res.status(500).json({ message: "Failed to update logo" });
    }
});

// GET /api/admin/settings/footer
router.get("/footer", async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        res.json(settings.footer);
    } catch (err) {
        console.error("Get Footer Error:", err);
        res.status(500).json({ message: "Failed to fetch footer settings" });
    }
});

// PUT /api/admin/settings/footer
router.put("/footer", protect, adminOnly, async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        const { columns, socials, apps } = req.body;

        settings.footer = {
            columns: columns || settings.footer?.columns || [],
            socials: socials || settings.footer?.socials || {},
            apps: apps || settings.footer?.apps || {}
        };

        await settings.save();
        res.json({ message: "Footer settings updated", footer: settings.footer });
    } catch (err) {
        console.error("Update Footer Error:", err);
        res.status(500).json({ message: "Failed to update footer settings" });
    }
});

// GET /api/admin/settings/boost-packages
router.get("/boost-packages", async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        res.json(settings.boostPackages || []);
    } catch (err) {
        console.error("Get Boost Packages Error:", err);
        res.status(500).json({ message: "Failed to fetch boost packages" });
    }
});

// PUT /api/admin/settings/boost-packages
router.put("/boost-packages", protect, adminOnly, async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        const { packages } = req.body;
        
        if (!Array.isArray(packages)) {
            return res.status(400).json({ message: "packages[] is required" });
        }

        const normalized = packages.map(p => ({
            label: String(p.label || "").trim() || `${Number(p.hours)} Hours`,
            hours: Number(p.hours),
            price: Number(p.price)
        })).filter(p => p.hours > 0 && p.price >= 0);

        if (normalized.length === 0) {
            return res.status(400).json({ message: "No valid packages" });
        }

        settings.boostPackages = normalized;
        await settings.save();
        res.json({ message: "Boost packages updated", packages: normalized });
    } catch (err) {
        console.error("Update Boost Packages Error:", err);
        res.status(500).json({ message: "Failed to update boost packages" });
    }
});

export default router;

export default router;
