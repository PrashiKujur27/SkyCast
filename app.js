

const API_KEY = '2ae69a9e83840d6057c270eabdd97123'; 
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

// ---- STATE ----
let currentUnit = 'metric';
let tempChart = null;
let humidityChart = null;
let recentSearches = JSON.parse(localStorage.getItem('skycast_recent') || '[]');

// ---- DOM REFS ----
const cityInput       = document.getElementById('cityInput');
const searchBtn       = document.getElementById('searchBtn');
const voiceBtn        = document.getElementById('voiceBtn');
const locationBtn     = document.getElementById('locationBtn');
const themeToggle     = document.getElementById('themeToggle');
const unitToggle      = document.getElementById('unitToggle');
const suggestions     = document.getElementById('suggestions');
const loader          = document.getElementById('loader');
const errorMsg        = document.getElementById('errorMsg');
const errorText       = document.getElementById('errorText');
const mainContent     = document.getElementById('mainContent');
const welcomeScreen   = document.getElementById('welcomeScreen');
const detectLocation  = document.getElementById('detectLocation');
const recentSearchesEl= document.getElementById('recentSearches');
const recentList      = document.getElementById('recentList');
const clearRecent     = document.getElementById('clearRecent');

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  renderRecentSearches();
  
  // Event listeners
  searchBtn.addEventListener('click', handleSearch);
  cityInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleSearch(); });
  cityInput.addEventListener('input', handleSuggestions);
  locationBtn.addEventListener('click', detectUserLocation);
  detectLocation.addEventListener('click', detectUserLocation);
  themeToggle.addEventListener('click', toggleTheme);
  unitToggle.addEventListener('change', handleUnitChange);
  voiceBtn.addEventListener('click', startVoiceSearch);
  clearRecent.addEventListener('click', clearRecentSearches);

  // Close suggestions on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.search-bar')) suggestions.classList.add('hidden');
  });
});

// ---- SEARCH ----
async function handleSearch() {
  const city = cityInput.value.trim();
  if (!city) return;
  await fetchWeatherByCity(city);
}

async function fetchWeatherByCity(city) {
  showLoader();
  try {
    const [weatherRes, forecastRes] = await Promise.all([
      fetch(`${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=${currentUnit}&appid=${API_KEY}`),
      fetch(`${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=${currentUnit}&appid=${API_KEY}`)
    ]);

    if (!weatherRes.ok) throw new Error(weatherRes.status === 404 ? 'City not found. Please check the spelling.' : 'Failed to fetch weather. Please try again.');

    const weather  = await weatherRes.json();
    const forecast = await forecastRes.json();

    saveRecentSearch(city);
    renderWeather(weather, forecast);
    hideLoader();
    showMainContent();
  } catch (err) {
    showError(err.message);
  }
}

async function fetchWeatherByCoords(lat, lon) {
  showLoader();
  try {
    const [weatherRes, forecastRes] = await Promise.all([
      fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${API_KEY}`),
      fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${API_KEY}`)
    ]);
    if (!weatherRes.ok) throw new Error('Unable to fetch weather for your location.');
    const weather  = await weatherRes.json();
    const forecast = await forecastRes.json();
    cityInput.value = weather.name;
    renderWeather(weather, forecast);
    hideLoader();
    showMainContent();
  } catch (err) {
    showError(err.message);
  }
}

