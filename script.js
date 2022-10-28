/* eslint-disable func-names */
(function () {
  const settings = {
    city: 'London',
    tempInCelsius: true,
    lastForecastObject: {},
  };

  // FORM
  const form = document.querySelector('form');
  const inputField = document.querySelector('.inputField');
  const warning = document.querySelector('.warning');

  // DATA FOR USER
  const cityForUser = document.querySelector('.city');
  const tempForUser = document.querySelector('.temperature');
  const feelsLikeForUser = document.querySelector('.feelsLike');
  const weatherIcon = document.querySelector('.weatherIcon');
  const decsriptionForUser = document.querySelector('.weatherDescription');
  const windSpeedForUser = document.querySelector('.windSpeed');
  const humidityForUser = document.querySelector('.humidity');
  const pressureForUser = document.querySelector('.pressure');
  const forecastColumnsChilds = document.querySelectorAll('.forecastColumn *');

  // SWITCH Celsius and Fahrenheit
  const switcher = document.querySelector('.switcher');
  const tempSymbols = document.querySelectorAll('.tempSymbol');

  function extractWeatherForecats(response) {
    const city = response.name;
    const { temp, humidity } = response.main;
    const pressure = Math.round(response.main.pressure * 0.75);
    const feelsLike = response.main.feels_like;
    const weatherMain = response.weather[0].main;
    const weatherDescription = response.weather[0].description;
    const { icon } = response.weather[0];
    const windSpeed = response.wind.speed;
    return {
      city,
      temp,
      feelsLike,
      pressure,
      weatherMain,
      weatherDescription,
      icon,
      windSpeed,
      humidity,
    };
  }

  function saveToLocalStorage() {
    localStorage.setItem('settings', JSON.stringify(settings));
  }

  function loadFromLocalStorage() {
    const savedObject = JSON.parse(localStorage.getItem('settings'));
    if (savedObject && savedObject.lastForecastObject.city.length > 0) {
      settings.city = savedObject.city;
      settings.tempInCelsius = savedObject.tempInCelsius;
      settings.lastForecastObject = savedObject.lastForecastObject;
    }
  }

  function resetForm() {
    inputField.value = '';
    warning.classList.remove('showWarning');
  }

  async function getWeatherForecast() {
    const apiKey = 'f82e160938b3d2a066518b10198f33a6';
    const city = inputField.value || settings.city;
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${settings.metric}&APPID=${apiKey}`,
      );
      return response.json();
    } catch {
      return 'error';
    }
  }

  function degreesIcon() {
    let result = '';
    if (settings.tempInCelsius) {
      switcher.textContent = 'display °F';
      result = '°C';
    } else {
      switcher.textContent = 'display °C';
      result = '°F';
    }
    return result;
  }

  function tempConverter(tempInKelvin) {
    if (settings.tempInCelsius) {
      return Math.round(tempInKelvin - 273.15);
    }
    return Math.round((tempInKelvin - 273.15) * 1.8 + 32);
  }

  function renderForecast(forecastObject) {
    cityForUser.textContent = forecastObject.city;
    tempForUser.textContent = `${tempConverter(forecastObject.temp)}`;
    feelsLikeForUser.textContent = `Feels like: ${tempConverter(
      forecastObject.feelsLike,
    )}`;
    decsriptionForUser.textContent = forecastObject.weatherDescription;
    windSpeedForUser.textContent = `${forecastObject.windSpeed} m/s`;
    humidityForUser.textContent = `${forecastObject.humidity} %`;
    pressureForUser.textContent = `${forecastObject.pressure} mmHg`;
    tempSymbols.forEach((tempSymbol) => {
      // eslint-disable-next-line no-param-reassign
      tempSymbol.textContent = ` ${degreesIcon()}`;
    });

    weatherIcon.innerHTML = '';
    const forecastIcon = document.createElement('img');
    forecastIcon.src = `https://openweathermap.org/img/wn/${forecastObject.icon}@2x.png`;
    weatherIcon.appendChild(forecastIcon);
  }

  async function hideForecast() {
    forecastColumnsChilds.forEach((element) => {
      element.classList.add('hideForecast');
    });
  }

  async function showForecast() {
    forecastColumnsChilds.forEach((element) => {
      element.classList.remove('hideForecast');
    });
  }

  async function updatePage() {
    const forecast = await getWeatherForecast();
    if (forecast === 'error') return;
    if (forecast.cod === 200) {
      if (inputField.value) settings.city = inputField.value;
      const forecastObject = extractWeatherForecats(forecast);
      settings.lastForecastObject = forecastObject;
      saveToLocalStorage();
      hideForecast();
      setTimeout(() => {
        renderForecast(forecastObject);
      }, 250);
      resetForm();
      setTimeout(showForecast, 350);
    } else {
      warning.classList.add('showWarning');
    }
  }

  function submitForm(event) {
    event.preventDefault();
    updatePage();
  }

  function changeTempSymbol() {
    settings.tempInCelsius = !settings.tempInCelsius;
    saveToLocalStorage();
    renderForecast(settings.lastForecastObject);
  }

  loadFromLocalStorage();
  updatePage();

  form.addEventListener('submit', submitForm);
  switcher.addEventListener('click', changeTempSymbol);
}());
