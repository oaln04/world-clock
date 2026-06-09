const body = document.body;
const THEME_KEY = 'theme-preference';

function getToggle() {
  return document.getElementById('toggle');
}

function applyLight(on) {
  const html = document.documentElement;
  if (on) {
    html.classList.add('light');
    body.classList.add('light');
  } else {
    html.classList.remove('light');
    body.classList.remove('light');
  }
}

async function getLocationAndSetTheme() {
  const manualPreference = localStorage.getItem(THEME_KEY);
  let isDay = false;

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const geoResponse = await fetch('https://ipapi.co/json/');
    const geoData = await geoResponse.json();
    const { latitude, longitude } = geoData;
    const today = new Date().toISOString().split('T')[0];
    const sunResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=sunrise,sunset&timezone=${timezone}&date=${today}`
    );
    const sunData = await sunResponse.json();

    if (sunData.daily && sunData.daily.sunrise && sunData.daily.sunset) {
      const sunrise = new Date(sunData.daily.sunrise[0]);
      const sunset = new Date(sunData.daily.sunset[0]);
      const now = new Date();
      isDay = now >= sunrise && now < sunset;
    }
  } catch (error) {
    const hour = new Date().getHours();
    isDay = hour >= 6 && hour < 18;
    console.warn('Using fallback time-based theme detection:', error);
  }

  if (!manualPreference) {
    applyLight(isDay);
  } else {
    applyLight(manualPreference === 'light');
  }

  const toggleEl = getToggle();
  if (toggleEl) {
    toggleEl.textContent = document.documentElement.classList.contains('light') ? '☀️' : '🌙';
  }
}

function setThemeToggle() {
  const toggleEl = getToggle();
  if (!toggleEl) return;

  toggleEl.textContent = document.documentElement.classList.contains('light') ? '☀️' : '🌙';

  toggleEl.onclick = () => {
    const isLight = document.documentElement.classList.contains('light');
    applyLight(!isLight);
    toggleEl.textContent = !isLight ? '☀️' : '🌙';
    localStorage.setItem(THEME_KEY, !isLight ? 'light' : 'dark');
  };
}

function setYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  setThemeToggle();
  setYear();
  getLocationAndSetTheme().catch(() => {});
});