// ---- RENDER ----
function renderWeather(weather, forecast) {
  const unit = currentUnit === 'metric' ? '°C' : '°F';
  const speedUnit = currentUnit === 'metric' ? 'km/h' : 'mph';
  const windSpeed = currentUnit === 'metric'
    ? (weather.wind.speed * 3.6).toFixed(1)
    : weather.wind.speed.toFixed(1);

  // Hero card
  document.getElementById('cityName').textContent = `${weather.name}, ${weather.sys.country}`;
  document.getElementById('countryDate').textContent = formatDate(new Date());
  document.getElementById('temperature').textContent = `${Math.round(weather.main.temp)}${unit}`;
  document.getElementById('description').textContent = weather.weather[0].description;
  document.getElementById('feelsLike').textContent = `Feels like ${Math.round(weather.main.feels_like)}${unit}`;
  document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;
  document.getElementById('weatherIcon').alt = weather.weather[0].description;

  // Stats
  document.getElementById('humidity').textContent   = `${weather.main.humidity}%`;
  document.getElementById('windSpeed').textContent  = `${windSpeed} ${speedUnit}`;
  document.getElementById('pressure').textContent   = `${weather.main.pressure} hPa`;
  document.getElementById('visibility').textContent = weather.visibility ? `${(weather.visibility / 1000).toFixed(1)} km` : 'N/A';
  document.getElementById('sunrise').textContent    = formatTime(weather.sys.sunrise);
  document.getElementById('sunset').textContent     = formatTime(weather.sys.sunset);

  // 5-day forecast
  render5DayForecast(forecast, unit);

  // Charts (24h hourly)
  const hourly = forecast.list.slice(0, 8); // every 3h → 24h
  renderTempChart(hourly, unit);
  renderHumidityChart(hourly);
}

function render5DayForecast(forecast, unit) {
  const container = document.getElementById('forecastCards');
  container.innerHTML = '';

  // Group by day (take noon reading or first available)
  const dailyMap = {};
  forecast.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const key = date.toDateString();
    if (!dailyMap[key]) dailyMap[key] = [];
    dailyMap[key].push(item);
  });

  const days = Object.keys(dailyMap).slice(0, 5);
  days.forEach(dayKey => {
    const items = dailyMap[dayKey];
    const noon = items.find(i => new Date(i.dt * 1000).getHours() === 12) || items[Math.floor(items.length / 2)];
    const high = Math.max(...items.map(i => i.main.temp_max));
    const low  = Math.min(...items.map(i => i.main.temp_min));

    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.innerHTML = `
      <span class="day">${new Date(dayKey).toLocaleDateString('en', { weekday: 'short' })}</span>
      <img src="https://openweathermap.org/img/wn/${noon.weather[0].icon}@2x.png" alt="${noon.weather[0].description}" />
      <div class="fc-temps">
        <span class="fc-high">${Math.round(high)}${unit}</span>
        <span class="fc-low">${Math.round(low)}${unit}</span>
      </div>
      <span class="fc-desc">${noon.weather[0].description}</span>
    `;
    container.appendChild(card);
  });
}

function renderTempChart(hourly, unit) {
  const ctx = document.getElementById('tempChart').getContext('2d');
  const labels = hourly.map(h => formatTime(h.dt));
  const data   = hourly.map(h => Math.round(h.main.temp));

  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#8892aa' : '#6b7280';

  if (tempChart) tempChart.destroy();
  tempChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: `Temperature (${unit})`,
        data,
        borderColor: '#4f9eff',
        backgroundColor: 'rgba(79,158,255,0.12)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#4f9eff',
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'DM Sans' } } },
        y: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'DM Sans' }, callback: v => `${v}${unit}` } }
      }
    }
  });
}

function renderHumidityChart(hourly) {
  const ctx = document.getElementById('humidityChart').getContext('2d');
  const labels = hourly.map(h => formatTime(h.dt));
  const data   = hourly.map(h => h.main.humidity);

  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#8892aa' : '#6b7280';

  if (humidityChart) humidityChart.destroy();
  humidityChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Humidity (%)',
        data,
        backgroundColor: 'rgba(249,168,37,0.5)',
        borderColor: '#f9a825',
        borderWidth: 2,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'DM Sans' } } },
        y: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'DM Sans' }, callback: v => `${v}%` }, max: 100 }
      }
    }
  });
}

