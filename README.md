# 🌤️ Weather App with Database Feature

An upgraded Weather Forecast application with search history persistence, offering two database implementation options: **LocalStorage Database (Option 1 - Client-side)** and **Node.js Express API with File Database (Option 2 - Server-side)**.

---

## 🛠️ How Database Works

### Option 1: LocalStorage Database (Client-Side)

In Option 1, the browser's built-in `localStorage` acts as a lightweight client-side key-value database.

1. **Storage Key**: `"weatherHistory"`
2. **Data Structure**:
   ```json
   [
     {
       "city": "Delhi, IN",
       "temp": "32°C",
       "time": "02:30 PM"
     }
   ]
   ```
3. **Operations**:
   - **Save Search (`saveToHistory`)**: After a successful weather API fetch, the city name, temperature, and timestamp are saved to `localStorage`.
   - **Retrieve & Limit (`showHistory`)**: `localStorage.getItem("weatherHistory")` retrieves the saved items and displays the **last 5 searches**.
   - **Clear History (`clearHistory`)**: Calling `localStorage.removeItem("weatherHistory")` resets the search database.

---

### Option 2: Node.js + Express REST API Database (`db.json`)

In Option 2, a Node.js + Express backend server (`server.js`) manages persistent database storage inside `db.json`.

1. **Database File**: `db.json` (Stores persistent JSON array of search records).
2. **REST API Endpoints**:
   - **`POST /api/history`**: Accepts `{ city, temp, time }` in request body, appends the record to `db.json`, caps entries to 5 items, and saves the file.
   - **`GET /api/history`**: Reads `db.json` and returns the recent 5 search entries.
   - **`DELETE /api/history`**: Empties `db.json` to clear history.
3. **Frontend Integration**: `script.js` automatically syncs with the API endpoints when `server.js` is running, while seamlessly falling back to `localStorage` when offline.

---

## 🚀 Quick Start Guide

### Option 1: Run LocalStorage Mode (No Server Required)

Simply double-click or open **`index.html`** in your web browser.
- Search for any city (e.g., Patna, Delhi, London).
- The recent 5 searches will instantly save and display under **Recent Searches**.
- Click **Clear** to remove history.

---

### Option 2: Run Express Backend Server Mode

1. Open your terminal in the project directory (`Weather App`).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Express server:
   ```bash
   npm start
   ```
4. Open your browser at:
   ```
   http://localhost:3000
   ```

---

## 📁 File Structure

- `index.html` - Main UI with Weather Card and Recent Searches section (`#history`, `#historyList`).
- `style.css` - Responsive styles for weather card, search input, and history list.
- `script.js` - Client script handling OpenWeather API calls, `localStorage` database, and API sync.
- `server.js` - Express backend server with REST API endpoints.
- `db.json` - Backend database storage file.
- `package.json` - Node project configuration (`express`, `cors`).
- `README.md` - Documentation.
