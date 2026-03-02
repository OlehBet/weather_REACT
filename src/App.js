import React, { useState, useEffect } from "react";

const COLORS = {
  primary: "#8ab4f8",
  danger: "#f28b82",
  success: "#81c995",
  bg: "#0f1012",
  card: "rgba(45, 46, 50, 0.7)",
  textMain: "#e8eaed",
  textSub: "#9aa0a6",
};

const WEATHER_MAP = {
  0: { icon: "☀️", desc: "Ясно" },
  1: { icon: "🌤️", desc: "Переважно ясно" },
  2: { icon: "⛅", desc: "Мінлива хмарність" },
  3: { icon: "☁️", desc: "Хмарно" },
  45: { icon: "🌫️", desc: "Туман" },
  61: { icon: "🌧️", desc: "Невеликий дощ" },
  80: { icon: "🌦️", desc: "Злива" },
  95: { icon: "⛈️", desc: "Гроза" },
};

export default function WeatherPro() {
  const [view, setView] = useState("dash");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Рев'ю коду",
      time: "14:00",
      type: "today",
      color: "#8ab4f8",
    },
    {
      id: 2,
      title: "Прогулянка",
      time: "18:30",
      type: "today",
      color: "#81c995",
    },
  ]);

  // Форма
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    color: "#8ab4f8",
  });

  useEffect(() => {
    fetchWeather(50.45, 30.52); // Дефолт: Київ
  }, []);

  const fetchWeather = async (lat, lon) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,uv_index&hourly=temperature_2m,weather_code&timezone=auto`
      );
      const data = await res.json();
      setWeather(data);
    } catch (e) {
      alert("Помилка завантаження");
    }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search) return;
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${search}&count=1&language=uk&format=json`
    );
    const data = await res.json();
    if (data.results) {
      const city = data.results[0];
      fetchWeather(city.latitude, city.longitude);
      setSearch(city.name);
    }
  };

  const addEvent = (e) => {
    e.preventDefault();
    const newEv = { ...form, id: Date.now(), type: "today" };
    setEvents([...events, newEv]);
    setView("dash");
  };

  return (
    <div style={s.page}>
      {/* HEADER */}
      <header style={s.header}>
        <div style={s.logo}>
          METEO <span>CAL</span>
        </div>
        <form onSubmit={handleSearch} style={s.searchBox}>
          <input
            style={s.searchInput}
            placeholder="Пошук міста..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <button style={s.addBtn} onClick={() => setView("form")}>
          +
        </button>
      </header>

      {view === "dash" ? (
        <main style={s.content}>
          {loading ? (
            <p>Оновлення...</p>
          ) : (
            weather && (
              <>
                {/* Main Weather Card */}
                <div style={s.mainCard}>
                  <div style={s.mainInfo}>
                    <div style={s.bigTemp}>
                      {Math.round(weather.current.temperature_2m)}°
                    </div>
                    <div style={s.weatherMeta}>
                      <div style={s.status}>
                        {
                          (
                            WEATHER_MAP[weather.current.weather_code] ||
                            WEATHER_MAP[0]
                          ).icon
                        }{" "}
                        {
                          (
                            WEATHER_MAP[weather.current.weather_code] ||
                            WEATHER_MAP[0]
                          ).desc
                        }
                      </div>
                      <div style={s.subText}>
                        Відчувається як{" "}
                        {Math.round(weather.current.apparent_temperature)}°
                      </div>
                    </div>
                  </div>

                  <div style={s.statsGrid}>
                    <Stat
                      label="Вологість"
                      value={`${weather.current.relative_humidity_2m}%`}
                    />
                    <Stat
                      label="Вітер"
                      value={`${weather.current.wind_speed_10m} км/г`}
                    />
                    <Stat label="UV-індекс" value={weather.current.uv_index} />
                  </div>
                </div>

                {/* Hourly */}
                <div style={s.hourlyScroll}>
                  {weather.hourly.time.slice(0, 12).map((t, i) => (
                    <div key={i} style={s.hourItem}>
                      <div style={s.subText}>{t.slice(11, 16)}</div>
                      <div style={{ fontSize: "1.2rem" }}>
                        {
                          (
                            WEATHER_MAP[weather.hourly.weather_code[i]] ||
                            WEATHER_MAP[0]
                          ).icon
                        }
                      </div>
                      <div>{Math.round(weather.hourly.temperature_2m[i])}°</div>
                    </div>
                  ))}
                </div>

                {/* Calendar Section */}
                <div style={s.calGrid}>
                  <div style={s.calCol}>
                    <h3 style={s.colTitle}>Сьогодні</h3>
                    {events.map((ev) => (
                      <div
                        key={ev.id}
                        style={{
                          ...s.evCard,
                          borderLeft: `4px solid ${ev.color}`,
                        }}
                      >
                        <span style={s.evTime}>{ev.time}</span>
                        <div style={s.evTitle}>{ev.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )
          )}
        </main>
      ) : (
        /* FORM VIEW */
        <div style={s.formWrap}>
          <h2>Нова подія</h2>
          <form onSubmit={addEvent} style={s.form}>
            <input
              style={s.input}
              placeholder="Що плануємо?"
              required
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="time"
                style={s.input}
                required
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
              <input
                type="color"
                style={{ ...s.input, width: "60px", padding: "2px" }}
                defaultValue="#8ab4f8"
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              />
            </div>
            <button type="submit" style={s.submitBtn}>
              Зберегти
            </button>
            <button
              type="button"
              style={s.cancelBtn}
              onClick={() => setView("dash")}
            >
              Скасувати
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const Stat = ({ label, value }) => (
  <div style={s.statItem}>
    <div style={s.subText}>{label}</div>
    <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>{value}</div>
  </div>
);

// --- STYLES ---
const s = {
  page: {
    backgroundColor: COLORS.bg,
    color: COLORS.textMain,
    minHeight: "100vh",
    fontFamily: "system-ui, sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 40px",
    gap: "20px",
  },
  logo: { fontSize: "1.4rem", fontWeight: "800", letterSpacing: "1px" },
  searchBox: { flex: 1, maxWidth: "400px" },
  searchInput: {
    width: "100%",
    padding: "10px 20px",
    borderRadius: "25px",
    border: "none",
    backgroundColor: COLORS.card,
    color: "white",
    outline: "none",
  },
  addBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: COLORS.primary,
    color: COLORS.bg,
    fontSize: "1.5rem",
    cursor: "pointer",
  },

  content: { maxWidth: "900px", margin: "0 auto", padding: "0 20px" },
  mainCard: {
    background:
      "linear-gradient(135deg, rgba(138,180,248,0.2) 0%, rgba(45,46,50,0.8) 100%)",
    padding: "40px",
    borderRadius: "30px",
    marginBottom: "30px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  mainInfo: {
    display: "flex",
    alignItems: "baseline",
    gap: "20px",
    marginBottom: "30px",
  },
  bigTemp: { fontSize: "6rem", fontWeight: "200" },
  status: { fontSize: "1.5rem", marginBottom: "5px" },
  subText: { color: COLORS.textSub, fontSize: "0.9rem" },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    paddingTop: "20px",
  },
  statItem: { textAlign: "center" },

  hourlyScroll: {
    display: "flex",
    gap: "15px",
    overflowX: "auto",
    paddingBottom: "20px",
    marginBottom: "30px",
  },
  hourItem: {
    minWidth: "80px",
    padding: "15px",
    backgroundColor: COLORS.card,
    borderRadius: "20px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  calGrid: { paddingBottom: "40px" },
  colTitle: {
    fontSize: "1.2rem",
    marginBottom: "15px",
    borderBottom: "1px solid #333",
    paddingBottom: "10px",
  },
  evCard: {
    backgroundColor: COLORS.card,
    padding: "15px",
    borderRadius: "15px",
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  evTime: { color: COLORS.primary, fontWeight: "bold" },
  evTitle: { fontSize: "1rem" },

  formWrap: { maxWidth: "400px", margin: "100px auto", textAlign: "center" },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginTop: "30px",
  },
  input: {
    padding: "15px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: COLORS.card,
    color: "white",
  },
  submitBtn: {
    padding: "15px",
    borderRadius: "30px",
    border: "none",
    backgroundColor: COLORS.primary,
    fontWeight: "bold",
    cursor: "pointer",
  },
  cancelBtn: {
    background: "none",
    border: "none",
    color: COLORS.textSub,
    cursor: "pointer",
  },
};
