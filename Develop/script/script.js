
// Set up API key and global variables
var apiKey = "a99a1307f9cd590d5059ce1ffc2ef047";
var currWeatherDiv = $("#currentWeather");
var forecastDiv = $("#weatherForecast");
var citiesArray;

// Check to see if user enters a city in search box or not
if (localStorage.getItem("localWeatherSearches")) {
    citiesArray = JSON.parse(localStorage.getItem("localWeatherSearches"));
    writeSearchHistory(citiesArray);
} else {
    citiesArray = [];
};

// Get current weather data and add them to current weather div in html
function returnCurrentWeather(cityName) {
    var requestURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&APPID=${apiKey}`;

    fetch(requestURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            var currTime = new Date(data.dt * 1000);
            var weatherIcon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

            currWeatherDiv.html(`
            <h2>${data.name}, ${data.sys.country} (${currTime.getMonth() + 1}/${currTime.getDate()}/${currTime.getFullYear()})
                <img src="${weatherIcon}" height="90px">
            </h2>
            <p>Temp: ${(Math.ceil(data.main.temp * 9 / 5) + 32)} °F</p>
            <p>Wind: ${(data.wind.speed * 2.23694).toFixed(2)} MPH</p>
            <p>Humidity: ${data.main.humidity}%</p>
            `, returnUVIndex(data.coord));

            createHistoryButton(data.name);
        })
};

// Create 5 days forecast starting from tomorrow
function returnWeatherForecast(cityName) {
    var requestURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&APPID=${apiKey}`;

    fetch(requestURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            var forecastInfo = data.list;
            forecastDiv.empty();

            // Get tomorrow's date
            var currentDate = new Date();
            var tomorrowDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);

            // Loop through the next 5 days starting from tomorrow
            for (var i = 0; i < 5; i++) {
                var forecastDate = new Date(tomorrowDate.getTime() + i * 24 * 60 * 60 * 1000);
                var weatherIcon = `https://openweathermap.org/img/wn/${forecastInfo[i * 8].weather[0].icon}.png`;

                forecastDiv.append(`
                <div class="col-md">
                    <div class="card text-white bg-primary" style="background-color: rgb(32, 28, 49) !important; border-radius: 30px !important; border-radius: 30px !important;">
                        <div class="card-body" style="padding-left: 0.70rem !important; padding-right: 0.70rem !important; ">
                            <h4>${forecastDate.getMonth() + 1}/${forecastDate.getDate()}/${forecastDate.getFullYear()}</h4>
                            <img src="${weatherIcon}" alt="Icon">
                            <p>Temp: ${(Math.ceil(forecastInfo[i * 8].main.temp * 9 / 5) + 32)} °F</p>
                            <p>Wind: ${(forecastInfo[i * 8].wind.speed * 2.23694).toFixed(2)} MPH</p>
                            <p>Humidity: ${forecastInfo[i * 8].main.humidity}%</p>
                        </div>
                    </div>
                </div>
            `)
            };
        })
};

// Change the UV index colors based on number ratings
function returnUVIndex(coordinates) {
    var requestURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${coordinates.lat}&lon=${coordinates.lon}&APPID=${apiKey}`;

    fetch(requestURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            var currUVIndex = data.value;
            var uvSeverity = "green";
            var textColor = "white"

            if (currUVIndex >= 11) {
                uvSeverity = "brown";
            } else if (currUVIndex >= 8) {
                uvSeverity = "red";
            } else if (currUVIndex >= 6) {
                uvSeverity = "orange";
                textColor = "black";
            } else if (currUVIndex >= 3) {
                uvSeverity = "purple";
                textColor = "black";
            }
            currWeatherDiv.append(`<p>UV Index: <span class="text-${textColor} uvPadding" style="background-color: ${uvSeverity};">${currUVIndex}</span></p>`);
        })
};

// Create History buttons and save the history list 
function createHistoryButton(cityName) {

    var citySearch = cityName.trim();
    var buttonCheck = $(`#previousSearch > BUTTON[value='${citySearch}']`);
    if (buttonCheck.length == 1) {
        return;
    }

    if (!citiesArray.includes(cityName)) {
        citiesArray.push(cityName);
        localStorage.setItem("localWeatherSearches", JSON.stringify(citiesArray));
    }

    $("#previousSearch").prepend(`
    <button class="btn btn-light cityHistoryBtn" value='${cityName}'>${cityName}</button>
    `);
};

// Link each added city to their created button on the page
function writeSearchHistory(citiesArray) {
    for (var i = 0; i < citiesArray.length; i++) {
        createHistoryButton(citiesArray[i]);
    }
};

// Submit for new search
$("#submitCity").click(function (event) {
    event.preventDefault();
    var cityName = $("#cityInput").val();
    returnCurrentWeather(cityName);
    returnWeatherForecast(cityName);
});

// Store previous searched city on page to reuse
$("#previousSearch").click(function (event) {
    var cityName = event.target.value;
    returnCurrentWeather(cityName);
    returnWeatherForecast(cityName);
});

// Clear saved search history on click
$("#clearButton").on("click", function () {
    $("#localWeatherSearches").empty();
    $("#previousSearch").empty();
    $("#cityInput").empty();
    localStorage.clear();
});
