# ⛅ SkyCast — Weather Dashboard

A beautiful real-time weather dashboard built with **HTML, CSS, and Vanilla JavaScript**.  
Fetches live data from the **OpenWeatherMap API**.

---

## 🌟 Features

| Feature | Status |
|---|---|
| Search weather by city | ✅ |
| Auto-complete city suggestions | ✅ |
| Current temperature, humidity, wind speed | ✅ |
| Weather icon & description | ✅ |
| Feels like, pressure, visibility, sunrise/sunset | ✅ |
| 5-day forecast cards | ✅ |
| 24-hour temperature line chart | ✅ |
| Humidity bar chart | ✅ |
| Dark / Light mode toggle | ✅ |
| °C / °F unit toggle | ✅ |
| Save recent searches (localStorage) | ✅ |
| Detect user location (GPS) | ✅ |
| Voice search (Web Speech API) | ✅ |

---

## 🚀 Getting Started

### Step 1 — Get a Free API Key

1. Go to [https://openweathermap.org/api](https://openweathermap.org/api)
2. Click **"Sign Up"** (it's free)
3. After signing in, go to **API keys** tab in your account dashboard
4. Copy your default API key (or create a new one)
5. ⚠️ **New keys take up to 2 hours to activate**

---

### Step 2 — Add Your API Key

Open `js/app.js` and replace line 10:

```js
// BEFORE
const API_KEY = 'YOUR_API_KEY_HERE';

// AFTER
const API_KEY = 'abc123youractualkey456';
```

---

### Step 3 — Open in VS Code

1. Open **VS Code**
2. Go to **File → Open Folder**
3. Select the `weather-dashboard` folder
4. Install the **Live Server** extension (by Ritwick Dey) if you haven't
   - Click the Extensions icon (Ctrl+Shift+X)
   - Search `Live Server` → Install
5. Right-click `index.html` → **"Open with Live Server"**
6. Your browser will open at `http://127.0.0.1:5500`

> ✅ That's it! The app is running locally.

---

## 📁 Project Structure

```
weather-dashboard/
├── index.html          ← Main HTML file
├── css/
│   └── style.css       ← All styles (dark/light theme, responsive)
├── js/
│   └── app.js          ← All JavaScript (API calls, rendering, charts)
└── README.md           ← This file
```

---

## 🔧 Pushing to GitHub

### First Time Setup

```bash
# 1. Initialize git in the project folder
git init

# 2. Add all files
git add .

# 3. Make your first commit
git commit -m "Initial commit: SkyCast weather dashboard"

# 4. Go to github.com → New Repository
#    Name it: weather-dashboard
#    Don't add README (we already have one)
#    Click "Create repository"

# 5. Copy the commands GitHub shows you (looks like below)
git remote add origin https://github.com/YOUR_USERNAME/weather-dashboard.git
git branch -M main
git push -u origin main
```

### Every Time You Make Changes

```bash
git add .
git commit -m "describe what you changed"
git push
```

---

## 🌐 Deploy to GitHub Pages (Live URL)

1. Go to your GitHub repository
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**, select `main` branch → `/ (root)` → **Save**
4. Wait ~1 minute, then visit:  
   `https://YOUR_USERNAME.github.io/weather-dashboard`

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Structure |
| CSS3 (Custom Properties) | Styling & themes |
| Vanilla JavaScript (ES6+) | Logic & API calls |
| OpenWeatherMap API | Weather data |
| Chart.js | Temperature & humidity charts |
| Web Speech API | Voice search |
| Geolocation API | Location detection |
| localStorage | Save recent searches & theme |

---

## 📌 API Endpoints Used

| Endpoint | Data |
|---|---|
| `/weather` | Current weather |
| `/forecast` | 5-day / 3-hour forecast |
| `/geo/1.0/direct` | City autocomplete |

---

## 💡 Tips for Your Internship Presentation

- Mention **async/await** for API calls
- Highlight **error handling** (try/catch, HTTP status checks)
- Show the **JSON response** structure in browser DevTools (F12 → Network tab)
- Demo the **voice search** feature (Chrome only)
- Explain **localStorage** for persisting recent searches and theme

---

## 🔑 Important Notes

- The free OpenWeatherMap tier allows **1000 calls/day** — more than enough
- Voice search works in **Chrome only** (Web Speech API limitation)
- Location detection requires **HTTPS** or `localhost` (Live Server handles this)

---

Made with ☀️ for learning API integration, Async JS & Dynamic UI.
