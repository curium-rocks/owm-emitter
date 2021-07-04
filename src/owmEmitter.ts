import {ICommand, IExecutionResult, PollingEmitter} from '@curium.rocks/data-emitter-base';

import {OwmClient} from '@curium.rocks/openweathermap-client';
import axios from 'axios';

/**
 * Polls the OWM one call API, looks for changes, 
 * and emits an event on change.
 */
export class OwmEmitter extends PollingEmitter {
    private readonly owmClient: OwmClient;
    private readonly appId: string;

    private latitude: number;
    private longitude: number;


    constructor(id: string, name: string, description: string, checkInterval: number, appid: string) {
        super(id, name, description, checkInterval);
        this.owmClient = new OwmClient(axios);
    }

    async poll(): Promise<unknown> {
        return this.owmClient.onecall.getData({
            lat: this.latitude,
            lon: this.longitude,
            appid: this.appId
        });
    }

    sendCommand(command: ICommand): Promise<IExecutionResult> {
        throw new Error('Method not implemented.');
    }

    getMetaData(): unknown {
        return undefined;
    }

    /**
     * Set the latitude for the area of interest for weather
     * @param latitude 
     */
    setLatitude(latitude: number) : void {
        this.latitude = latitude;
    }
    
    /**
     * 
     * @returns latitude of the AOI for weather
     */
    getLatitude(): number {
        return this.latitude;
    }

    /**
     * 
     * @param longitude set the longitude for the AOI for weather
     */
    setLongitude(longitude: number) : void {
        this.longitude = longitude;
    }
    
    /**
     * 
     * @returns longitude of the AOI
     */
    getLongitude() : number {
        return this.longitude;
    }

}