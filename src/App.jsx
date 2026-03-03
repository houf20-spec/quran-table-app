import React, { useState } from "react";

export default function App() {
  const [username, setUsername] = useState("");
  const [savedUser, setSavedUser] = useState(null);
  const [error, setError] = useState("");

  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(4);
  const [customCols, setCustomCols] = useState(1);
  const [tableData, setTableData] = useState([]);

  const handleLogin = async () => {
    setError("");

    if (!username.trim()) {
      setError("الرجاء إدخال اسم مستخدم");
      return;
    }

    try {
      const res = await fetch("/api/check-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() })
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.message || "حدث خطأ غير متوقع");
      } else {
        setSavedUser(username.trim());
        initTable(rows, cols, customCols);
      }
    } catch (e) {
      setError("تعذر الاتصال بالخادم، حاول لاحقاً");
    }
  };

  const initTable = (r, c, cc) => {
    const totalCols = c + cc;
    const newTable = Array.from({ length: r }, () =>
      Array.from({ length: totalCols }, () => "")
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

  const handleApplySettings = () => {
    const r = Math.max(1, Math.min(60, rows || 1));
    const c = Math.max(1, cols || 1);
    const cc = Math.max(0, customCols || 0);
    setRows(r);
    setCols(c);
    setCustomCols(cc);
    initTable(r, c, cc);
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
            أدخل اسم مستخدم جديد (غير مستخدم من قبل).
          </p>

          <input
            type="text"
            placeholder="مثال: نوف"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "12px",
              border: "1px solid #333",
              background: "#0b0b12",
              color: "#f5f5f5",
              marginBottom: "12px"
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
            onClick={handleLogin}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "12px",
              border: "none",
              background:
                "linear-gradient(135deg, #22c55e 0%, #16a34a 40%, #15803d 100%)",
              color: "#f5f5f5",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            دخول
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
          <h2 style={{ margin: 0 }}>مرحباً، {savedUser}</h2>
          <p style={{ margin: 0, opacity: 0.7, fontSize: 14 }}>
            هذا جدولك المرن — عدّلي الصفوف والأعمدة كما تريدين.
          </p>
        </div>
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
              width: 80,
              padding: "6px 8px",
              borderRadius: 10,
              border: "1px solid #333",
              background: "#050509",
              color: "#f5f5f5",
              marginTop: 4
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
              width: 80,
              padding: "6px 8px",
              borderRadius: 10,
              border: "1px solid #333",
              background: "#050509",
              color: "#f5f5f5",
              marginTop: 4
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
              width: 80,
              padding: "6px 8px",
              borderRadius: 10,
              border: "1px solid #333",
              background: "#050509",
              color: "#f5f5f5",
              marginTop: 4
            }}
          />
        </div>

        <button
          onClick={handleApplySettings}
          style={{
            padding: "8px 16px",
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
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "600px"
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  borderBottom: "1px solid #333",
                  padding: 8,
                  textAlign: "center",
                  fontSize: 13,
                  opacity: 0.8
                }}
              >
                #
              </th>
              {Array.from({ length: cols }).map((_, i) => (
                <th
                  key={`col-${i}`}
                  style={{
                    borderBottom: "1px solid #333",
                    padding: 8,
                    textAlign: "center",
                    fontSize: 13,
                    opacity: 0.8
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
                    padding: 8,
                    textAlign: "center",
                    fontSize: 13,
                    opacity: 0.8
                  }}
                >
                  مخصص {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rIndex) => (
              <tr key={rIndex}>
                <td
                  style={{
                    borderBottom: "1px solid #222",
                    padding: 6,
                    textAlign: "center",
                    fontSize: 13,
                    opacity: 0.7
                  }}
                >
                  {rIndex + 1}
                </td>
                {row.map((cell, cIndex) => {
                  const isCustom = cIndex >= cols;
                  return (
                    <td
                      key={cIndex}
                      style={{
                        borderBottom: "1px solid #222",
                        padding: 4,
                        textAlign: "center"
                      }}
                    >
                      {!isCustom ? (
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) =>
                            handleCellChange(rIndex, cIndex, e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "4px 6px",
                            borderRadius: 8,
                            border: "1px solid #333",
                            background: "#050509",
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
                          <span style={{ fontSize: 14 }}>{cell}</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
