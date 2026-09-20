// Working OpenWeatherMap API Key
const API_KEY = "bd5e378503939ddaee76f12ad7a97608";

// Unsplash Weather Images based on condition
const WEATHER_IMAGES = {
  Clear: "https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&w=800&q=80",
  Clouds: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=800&q=80",
  Rain: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=800&q=80",
  Drizzle: "https://images.unsplash.com/photo-1556485689-33e55ab56127?auto=format&fit=crop&w=800&q=80",
  Thunderstorm: "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=800&q=80",
  Snow: "https://images.unsplash.com/photo-1517299321544-4d185a0c6f5c?auto=format&fit=crop&w=800&q=80",
  Mist: "https://images.unsplash.com/photo-1485236715568-ddc5ce682d6f?auto=format&fit=crop&w=800&q=80",
  Smoke: "https://images.unsplash.com/photo-1485236715568-ddc5ce682d6f?auto=format&fit=crop&w=800&q=80",
  Haze: "https://images.unsplash.com/photo-1522163723043-478ef79a5bb4?auto=format&fit=crop&w=800&q=80",
  Dust: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
  Fog: "https://images.unsplash.com/photo-1485236715568-ddc5ce682d6f?auto=format&fit=crop&w=800&q=80"
};

// Initialize App on load
document.addEventListener("DOMContentLoaded", () => {
  showHistory();

  // Allow searching on Enter key press
  const cityInput = document.getElementById("cityInput");
  if (cityInput) {
    cityInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") getWeather();
    });
  }
});

/**
 * Fetch weather from OpenWeather API with active API key
 */
async function getWeather(targetCity) {
  const cityInput = document.getElementById('cityInput');
  const city = targetCity || cityInput.value.trim();

  if (!city) {
    alert("Kripya city ka naam likhein! (e.g. Patna, Delhi, London)");
    return;
  }

  if (targetCity) {
    cityInput.value = targetCity;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  const errorEl = document.getElementById('error');
  const weatherBox = document.getElementById('weatherBox');

  errorEl.style.display = 'none';

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.cod != 200) {
      throw new Error(data.message || 'City not found');
    }

    const cityName = `${data.name}, ${data.sys.country}`;
    const tempVal = Math.round(data.main.temp);
    const tempStr = `${tempVal}°C`;
    const feelsLikeStr = `${Math.round(data.main.feels_like)}°C`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const weatherMain = data.weather[0].main;
    const iconCode = data.weather[0].icon;

    // Update UI elements
    weatherBox.classList.add('active');
    document.getElementById('temp').innerText = tempStr;
    document.getElementById('cityName').innerText = cityName;
    document.getElementById('desc').innerText = data.weather[0].description;
    document.getElementById('humidity').innerText = data.main.humidity + '%';
    document.getElementById('wind').innerText = data.wind.speed + ' m/s';
    document.getElementById('feelsLike').innerText = feelsLikeStr;

    // Update weather icon picture
    const weatherIconImg = document.getElementById('weatherIcon');
    if (weatherIconImg) {
      weatherIconImg.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    }

    // Update header banner picture dynamically
    const bannerImg = document.getElementById('bannerImg');
    if (bannerImg && WEATHER_IMAGES[weatherMain]) {
      bannerImg.style.backgroundImage = `url('${WEATHER_IMAGES[weatherMain]}')`;
    }

    // Save search history
    saveToHistory({
      city: cityName,
      temp: tempStr,
      time: timeStr
    });

  } catch (err) {
    weatherBox.classList.remove('active');
    errorEl.style.display = 'block';
    errorEl.innerText = 'City nahi mila ya API Key check karein!';
  }
}

/**
 * Save search entry to LocalStorage (Option 1) & Sync with Backend API (Option 2)
 */
function saveToHistory(entry) {
  let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  
  // Remove existing duplicate entry for clean list
  history = history.filter(item => item.city.toLowerCase() !== entry.city.toLowerCase());
  
  // Add new search entry at top
  history.unshift(entry);

  // Keep last 5 searches
  if (history.length > 5) {
    history = history.slice(0, 5);
  }

  // Save to LocalStorage (Option 1)
  localStorage.setItem("weatherHistory", JSON.stringify(history));

  // Render history UI
  showHistory();

  // Sync with Express backend API (Option 2) if active
  fetch('/api/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  }).catch(() => {
    // Offline mode fallback
  });
}

/**
 * Display last 5 searches from LocalStorage (Option 1) or Express API (Option 2)
 */
async function showHistory() {
  const historyList = document.getElementById("historyList");
  if (!historyList) return;

  let history = [];

  // Try fetching from Express API endpoint (Option 2) first
  try {
    const response = await fetch('/api/history');
    if (response.ok) {
      const data = await response.json();
      if (data.success && Array.isArray(data.history)) {
        history = data.history;
        localStorage.setItem("weatherHistory", JSON.stringify(history));
      }
    } else {
      throw new Error("API fallback");
    }
  } catch (e) {
    // LocalStorage fallback (Option 1)
    history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  }

  const recentSearches = history.slice(0, 5);
  historyList.innerHTML = "";

  if (recentSearches.length === 0) {
    historyList.innerHTML = `<li class="empty-history">No recent searches</li>`;
    return;
  }

  recentSearches.forEach(item => {
    const li = document.createElement("li");
    li.title = `Click to view weather for ${item.city}`;
    li.innerHTML = `
      <span class="history-city">${item.city}</span>
      <div class="history-details">
        <span class="history-temp">${item.temp}</span>
        <span class="history-time">${item.time}</span>
      </div>
    `;
    li.onclick = () => getWeather(item.city.split(',')[0]);
    historyList.appendChild(li);
  });
}

/**
 * Clear history from LocalStorage (Option 1) and Express API (Option 2)
 */
async function clearHistory() {
  // Clear LocalStorage
  localStorage.removeItem("weatherHistory");

  // Clear Express API database
  try {
    await fetch('/api/history', { method: 'DELETE' });
  } catch (e) {
    // Offline mode
  }

  showHistory();
}