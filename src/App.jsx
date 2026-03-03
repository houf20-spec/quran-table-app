import React, { useState, useEffect } from "react";

const STORAGE_KEY = "quran-table-users";

function loadUsersFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveUsersToStorage(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
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

  // حفظ تلقائي عند تغيير الجدول أو الإعدادات
  useEffect(() => {
    if (!savedUser) return;
    const users = loadUsersFromStorage();
    const existing = users[savedUser] || {};
    users[savedUser] = {
      ...existing,
      rows,
      cols,
      customCols,
      tableData
    };
    saveUsersToStorage(users);
  }, [savedUser, rows, cols, customCols, tableData]);

  const initTable = (r, c, cc) => {
    const total = c + cc;
    const newTable = Array.from({ length: r }, () =>
      Array.from({ length: total }, () => "")
    );
    setTableData(newTable);
  };

  const handleCellChange = (r, c, value) => {
    setTableData((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[r][c] = value;
      return copy;
    });
  };

  const handleMark = (r, c, type) => {
    setTableData((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[r][c] = type === "check" ? "✔️" : "❌";
      return copy;
    });
  };

  // تعديل الإعدادات بدون مسح البيانات
  const handleApplySettings = () => {
    const newRows = Math.max(1, Math.min(60, rows || 1));
    const newCols = Math.max(1, cols || 1);
    const newCustom = Math.max(0, customCols || 0);

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

  const handleAuth = () => {
    setError("");

    const cleanName = username.trim();
    if (!cleanName) {
      setError("الرجاء إدخال اسم مستخدم");
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setError("الرمز السري يجب أن يكون ٤ أرقام");
      return;
    }

    const users = loadUsersFromStorage();
    const existing = users[cleanName];

    // مستخدم موجود → تسجيل دخول
    if (existing) {
      if (existing.pin !== pin) {
        setError("الرمز السري غير صحيح");
        return;
      }
      setSavedUser(cleanName);
      setRows(existing.rows || 10);
      setCols(existing.cols || 4);
      setCustomCols(existing.customCols || 1);
      setTableData(existing.tableData || []);
      return;
    }

    // مستخدم جديد → تسجيل جديد
    users[cleanName] = {
      pin,
      rows,
      cols,
      customCols,
      tableData: Array.from({ length: rows }, () =>
        Array.from({ length: cols + customCols }, () => "")
      )
    };
    saveUsersToStorage(users);

    setSavedUser(cleanName);
    initTable(rows, cols, customCols);
  };

  if (!savedUser) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <div
          style={{
            background: "rgba(15,15,25,0.95)",
            padding: "32px",
            borderRadius: "24px",
            boxShadow: "0 18px 45px rgba(0,0,0,0.6)",
            width: "min(420px, 90vw)",
            color: "#f5f5f5"
          }}
        >
          <h1 style={{ textAlign: "center", marginTop: 0, marginBottom: 16 }}>
            quran-table-app
          </h1>
          <p style={{ textAlign: "center", opacity: 0.8, marginBottom: 16 }}>
            أدخلي اسم المستخدم والرمز السري (٤ أرقام).
            <br />
            إذا كان الاسم جديداً سيتم تسجيله، وإذا كان موجوداً سيتم تسجيل الدخول.
          </p>

          <input
            type="text"
            placeholder="اسم المستخدم (مثال: نوف)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "12px",
              border: "1px solid #333",
              background: "#0b0b12",
              color: "#f5f5f5",
              marginBottom: "10px",
              fontSize: 16
            }}
          />

          <input
            type="password"
            placeholder="الرمز السري (٤ أرقام)"
            value={pin}
            maxLength={4}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 4);
              setPin(v);
            }}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "12px",
              border: "1px solid #333",
              background: "#0b0b12",
              color: "#f5f5f5",
              marginBottom: "12px",
              fontSize: 16,
              direction: "ltr",
              textAlign: "center",
              letterSpacing: "4px"
            }}
          />

          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.15)",
                borderRadius: "10px",
                padding: "8px 10px",
                fontSize: "13px",
                marginBottom: "10px",
                color: "#fecaca"
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleAuth}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "12px",
              border: "none",
              background:
                "linear-gradient(135deg, #22c55e 0%, #16a34a 40%, #15803d 100%)",
              color: "#f5f5f5",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            دخول / تسجيل
          </button>
        </div>
      </div>
    );
  }

  const totalCols = cols + customCols;

  return (
    <div style={{ padding: 24, maxWidth: "1200px", margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 22 }}>مرحباً، {savedUser}</h2>
          <p style={{ margin: 0, opacity: 0.7, fontSize: 14 }}>
            هذا جدولك للقرآن — عدّلي الصفوف والأعمدة كما تريدين.
          </p>
        </div>
        <button
          onClick={() => {
            setSavedUser(null);
            setPin("");
          }}
          style={{
            padding: "6px 12px",
            borderRadius: 999,
            border: "1px solid #4b5563",
            background: "transparent",
            color: "#e5e7eb",
            fontSize: 13,
            cursor: "pointer"
          }}
        >
          تسجيل خروج
        </button>
      </header>

      <section
        style={{
          background: "rgba(15,15,25,0.95)",
          padding: 16,
          borderRadius: 18,
          marginBottom: 20,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center"
        }}
      >
        <div>
          <label style={{ fontSize: 13, opacity: 0.8 }}>عدد الصفوف</label>
          <input
            type="number"
            min="1"
            max="60"
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            style={{
              width: 90,
              padding: "6px 8px",
              borderRadius: 10,
              border: "1px solid #333",
              background: "#050509",
              color: "#f5f5f5",
              marginTop: 4,
              fontSize: 14
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, opacity: 0.8 }}>أعمدة عادية</label>
          <input
            type="number"
            min="1"
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
            style={{
              width: 90,
              padding: "6px 8px",
              borderRadius: 10,
              border: "1px solid #333",
              background: "#050509",
              color: "#f5f5f5",
              marginTop: 4,
              fontSize: 14
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, opacity: 0.8 }}>
            أعمدة مخصصة (صح/خطأ)
          </label>
          <input
            type="number"
            min="0"
            value={customCols}
            onChange={(e) => setCustomCols(Number(e.target.value))}
            style={{
              width: 90,
              padding: "6px 8px",
              borderRadius: 10,
              border: "1px solid #333",
              background: "#050509",
              color: "#f5f5f5",
              marginTop: 4,
              fontSize: 14
            }}
          />
        </div>

        <button
          onClick={handleApplySettings}
          style={{
            padding: "8px 18px",
            borderRadius: 999,
            border: "none",
            background:
              "linear-gradient(135deg, #3b82f6 0%, #2563eb 40%, #1d4ed8 100%)",
            color: "#f5f5f5",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            marginTop: 18
          }}
        >
          تطبيق الإعدادات
        </button>
      </section>

      <section
        style={{
          background: "rgba(15,15,25,0.95)",
          padding: 12,
          borderRadius: 18,
          overflowX: "auto"
        }}
      >
        <div style={{ minWidth: "700px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
              fontSize: 14
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    borderBottom: "1px solid #333",
                    borderRight: "1px solid #333",
                    padding: 8,
                    textAlign: "center",
                    fontSize: 13,
                    opacity: 0.8,
                    background: "#111827",
                    position: "sticky",
                    top: 0,
                    zIndex: 1
                  }}
                >
                  #
                </th>
                {Array.from({ length: cols }).map((_, i) => (
                  <th
                    key={`col-${i}`}
                    style={{
                      borderBottom: "1px solid #333",
                      borderRight: "1px solid #333",
                      padding: 8,
                      textAlign: "center",
                      fontSize: 13,
                      opacity: 0.8,
                      background: "#111827",
                      position: "sticky",
                      top: 0,
                      zIndex: 1
                    }}
                  >
                    عمود {i + 1}
                  </th>
                ))}
                {Array.from({ length: customCols }).map((_, i) => (
                  <th
                    key={`ccol-${i}`}
                    style={{
                      borderBottom: "1px solid #333",
                      borderRight: "1px solid #333",
                      padding: 8,
                      textAlign: "center",
                      fontSize: 13,
                      opacity: 0.8,
                      background: "#111827",
                      position: "sticky",
                      top: 0,
                      zIndex: 1
                    }}
                  >
                    مخصص {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, rIndex) => {
                const isEven = rIndex % 2 === 1;
                return (
                  <tr
                    key={rIndex}
                    style={{
                      backgroundColor: isEven ? "#020617" : "#020617cc"
                    }}
                  >
                    <td
                      style={{
                        borderBottom: "1px solid #222",
                        borderRight: "1px solid #333",
                        padding: 6,
                        textAlign: "center",
                        fontSize: 13,
                        opacity: 0.8
                      }}
                    >
                      {rIndex + 1}
                    </td>
                    {row.map((cell, cIndex) => {
                      const isCustom = cIndex >= cols;
                      const isCheck = cell === "✔️";
                      const isCross = cell === "❌";

                      return (
                        <td
                          key={cIndex}
                          style={{
                            borderBottom: "1px solid #222",
                            borderRight: "1px solid #333",
                            padding: 4,
                            textAlign: "center",
                            verticalAlign: "middle"
                          }}
                        >
                          {!isCustom ? (
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) =>
                                handleCellChange(
                                  rIndex,
                                  cIndex,
                                  e.target.value
                                )
                              }
                              style={{
                                width: "100%",
                                padding: "4px 6px",
                                borderRadius: 8,
                                border: "1px solid #333",
                                background: "#020617",
                                color: "#f5f5f5",
                                fontSize: 13
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                gap: 4,
                                justifyContent: "center",
                                alignItems: "center"
                              }}
                            >
                              <button
                                onClick={() =>
                                  handleMark(rIndex, cIndex, "check")
                                }
                                style={{
                                  padding: "2px 6px",
                                  borderRadius: 999,
                                  border: "none",
                                  background: "#16a34a",
                                  color: "#f5f5f5",
                                  fontSize: 12,
                                  cursor: "pointer"
                                }}
                              >
                                ✔️
                              </button>
                              <button
                                onClick={() =>
                                  handleMark(rIndex, cIndex, "cross")
                                }
                                style={{
                                  padding: "2px 6px",
                                  borderRadius: 999,
                                  border: "none",
                                  background: "#dc2626",
                                  color: "#f5f5f5",
                                  fontSize: 12,
                                  cursor: "pointer"
                                }}
                              >
                                ❌
                              </button>
                              <span
                                style={{
                                  fontSize: 16,
                                  fontWeight: 600,
                                  color: isCheck
                                    ? "#22c55e"
                                    : isCross
                                    ? "#f97373"
                                    : "#e5e7eb"
                                }}
                              >
                                {cell}
                              </span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
