// openweatherMap API

const API_KEY = "YOUR_API_KEY_HERE";

const cityInput = document.getElementById("city-input");
const locationBtn = document.getElementById("location-btn");
const themeToggle = document.getElementById("theme-toggle");

const weatherCard = document.getElementById("weather-card");
const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const weatherIcon = document.getElementById("weather-icon");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");

const errorMessage = document.getElementById("error-message");
const loading = document.getElementById("loading");

const historyList = document.getElementById("history-list");

const forecastContainer = document.getElementById("forecast-cards");

// weather icons

const weatherIcons = {
'01d': 'https://openweathermap.org/img/wn/01d@2x.png', // clear sky day
'01n': 'https://openweathermap.org/img/wn/01n@2x.png', // clear sky night
'02d': 'https://openweathermap.org/img/wn/02d@2x.png', // few clouds day
'02n': 'https://openweathermap.org/img/wn/02n@2x.png', // few clouds night
'03d': 'https://openweathermap.org/img/wn/03d@2x.png', // scattered clouds
'03n': 'https://openweathermap.org/img/wn/03n@2x.png', 
'04d': 'https://openweathermap.org/img/wn/04d@2x.png', // Broken clouds
'04n': 'https://openweathermap.org/img/wn/04n@2x.png', 
'09d': 'https://openweathermap.org/img/wn/09d@2x.png', // shower rain
'09n': 'https://openweathermap.org/img/wn/09n@2x.png', 
'10d': 'https://openweathermap.org/img/wn/10d@2x.png', // rain day
'10n': 'https://openweathermap.org/img/wn/10n@2x.png', // rain night
'11d': 'https://openweathermap.org/img/wn/11d@2x.png', // thunderstorm
'11n': 'https://openweathermap.org/img/wn/11n@2x.png', 
'13d': 'https://openweathermap.org/img/wn/13d@2x.png', // snow
'13n': 'https://openweathermap.org/img/wn/13n@2x.png', 
'50d': 'https://openweathermap.org/img/wn/50d@2x.png', // mist
'50n': 'https://openweathermap.org/img/wn/50n@2x.png', 
};

// Capitalize helper

function capitalizeFirst(str = "") {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Save to History
function saveToHistory(city) {
    let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];

    if (!history.includes(city)) {
        history.push(city);
        localStorage.setItem("weatherHistory", JSON.stringify(history));
    }
    displayHistory();
}

// Show history 

function displayHistory() {
    historyList.innerHTML = "";
    let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];

    history.forEach(city => {
        const item = document.createElement("button");
        item.textContent = city;
        item.className = "history-item";
        item.onclick = () => fetchWeather(city);
        historyList.appendChild(item);
    });
}

// Clear history

const clearHistoryBtn = document.getElementById("clear-history");

clearHistoryBtn.addEventListener("click", () => {
    localStorage.removeItem("weatherHistory");
    displayHistory();
});

// Fetch main weather

async function fetchWeather(city) {
    weatherCard.classList.add("hidden");
    errorMessage.classList.add("hidden");
    loading.classList.remove("hidden");

    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );

        if (!res.ok) throw new Error("City not found");

        const data = await res.json();

        cityName.textContent = `${data.name}, ${data.sys.country}`;
        temperature.innerHTML = `${Math.round(data.main.temp)}&#176;C`;
        description.textContent = capitalizeFirst(data.weather[0].description);
        humidity.textContent = `${data.main.humidity}%`;
        wind.textContent = `${data.wind.speed} km/h`;

        const icon = data.weather[0].icon;
        weatherIcon.src = weatherIcons[icon];

        weatherCard.classList.remove("hidden");

        saveToHistory(city);
        getForecast(city);

    } catch (e) {
        errorMessage.classList.remove("hidden");
    }

    loading.classList.add("hidden");

}

// Forecast Function

async function getForecast(city) {
    forecastContainer.innerHTML = "";

    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
        );

        const data = await res.json();

        let days = {};

        data.list.forEach(item => {
            const date = item.dt_txt.split(" ")[0];
            if (!days[date]) days[date] = item;
        });

        Object.keys(days).slice(0, 5).forEach(date => {
            const item = days[date];
            const icon = item.weather[0].icon;
            const temp = Math.round(item.main.temp);
            const desc = capitalizeFirst(item.weather[0].description);

            const card = document.createElement("div");
            card.className = "forecast-card";

            card.innerHTML = `
                <p>${date}</p>
                <img src="${weatherIcons[icon]}" alt="">
                <p>${temp}°C</p>
                <small>${desc}</small>
            `;
            forecastContainer.appendChild(card);
        });
    } catch (e) {
        console.error("Forecast error:", e);
    }

}

// Geolocation

locationBtn.addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(success => {
        const { latitude, longitude } = success.coords;

        fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
        )
            .then(res => res.json())
            .then(data => fetchWeather(data.name));
    });
});

// Search Input

cityInput.addEventListener("keypress", e => {
    if (e.key === "Enter") {
        fetchWeather(cityInput.value.trim());
        cityInput.value = "";
    }
});

// Dark Mode 

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    // Switch icon

    if (document.body.classList.contains("dark")) {
        themeToggle.textContent = "🌞 Light Mode";
    } else {
        themeToggle.textContent = "🌓 Dark Mode";
    }
});

// Initailize history 0n page load

displayHistory();

// Load default city if history is empty

let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];

if (history.length === 0) {
    fetchWeather("Tokyo");  // default when  first using app
}






