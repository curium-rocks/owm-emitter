# OWM-Emitter
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=curium-rocks_owm-emitter&metric=security_rating)](https://sonarcloud.io/dashboard?id=curium-rocks_owm-emitter) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=curium-rocks_owm-emitter&metric=coverage)](https://sonarcloud.io/dashboard?id=curium-rocks_owm-emitter) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=curium-rocks_owm-emitter&metric=alert_status)](https://sonarcloud.io/dashboard?id=curium-rocks_owm-emitter)
## Description
 This library polls the OpenWeatherMap Onecall API, detects changes, and on change,
emits a event to listeners.

## How to install
`npm install --save @curium.rocks/owm-emitter`

## Examples

### Imports

```typescript
import {OwmEmitter, OwmEmitterOptions, OneCallApiResponse, IDataEvent} from "@curium.rocks/owm-emitter";
```

### Creating the options object
```typescript
const owmOptions:OwmEmitterOptions = {
    id: 'your-unique-id',
    description: 'Some full text description associated to this emitter',
    name: 'your emitter name',
    checkInterval: 300000, // check for updates every 5 minutes
    appId: 'your owm app id/key',
    latitude: 0.0, // set latitude and longitude to the area you want to get weather data for
    longitude: 0.0
}
```

### Log all alerts to console

```typescript

const emitter = new OwmEmitter(owmOptions);
try {
    const listener = emitter.onData((evt: IDataEvent) => {
        const oneCallData: OneCallApiResponse = evt.data as OneCallApiResponse;
        oneCallData.alerts?.forEach((alert)=>{
            console.log(`Weather Alert: 
                         description = ${alert.description},
                         start = ${alert.start}, 
                         end = ${alert.end}, 
                         event = ${alert.event}, 
                         sender = ${alert.sender_name}`)
        });
    });
    emitter.startPolling();
} finally {
    emitter.dispose();
}
```
