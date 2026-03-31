import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  key: { 
    type: String, 
    required: true, 
    unique: true, 
    default: "site_settings" 
  },
  logo: { 
    type: String, 
    default: "" 
  },
  boostPackages: [
    {
      label: { type: String, required: true },
      hours: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  footer: {
    columns: [
      {
        title: { type: String, required: true },
        links: [
          {
            label: { type: String, required: true },
            url: { type: String, required: true }
          }
        ]
      }
    ],
    socials: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
      youtube: { type: String, default: "" }
    },
    apps: {
      playStore: { type: String, default: "" },
      appStore: { type: String, default: "" }
    }
  }
}, { timestamps: true });

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
