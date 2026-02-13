
const searchInp = document.querySelector(".wether-search");
const cityEl = document.querySelector(".wether-city");
const dayEl = document.querySelector(".wether-day");
const humidityEl = document.querySelector(".wether-inicator-humidity .value");
const windEl = document.querySelector(".wether-inicator-wind .value");
const pressureEl = document.querySelector(".wether-inicator-pressure .value");
const imageEl = document.querySelector(".weather-image");
const tempEl = document.querySelector(".weather-temprature .value");
const forecastBlock = document.querySelector(".wether-forecast");


const API_KEY = "93a2cf5f59585c449aed39bc0d521e67";

const CURRENT_URL = `https://api.openweathermap.org/data/2.5/weather?units=metric&appid=${API_KEY}`;
const FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=${API_KEY}`;


const getWeatherByCity = async (city) => {
  const response = await fetch(`${CURRENT_URL}&q=${city}`);
  return response.json();
};

const getForecastByCityId = async (id) => {
  const response = await fetch(`${FORECAST_URL}&id=${id}`);
  const data = await response.json();

  const days = {};

  data.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];

    if (!days[date]) {
      days[date] = {
        temps: [],
        weather: item.weather[0],
        dt_txt: item.dt_txt
      };
    }

    days[date].temps.push(item.main.temp);
  });

  return Object.values(days)
    .slice(0, 5)
    .map(day => ({
      min: Math.min(...day.temps),
      max: Math.max(...day.temps),
      weather: day.weather,
      dt_txt: day.dt_txt
    }));
};


searchInp.addEventListener("keydown", async (e) => {
  if (e.key !== "Enter") return;

  const weather = await getWeatherByCity(searchInp.value);

  if (weather.cod !== 200) {
    alert("شهر پیدا نشد");
    return;
  }

  updateCurrentWeather(weather);

  const forecast = await getForecastByCityId(weather.id);
  updateForecast(forecast);
});


const updateCurrentWeather = (data) => {
  cityEl.textContent =` ${data.name}, ${data.sys.country}`;
  dayEl.textContent = `${getTodayName()}`;

  humidityEl.textContent = `${data.main.humidity}`;
  pressureEl.textContent = `${data.main.pressure}`;

  windEl.textContent =` ${getWindDirection(data.wind.deg)}, ${data.wind.speed}`;

  tempEl.textContent =` ${data.main.temp > 0 ? "+" : ""}${Math.round(data.main.temp)}°C`;

  imageEl.src =`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
};


const updateForecast = (forecast) => {
  forecastBlock.innerHTML = "";

  forecast.forEach(day => {
    const div = document.createElement("div");
    div.className = "forecast-item";

    const dateName = new Date(day.dt_txt.replace(" ", "T"))
      .toLocaleDateString("en-EN", { weekday: "short" });

    div.innerHTML = `
      <p>${dateName}</p>
      <img src="https://openweathermap.org/img/wn/${day.weather.icon}@2x.png">
      <p>⬆ ${Math.round(day.max)}°C</p>
      <p>⬇ ${Math.round(day.min)}°C</p>`
    ;

    forecastBlock.appendChild(div);
  });
};


const getTodayName = () => {
  return new Date().toLocaleDateString("en-EN", { weekday: "long" });
};

const getWindDirection = (deg) => {
  if (deg > 45 && deg <= 135) return "East";
  if (deg > 135 && deg <= 225) return "South";
  if (deg > 225 && deg <= 315) return "West";
  return "North";
};