// ---- SUGGESTIONS ----
let suggTimeout = null;
async function handleSuggestions() {
  clearTimeout(suggTimeout);
  const q = cityInput.value.trim();
  if (q.length < 3) { suggestions.classList.add('hidden'); return; }

  suggTimeout = setTimeout(async () => {
    try {
      const res = await fetch(`${GEO_URL}/direct?q=${encodeURIComponent(q)}&limit=5&appid=${API_KEY}`);
      const data = await res.json();
      if (!data.length) { suggestions.classList.add('hidden'); return; }
      suggestions.innerHTML = '';
      data.forEach(place => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = `${place.name}${place.state ? ', ' + place.state : ''}, ${place.country}`;
        item.addEventListener('click', () => {
          cityInput.value = place.name;
          suggestions.classList.add('hidden');
          fetchWeatherByCity(place.name);
        });
        suggestions.appendChild(item);
      });
      suggestions.classList.remove('hidden');
    } catch { suggestions.classList.add('hidden'); }
  }, 350);
}

// ---- GEOLOCATION ----
function detectUserLocation() {
  if (!navigator.geolocation) {
    showError('Geolocation is not supported by your browser.');
    return;
  }
  showLoader();
  navigator.geolocation.getCurrentPosition(
    pos => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
    () => showError('Unable to retrieve your location. Please allow location access.')
  );
}

// ---- VOICE SEARCH ----
function startVoiceSearch() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    showError('Voice search is not supported in this browser. Try Chrome.');
    return;
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SR();
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  voiceBtn.style.color = '#ff6b6b';
  document.querySelector('.search-bar').classList.add('voice-listening');

  recognition.onresult = e => {
    const spoken = e.results[0][0].transcript;
    cityInput.value = spoken;
    fetchWeatherByCity(spoken);
  };
  recognition.onend = () => {
    voiceBtn.style.color = '';
    document.querySelector('.search-bar').classList.remove('voice-listening');
  };
  recognition.onerror = () => {
    voiceBtn.style.color = '';
    document.querySelector('.search-bar').classList.remove('voice-listening');
  };
  recognition.start();
}

// ---- THEME ----
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('skycast_theme', isDark ? 'light' : 'dark');
}

// Load saved theme
const savedTheme = localStorage.getItem('skycast_theme');
if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

// ---- UNIT TOGGLE ----
function handleUnitChange() {
  currentUnit = unitToggle.value;
  const city = cityInput.value.trim();
  if (city) fetchWeatherByCity(city);
}

// ---- RECENT SEARCHES ----
function saveRecentSearch(city) {
  const normalized = city.trim();
  recentSearches = [normalized, ...recentSearches.filter(c => c.toLowerCase() !== normalized.toLowerCase())].slice(0, 8);
  localStorage.setItem('skycast_recent', JSON.stringify(recentSearches));
  renderRecentSearches();
}

function renderRecentSearches() {
  if (!recentSearches.length) { recentSearchesEl.classList.add('hidden'); return; }
  recentSearchesEl.classList.remove('hidden');
  recentList.innerHTML = '';
  recentSearches.forEach(city => {
    const chip = document.createElement('button');
    chip.className = 'recent-chip';
    chip.textContent = city;
    chip.addEventListener('click', () => {
      cityInput.value = city;
      fetchWeatherByCity(city);
    });
    recentList.appendChild(chip);
  });
}

function clearRecentSearches() {
  recentSearches = [];
  localStorage.removeItem('skycast_recent');
  recentSearchesEl.classList.add('hidden');
}

// ---- UI STATE ----
function showLoader() {
  loader.classList.remove('hidden');
  mainContent.classList.add('hidden');
  welcomeScreen.classList.add('hidden');
  errorMsg.classList.add('hidden');
}
function hideLoader() {
  loader.classList.add('hidden');
}
function showMainContent() {
  mainContent.classList.remove('hidden');
  welcomeScreen.classList.add('hidden');
}
function showError(msg) {
  hideLoader();
  errorText.textContent = msg;
  errorMsg.classList.remove('hidden');
  mainContent.classList.add('hidden');
  welcomeScreen.classList.add('hidden');
  setTimeout(() => errorMsg.classList.add('hidden'), 5000);
}

// ---- HELPERS ----
function formatDate(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function formatTime(unixTimestamp) {
  const d = new Date(unixTimestamp * 1000);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}
