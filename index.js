require('dotenv').config();
const https = require('https');
const config = require('./config');

const getCoordinates = (city, callback) => {
	const apiKey = config.API_KEY;
	const url = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;

	https.get(url, (res) => {
		let data = '';

		res.on('data', (chunk) => {
			data += chunk;
		});

		res.on('end', () => {
			const location = JSON.parse(data)[0];
			if (location) {
				callback(null, location.lat, location.lon);
			} else {
				callback(new Error('Город не найден'), null);
			}
		});
	}).on('error', (err) => {
		callback(err, null);
	});
};

const getWeather = (lat, lon) => {
	const apiKey = config.API_KEY;
	const url = `${config.BASE_URL}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

	https.get(url, (res) => {
		let data = '';

		res.on('data', (chunk) => {
			data += chunk;
		});

		res.on('end', () => {
			const weatherData = JSON.parse(data);
			if (weatherData.cod === 200) {
				console.log(`Погода сейчас в ${weatherData.name}:`);
				console.log(`температура: ${weatherData.main.temp}°C`);
				console.log(`Погода: ${weatherData.weather[0].description}`);
			} else {
				console.error('ошибка:', weatherData.message);
			}
		});
	}).on('error', (err) => {
		console.error('ошибка:', err.message);
	});
};

const city = process.argv[2];

if (!city) {
	console.error('проверьте название города');
	process.exit(1);
}

getCoordinates(city, (err, lat, lon) => {
	if (err) {
		console.error(err.message);
	} else {
		getWeather(lat, lon);
	}
});