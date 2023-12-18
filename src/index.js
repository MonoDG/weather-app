import './style.css';

const API_KEY = '32d21edeb26349c69b3194610231512'; // THIS SHOULDN'T NORMALLY BE DONE, SAVE KEYS IN SECRETS

async function getCurrentWeather(location) {
    try {
        const response = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location}&aqi=no`
        );
        const data = await processJSON(response);
        console.log(data);
    } catch (error) {
        console.log(error);
    }
}

async function getForecastWeather(location, days) {
    try {
        const response = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=${days}&aqi=no&alerts=no`
        );
        const data = await processJSON(response);
        console.log(data);
    } catch (error) {
        console.log(error);
    }
}

async function processJSON(response) {
    const data = await response.json();
    const processedData = {
        location: {
            name: data.location.name,
            region: data.location.region,
            country: data.location.country,
            localtime: data.location.localtime,
        },
        current: {
            last_updated: data.current.last_updated,
            temp_c: data.current.temp_c,
            temp_f: data.current.temp_f,
            is_day: data.current.is_day,
            condition: {
                text: data.current.condition.text,
                icon: data.current.condition.icon,
            },
            feelslike_c: data.current.feelslike_c,
            feelslike_f: data.current.feelslike_f,
        },
    };

    if (data['forecast']) {
        processedData['forecast'] = {
            forecastday: data.forecast.forecastday.map((fday) => {
                return {
                    date: fday.date,
                    day: {
                        maxtemp_c: fday.day.maxtemp_c,
                        maxtemp_f: fday.day.maxtemp_f,
                        mintemp_c: fday.day.mintemp_c,
                        mintemp_f: fday.day.mintemp_f,
                        avgtemp_c: fday.day.avgtemp_c,
                        avgtemp_f: fday.day.avgtemp_f,
                        condition: {
                            text: fday.day.condition.text,
                            icon: fday.day.condition.icon,
                        },
                    },
                };
            }),
        };
    }
    return processedData;
}

Promise.all([getCurrentWeather('montreal'), getForecastWeather('medellin', 2)]);
