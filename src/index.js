import './style.css';

const API_KEY = '32d21edeb26349c69b3194610231512'; // THIS SHOULDN'T NORMALLY BE DONE, SAVE KEYS IN SECRETS
const GIPHY_API_KEY = 'eba4nY288dxz7muQy73i5oZwC55BEFH5'; // THIS SHOULDN'T NORMALLY BE DONE, SAVE KEYS IN SECRETS
const MAX_LENGTH = 40;

const body = document.querySelector('body');
const form = document.querySelector('form');
const locationInput = document.getElementById('location');
const errorSpan = document.getElementById('error');
const charsLeft = document.getElementById('characters-left');
const divResult = document.querySelector('.results');
const loader = document.querySelector('.loader');

async function getCurrentWeather(location) {
    try {
        loader.classList.remove('hidden');
        divResult.classList.add('hidden');
        const response = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location}&aqi=no`
        );
        if (response.ok) {
            const data = await processJSON(response);
            const gifResponse = await fetch(
                `https://api.giphy.com/v1/gifs/translate?api_key=${GIPHY_API_KEY}&s=${data.current.condition.text}`
            );
            const gifObj = await gifResponse.json();
            displayResult(data);
            displayGIF(gifObj.data.images.original.url);
        }
    } catch (error) {
        console.log(error);
    } finally {
        loader.classList.add('hidden');
        divResult.classList.remove('hidden');
    }
}

async function getForecastWeather(location, days) {
    try {
        const response = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=${days}&aqi=no&alerts=no`
        );
        const data = await processJSON(response);
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
                icon: `https://${data.current.condition.icon.replace(
                    '//',
                    ''
                )}`,
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

function displayResult(resultData) {
    divResult.replaceChildren();

    const header = document.createElement('h2');
    const pLocalTime = document.createElement('p');
    const conditionTitle = document.createElement('h2');
    const pCondition = document.createElement('p');
    const conditionText = document.createElement('span');
    const pConditionIcon = document.createElement('img');
    const pTempC = document.createElement('p');
    const pTempF = document.createElement('p');
    const pLastUpdated = document.createElement('p');

    header.textContent = `${resultData.location.name}, ${resultData.location.region}, ${resultData.location.country}`;
    pLocalTime.textContent = `Local time: ${resultData.location.localtime}`;
    conditionTitle.textContent = 'Current condition';
    conditionText.textContent = resultData.current.condition.text;
    pConditionIcon.src = resultData.current.condition.icon;
    pConditionIcon.alt = 'Current weather icon';
    pCondition.appendChild(conditionText);
    pTempC.textContent = `Temp. (celsius): ${resultData.current.temp_c} C`;
    pTempF.textContent = `Temp. (fahrenheit): ${resultData.current.temp_f} F`;
    pLastUpdated.textContent = `Last updated: ${resultData.current.last_updated}`;

    divResult.appendChild(header);
    divResult.appendChild(pLocalTime);
    divResult.appendChild(pCondition);
    divResult.appendChild(pConditionIcon);
    divResult.appendChild(pTempC);
    divResult.appendChild(pTempF);
    divResult.appendChild(pLastUpdated);

    if (resultData.current.is_day) {
        body.className = 'day';
    } else {
        body.className = 'night';
    }
}

function displayGIF(url) {
    const gifImg = document.createElement('img');
    gifImg.className = 'gif';
    gifImg.src = url;
    divResult.appendChild(gifImg);
}

form.addEventListener('submit', (e) => {
    if (locationInput.validity.valueMissing) {
        errorSpan.textContent = 'Location is required';
        errorSpan.className = 'error active';
    } else if (locationInput.validity.tooLong) {
        errorSpan.textContent = `Too long, max character limit is ${locationInput.getAttribute(
            'maxlength'
        )}`;
        errorSpan.className = 'error active';
    } else {
        errorSpan.textContent = '';
        errorSpan.className = 'error';
        getCurrentWeather(locationInput.value);
    }
    e.preventDefault();
});

locationInput.setAttribute('maxlength', MAX_LENGTH);
charsLeft.textContent = `${locationInput.getAttribute(
    'maxlength'
)} char(s) left`;

locationInput.addEventListener('input', () => {
    let nbCharsLeft =
        parseInt(locationInput.getAttribute('maxlength')) -
        locationInput.value.length;
    charsLeft.textContent = isNaN(nbCharsLeft)
        ? 'Invalid length'
        : `${nbCharsLeft} char(s) left`;
    if (!locationInput.validity.valueMissing) {
        errorSpan.textContent = '';
        errorSpan.className = 'error';
    }
});
