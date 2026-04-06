

const API_KEY = "e97016827e833856d0a912b40ce560f9"; 
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// State
let currentUnit = "metric";

// DOM Elements
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherInfo = document.getElementById("weatherInfo");
const loader = document.getElementById("loader");
const errorMsg = document.getElementById("errorMsg");
const unitToggle = document.getElementById("unitToggle");

// Weather display elements
const cityName = document.getElementById("cityName");
const countryCode = document.getElementById("countryCode");
const dateText = document.getElementById("dateText");
const temperature = document.getElementById("temperature");
const weatherDesc = document.getElementById("weatherDesc");
const weatherIcon = document.getElementById("weatherIcon");
const windSpeed = document.getElementById("windSpeed");
const humidity = document.getElementById("humidity");
const visibility = document.getElementById("visibility");
const feelsLike = document.getElementById("feelsLike");

// Event Listeners
searchBtn.addEventListener("click", handleSearch);
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});
unitToggle.addEventListener("click", toggleUnit);

// ==============================
// SEARCH HANDLER
// ==============================
function handleSearch() {
  const city = cityInput.value.trim();
  if (!city) {
    showError("Please enter a city name.");
    return;
  }
  fetchWeather(city);
}

// ==============================
// FETCH WEATHER BY CITY
// ==============================
async function fetchWeather(city) {
  showLoader();
  clearError();

  try {
    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${currentUnit}`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("City not found. Try another name.");
      } else if (response.status === 401) {
        throw new Error("Invalid API key. Check your key.");
      } else {
        throw new Error("Something went wrong. Try again.");
      }
    }

    const data = await response.json();
    localStorage.setItem("lastCity", data.name);
    displayWeather(data);

  } catch (err) {
    showError(err.message);
    hideLoader();
    hideWeather();
  }
}

// ==============================
// FETCH WEATHER BY GPS
// ==============================
async function fetchWeatherByCoords(lat, lon) {
  showLoader();
  clearError();

  try {
    const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Unable to fetch location weather.");
    }

    const data = await response.json();
    localStorage.setItem("lastCity", data.name);
    displayWeather(data);

  } catch (err) {
    showError(err.message);
    hideLoader();
  }
}

// ==============================
// GET USER LOCATION
// ==============================
function getUserLocation() {
  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    fetchWeather(lastCity);
    return;
  }

  if (!navigator.geolocation) {
    fetchWeather("Lagos");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchWeatherByCoords(latitude, longitude);
    },
    () => {
      fetchWeather("Lagos"); // fallback
    }
  );
}

// ==============================
// DISPLAY WEATHER
// ==============================
function displayWeather(data) {
  // Location
  cityName.textContent = data.name;
  countryCode.textContent = data.sys.country;
  dateText.textContent = formatDate(new Date());

  // Temperature
  temperature.textContent =
    currentUnit === "metric"
      ? `${Math.round(data.main.temp)}°C`
      : `${Math.round(data.main.temp)}°F`;

  // Description (capitalized)
  weatherDesc.textContent =
    data.weather[0].description.replace(/\b\w/g, c => c.toUpperCase());

  // Icon
  const iconCode = data.weather[0].icon;
  weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  weatherIcon.alt = data.weather[0].description;

  // Details
  windSpeed.textContent = `${data.wind.speed}`;
  humidity.textContent = `${data.main.humidity}%`;
  visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
  feelsLike.textContent =
    currentUnit === "metric"
      ? `${Math.round(data.main.feels_like)}°C`
      : `${Math.round(data.main.feels_like)}°F`;

  // Dynamic Background
  updateBackground(data.weather[0].main);

  hideLoader();
  showWeather();
}

// ==============================
// BACKGROUND CHANGE
// ==============================
function updateBackground(condition) {
  const c = condition.toLowerCase();
  document.body.className = "";

  if (c.includes("cloud")) {
    document.body.classList.add("cloudy");
  } else if (c.includes("rain")) {
    document.body.classList.add("rainy");
  } else if (c.includes("clear")) {
    document.body.classList.add("sunny");
  }
}

// ==============================
// UNIT TOGGLE
// ==============================
function toggleUnit() {
  currentUnit = currentUnit === "metric" ? "imperial" : "metric";
  handleSearch();
}

// ==============================
// UTILITIES
// ==============================
function formatDate(date) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  };
  return date.toLocaleDateString("en-US", options);
}

// ==============================
// UI STATES
// ==============================
function showLoader() {
  loader.classList.remove("hidden");
  weatherInfo.classList.add("hidden");
  searchBtn.disabled = true;
}

function hideLoader() {
  loader.classList.add("hidden");
  searchBtn.disabled = false;
}

function showWeather() {
  weatherInfo.classList.remove("hidden");
}

function hideWeather() {
  weatherInfo.classList.add("hidden");
}

function showError(msg) {
  errorMsg.textContent = msg;
  weatherInfo.classList.add("hidden");
}

function clearError() {
  errorMsg.textContent = "";
}

// ==============================
// INITIAL LOAD
// ==============================
window.addEventListener("load", () => {
  getUserLocation();
});