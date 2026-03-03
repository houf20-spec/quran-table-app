import React, { useState, useEffect } from "react";

const STORAGE_KEY = "quran-table-users";

const PALETTE = ["#E0E0E2", "#81D2C7", "#B5BAD0", "#7389AE", "#416788"];

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

const defaultColors = {
  rowColor: "rgba(115,137,174,0.18)", // Glaucous خفيف
  colColor: "rgba(65,103,136,0.9)",   // Baltic Blue
  checkColor: "#81D2C7",              // Pearl Aqua
  crossColor: "#E0E0E2"               // Alabaster Grey
};

export default function App() {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [savedUser, setSavedUser] = useState(null);
  const [error, setError] = useState("");

  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(4);
  const [customCols, setCustomCols] = useState(1);
  const [tableData, setTableData] = useState([]);

  const [rowColor, setRowColor] = useState(defaultColors.rowColor);
  const [colColor, setColColor] = useState(defaultColors.colColor);
  const [checkColor, setCheckColor] = useState(defaultColors.checkColor);
  const [crossColor, setCrossColor] = useState(defaultColors.crossColor);

  const [showColors, setShowColors] = useState(false);
  const [history, setHistory] = useState([]);

  // push to history (آخر 20 حالة)
  const pushHistory = (prev) => {
    setHistory((h) => {
      const copy = [...h, prev];
      if (copy.length > 20) copy.shift();
      return copy;
    });
  };

  const handleUndo = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const copy = [...h];
      const last = copy.pop();
      setTableData(last);
      return copy;
    });
  };

  // Ctrl + Z
  useEffect(() => {
    if (!savedUser) return;
    const handler = (e) => {
      if (e.ctrlKey && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [savedUser, history]);

  // حفظ تلقائي
  useEffect(() => {
    if (!savedUser) return;
    const users = loadUsers();
    const existing = users[savedUser] || {};
    users[savedUser] = {
      ...existing,
      rows,
      cols,
      customCols,
      tableData,
      colors: { rowColor, colColor, checkColor, crossColor }
    };
    saveUsers(users);
  }, [savedUser, rows, cols, customCols, tableData, rowColor, colColor, checkColor, crossColor]);

  const initTable = (r, c, cc) => {
    const total = c + cc;
    setTableData(
      Array.from({ length: r }, () => Array.from({ length: total }, () => ""))
    );
  };

  const handleCellChange = (r, c, value) => {
    setTableData((prev) => {
      pushHistory(prev);
      const copy = prev.map((row) => [...row]);
      copy[r][c] = value;
      return copy;
    });
  };

  const handleMark = (r, c, type) => {
    setTableData((prev) => {
      pushHistory(prev);
      const copy = prev.map((row) => [...row]);
      copy[r][c] = type === "check" ? "✔️" : "❌"; // واحدة فقط
      return copy;
    });
  };

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
      pushHistory(prev);
      let updated = [...prev];

      if (newRows > prev.length) {
        for (let i = prev.length; i < newRows; i++) {
          updated.push(Array.from({ length: totalNew }, () => ""));
        }
      }

      if (newRows < prev.length) {
        updated = updated.slice(0, newRows);
      }

      updated = updated.map((row) => {
        let r = [...row];

        if (totalNew > totalOld) {
          for (let i = totalOld; i < totalNew; i++) {
            r.push("");
          }
        }

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

    const clean = username.trim();
    if (!clean) return setError("الرجاء إدخال اسم مستخدم");

    if (!/^\d{4}$/.test(pin)) return setError("الرمز السري يجب أن يكون ٤ أرقام");

    const users = loadUsers();
    const existing = users[clean];

    if (existing) {
      if (existing.pin !== pin) return setError("الرمز السري غير صحيح");

      setSavedUser(clean);
      setRows(existing.rows ?? 10);
      setCols(existing.cols ?? 4);
      setCustomCols(existing.customCols ?? 1);
      setTableData(existing.tableData ?? []);

      const colors = existing.colors || defaultColors;
      setRowColor(colors.rowColor || defaultColors.rowColor);
      setColColor(colors.colColor || defaultColors.colColor);
      setCheckColor(colors.checkColor || defaultColors.checkColor);
      setCrossColor(colors.crossColor || defaultColors.crossColor);

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
      ),
      colors: defaultColors
    };

    saveUsers(users);
    setSavedUser(clean);
    setRowColor(defaultColors.rowColor);
    setColColor(defaultColors.colColor);
    setCheckColor(defaultColors.checkColor);
    setCrossColor(defaultColors.crossColor);
    initTable(rows, cols, customCols);
  };

  if (!savedUser) {
    return (
      <div className="page-root">
        <div className="glass-card auth-card">
          <h1 className="app-title">quran-table-app</h1>
          <p className="app-subtitle">
            أدخلي اسم المستخدم والرمز السري (٤ أرقام).
            <br />
            إذا كان الاسم جديداً سيتم تسجيله، وإذا كان موجوداً سيتم تسجيل الدخول.
          </p>

          <input
            type="text"
            placeholder="اسم المستخدم (مثال: نوف)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-main"
          />

          <input
            type="password"
            placeholder="الرمز السري (٤ أرقام)"
            value={pin}
            maxLength={4}
            onChange={(e) =>
              setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            className="input-main pin-input"
          />

          {error && <div className="error-box">{error}</div>}

          <button onClick={handleAuth} className="btn-primary">
            دخول / تسجيل
          </button>
        </div>
      </div>
    );
  }

  const totalCols = cols + customCols;

  return (
    <div className="page-root">
      <div className="glass-card main-card">
        <header className="top-bar">
          <div>
            <h2 className="welcome-title">مرحباً، {savedUser}</h2>
            <p className="welcome-sub">
              هذا جدولك للقرآن — عدّلي الصفوف والأعمدة كما تريدين.
            </p>
          </div>
          <div className="top-actions">
            <button
              className="icon-button"
              onClick={() => setShowColors(true)}
              title="الألوان"
            >
              🎨
            </button>
            <button
              onClick={() => {
                setSavedUser(null);
                setPin("");
              }}
              className="btn-outline"
            >
              تسجيل خروج
            </button>
          </div>
        </header>

        <section className="controls-row">
          <div className="control-group">
            <label>عدد الصفوف</label>
            <input
              type="number"
              min="1"
              max="60"
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              className="input-small"
            />
          </div>

          <div className="control-group">
            <label>أعمدة عادية</label>
            <input
              type="number"
              min="1"
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
              className="input-small"
            />
          </div>

          <div className="control-group">
            <label>أعمدة مخصصة (صح/خطأ)</label>
            <input
              type="number"
              min="0"
              value={customCols}
              onChange={(e) => setCustomCols(Number(e.target.value))}
              className="input-small"
            />
          </div>

          <button onClick={handleApplySettings} className="btn-secondary">
            تطبيق الإعدادات
          </button>
        </section>

        <section className="table-wrapper">
          <div className="table-scroll">
            <table className="q-table">
              <thead>
                <tr>
                  <th className="th-cell" style={{ backgroundColor: colColor }}>
                    #
                  </th>
                  {Array.from({ length: cols }).map((_, i) => (
                    <th
                      key={`col-${i}`}
                      className="th-cell"
                      style={{ backgroundColor: colColor }}
                    >
                      عمود {i + 1}
                    </th>
                  ))}
                  {Array.from({ length: customCols }).map((_, i) => (
                    <th
                      key={`ccol-${i}`}
                      className="th-cell"
                      style={{ backgroundColor: colColor }}
                    >
                      مخصص {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, rIndex) => (
                  <tr
                    key={rIndex}
                    className="tr-row"
                    style={{
                      background:
                        rIndex % 2 === 0 ? rowColor : "rgba(15,23,42,0.4)"
                    }}
                  >
                    <td className="td-index">{rIndex + 1}</td>
                    {row.map((cell, cIndex) => {
                      const isCustom = cIndex >= cols;
                      const isCheck = cell === "✔️";
                      const isCross = cell === "❌";

                      return (
                        <td key={cIndex} className="td-cell">
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
                              className="cell-input"
                            />
                          ) : (
                            <div className="custom-cell">
                              <button
                                onClick={() =>
                                  handleMark(rIndex, cIndex, "check")
                                }
                                className="chip-btn chip-check"
                              >
                                ✔️
                              </button>
                              <button
                                onClick={() =>
                                  handleMark(rIndex, cIndex, "cross")
                                }
                                className="chip-btn chip-cross"
                              >
                                ❌
                              </button>
                              <span
                                className="mark-value"
                                style={{
                                  color: isCheck
                                    ? checkColor
                                    : isCross
                                    ? crossColor
                                    : "#E5E7EB"
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
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {showColors && (
        <div className="side-panel-backdrop" onClick={() => setShowColors(false)}>
          <div
            className="side-panel glass-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="panel-title">الألوان</h3>

            <div className="panel-section">
              <span className="panel-label">لون الصفوف</span>
              <div className="color-row">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    className="color-dot"
                    style={{
                      backgroundColor: c,
                      outline:
                        rowColor.startsWith("#") && rowColor === c
                          ? "2px solid #fff"
                          : !rowColor.startsWith("#") && c === "#7389AE"
                          ? "2px solid #fff"
                          : "none"
                    }}
                    onClick={() =>
                      setRowColor(
                        c === "#7389AE"
                          ? "rgba(115,137,174,0.18)"
                          : c === "#416788"
                          ? "rgba(65,103,136,0.25)"
                          : c
                      )
                    }
                  />
                ))}
              </div>
            </div>

            <div className="panel-section">
              <span className="panel-label">لون الأعمدة</span>
              <div className="color-row">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    className="color-dot"
                    style={{
                      backgroundColor: c,
                      outline: colColor.includes(c) ? "2px solid #fff" : "none"
                    }}
                    onClick={() => setColColor(c)}
                  />
                ))}
              </div>
            </div>

            <div className="panel-section">
              <span className="panel-label">لون علامة ✔️</span>
              <div className="color-row">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    className="color-dot"
                    style={{
                      backgroundColor: c,
                      outline: checkColor === c ? "2px solid #fff" : "none"
                    }}
                    onClick={() => setCheckColor(c)}
                  />
                ))}
              </div>
            </div>

            <div className="panel-section">
              <span className="panel-label">لون علامة ❌</span>
              <div className="color-row">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    className="color-dot"
                    style={{
                      backgroundColor: c,
                      outline: crossColor === c ? "2px solid #fff" : "none"
                    }}
                    onClick={() => setCrossColor(c)}
                  />
                ))}
              </div>
            </div>

            <button
              className="btn-outline full-width"
              onClick={() => setShowColors(false)}
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
