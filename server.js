import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// إعداد المسارات
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// تخزين أسماء المستخدمين في الذاكرة (مؤقت)
const users = new Set();

// API منع تكرار اسم المستخدم
app.post("/api/check-name", (req, res) => {
  const { username } = req.body;

  if (!username || !username.trim()) {
    return res.json({ ok: false, message: "الرجاء إدخال اسم مستخدم" });
  }

  const clean = username.trim();

  if (users.has(clean)) {
    return res.json({ ok: false, message: "❌ هذا الاسم مستخدم مسبقاً" });
  }

  users.add(clean);
  return res.json({ ok: true, message: "✔️ تم قبول الاسم" });
});

// خدمة ملفات React بعد البناء
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
