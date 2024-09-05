import * as rm from 'typed-rest-client/RestClient';

const latitude: number = /* TODO: FILL */;
const longitude: number = /* TODO: FILL */;
const intervalMinutes: number = 15;
const thresholdTemp: number = 26.5;

interface WeatherResult {
    latitude: number
    longitude: number
    generationtime_ms: number
    utc_offset_seconds: number
    timezone: string
    timezone_abbreviation: string
    elevation: number
    current_units: CurrentUnits
    current: Current
}

interface CurrentUnits {
    time: string
    interval: string
    temperature_2m: string
}

interface Current {
    time: string
    interval: number
    temperature_2m: number
}

const client = new rm.RestClient("get-temp", "https://api.open-meteo.com/v1/");

let below: boolean = false;

async function getCurrentTemp() {
    const res = await client.get<WeatherResult>("forecast", {
        queryParameters: {
            params: {
                latitude,
                longitude,
                current: "temperature_2m",
            },
        },
    });

    if (res.statusCode !== 200 || !res.result)
        throw Error(`Could not get temperature. Status code: ${res.statusCode}`);

    return res.result.current.temperature_2m;
}

async function alertOnLowTemp() {
    let temp: number;
    try {
        temp = await getCurrentTemp();
    }
    catch (e) {
        console.error(e);
        return;
    }
    if (temp > thresholdTemp) {
        if (below)
            console.log(`!!! TEMPERATURE NOW ABOVE ${thresholdTemp}°C !!!`);
        else
            console.log("No change.");
    }
    else if (!below)
        console.log(`!!! TEMPERATURE NOW BELOW ${thresholdTemp}°C !!!`);
    else
        console.log("No change.");

    below = temp <= thresholdTemp;
}

setInterval(alertOnLowTemp, intervalMinutes * 60000);
