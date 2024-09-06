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

async function getCurrentTempSafe(): Promise<number | undefined> {
    try {
        return await getCurrentTemp();
    }
    catch (e) {
        console.error(e);
    }
}

async function alertOnLowTemp() {
    const temp = await getCurrentTempSafe();
    if (!temp)
        return;

    const prefix = `${new Date().toLocaleTimeString()} - ${temp}°C - `;
    if (temp > thresholdTemp) {
        if (below)
            console.log(`${prefix}!!! TEMPERATURE NOW ABOVE ${thresholdTemp}°C !!!`);
        else
            console.log(`${prefix}No change.`);
    }
    else if (!below)
        console.log(`${prefix}!!! TEMPERATURE NOW BELOW ${thresholdTemp}°C !!!`);
    else
        console.log(`${prefix}No change.`);

    below = temp <= thresholdTemp;
}

console.log(`Latitude: ${latitude}`);
console.log(`Longitude: ${longitude}`);
console.log(`Temperatur threshold: ${thresholdTemp}°C`);
console.log(`Checking each ${intervalMinutes} minutes`);
console.log();

alertOnLowTemp().then(() => setInterval(alertOnLowTemp, intervalMinutes * 60000));
