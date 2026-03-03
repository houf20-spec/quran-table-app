import React, { useState, useEffect } from "react";

const STORAGE_KEY = "quran-table-users";

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveUsers(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function App() {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [savedUser, setSavedUser] = useState(null);
  const [error, setError] = useState("");

  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(4);
  const [customCols, setCustomCols] = useState(1);
  const [tableData, setTableData] = useState([]);

  // حفظ تلقائي
  useEffect(() => {
    if (!savedUser) return;
    const users = loadUsers();
    users[savedUser] = {
      pin: users[savedUser]?.pin,
      rows,
      cols,
      customCols,
      tableData
    };
    saveUsers(users);
  }, [savedUser, rows, cols, customCols, tableData]);

  // إنشاء جدول جديد عند تسجيل مستخدم جديد
  const initTable = (r, c, cc) => {
    const total = c + cc;
    setTableData(
      Array.from({ length: r }, () => Array.from({ length: total }, () => ""))
    );
  };

  // تعديل خلية
  const handleCellChange = (r, c, value) => {
    setTableData((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[r][c] = value;
      return copy;
    });
  };

  // صح / خطأ
  const handleMark = (r, c, type) => {
    setTableData((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[r][c] = type === "check" ? "✔️" : "❌";
      return copy;
    });
  };

  // تعديل الإعدادات بدون حذف البيانات
  const handleApplySettings = () => {
    const newRows = Math.max(1, Math.min(60, rows));
    const newCols = Math.max(1, cols);
    const newCustom = Math.max(0, customCols);

    const totalOld = tableData[0]?.length || 0;
    const totalNew = newCols + newCustom;

    setRows(newRows);
    setCols(newCols);
    setCustomCols(newCustom);

    setTableData((prev) => {
      let updated = [...prev];

      // إضافة صفوف جديدة
      if (newRows > prev.length) {
        for (let i = prev.length; i < newRows; i++) {
          updated.push(Array.from({ length: totalNew }, () => ""));
        }
      }

      // حذف صفوف زائدة
      if (newRows < prev.length) {
        updated = updated.slice(0, newRows);
      }

      // تعديل الأعمدة
      updated = updated.map((row) => {
        let r = [...row];

        // إضافة أعمدة جديدة
        if (totalNew > totalOld) {
          for (let i = totalOld; i < totalNew; i++) {
            r.push("");
          }
        }

        // حذف أعمدة زائدة
        if (totalNew < totalOld) {
          r = r.slice(0, totalNew);
        }

        return r;
      });

      return updated;
    });
  };

  // تسجيل / تسجيل دخول
  const handleAuth = () => {
    setError("");

    const clean = username.trim();
    if (!clean) return setError("الرجاء إدخال اسم مستخدم");

    if (!/^\d{4}$/.test(pin)) return setError("الرمز السري يجب أن يكون ٤ أرقام");

    const users = loadUsers();
    const existing = users[clean];

    if (existing) {
      if (existing.pin !== pin) return setError("الرمز السري غير صحيح");

      setSavedUser(clean);
      setRows(existing.rows);
      setCols(existing.cols);
      setCustomCols(existing.customCols);
      setTableData(existing.tableData);
      return;
    }

    // مستخدم جديد
    users[clean] = {
      pin,
      rows,
      cols,
      customCols,
      tableData: Array.from({ length: rows }, () =>
        Array.from({ length: cols + customCols }, () => "")
      )
    };

    saveUsers(users);
    setSavedUser(clean);
    initTable(rows, cols, customCols);
  };

  // شاشة تسجيل الدخول
  if (!savedUser) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ background: "#111827", padding: 30, borderRadius: 20, width: 350, color: "white" }}>
          <h2 style={{ textAlign: "center" }}>quran-table-app</h2>

          <input
            type="text"
            placeholder="اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 10, border: "1px solid #333", background: "#0b0b12", color: "white" }}
          />

          <input
            type="password"
            placeholder="الرمز السري (٤ أرقام)"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 10, border: "1px solid #333", background: "#0b0b12", color: "white", textAlign: "center", letterSpacing: 4 }}
          />

          {error && <div style={{ background: "#7f1d1d", padding: 8, borderRadius: 8, marginBottom: 10 }}>{error}</div>}

          <button
            onClick={handleAuth}
            style={{ width: "100%", padding: 12, background: "#16a34a", border: "none", borderRadius: 10, color: "white", fontSize: 16 }}
          >
            دخول / تسجيل
          </button>
        </div>
      </div>
    );
  }

  // واجهة الجدول
  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2>مرحباً، {savedUser}</h2>

      <button
        onClick={() => setSavedUser(null)}
        style={{ padding: "6px 12px", borderRadius: 10, background: "transparent", border: "1px solid #555", color: "white", marginBottom: 20 }}
      >
        تسجيل خروج
      </button>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <div>
          <label>عدد الصفوف</label>
          <input type="number" value={rows} onChange={(e) => setRows(Number(e.target.value))} style={{ width: 80 }} />
        </div>

        <div>
          <label>أعمدة عادية</label>
          <input type="number" value={cols} onChange={(e) => setCols(Number(e.target.value))} style={{ width: 80 }} />
        </div>

        <div>
          <label>أعمدة مخصصة</label>
          <input type="number" value={customCols} onChange={(e) => setCustomCols(Number(e.target.value))} style={{ width: 80 }} />
        </div>

        <button onClick={handleApplySettings} style={{ padding: "8px 16px", background: "#2563eb", border: "none", borderRadius: 10, color: "white" }}>
          تطبيق الإعدادات
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>#</th>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i}>عمود {i + 1}</th>
              ))}
              {Array.from({ length: customCols }).map((_, i) => (
                <th key={i}>مخصص {i + 1}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {tableData.map((row, r) => (
              <tr key={r}>
                <td>{r + 1}</td>

                {row.map((cell, c) => {
                  const isCustom = c >= cols;

                  return (
                    <td key={c}>
                      {!isCustom ? (
                        <input
                          value={cell}
                          onChange={(e) => handleCellChange(r, c, e.target.value)}
                          style={{ width: "100%" }}
                        />
                      ) : (
                        <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
                          <button onClick={() => handleMark(r, c, "check")}>✔️</button>
                          <button onClick={() => handleMark(r, c, "cross")}>❌</button>
                          <span>{cell}</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
