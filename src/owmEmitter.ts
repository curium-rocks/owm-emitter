import {DeltaPollingEmitter, ICommand, IDataEvent, IExecutionResult} from '@curium.rocks/data-emitter-base';

import {OwmClient} from '@curium.rocks/openweathermap-client';
import axios from 'axios';

/**
 * Polls the OWM one call API, looks for changes, 
 * and emits an event on change.
 */
export class OwmEmitter extends DeltaPollingEmitter {

    private readonly owmClient: OwmClient;
    private readonly appId: string;

    private latitude: number;
    private longitude: number;


    /**
     * 
     * @param {string} id 
     * @param {string} name 
     * @param {string} description 
     * @param {number} checkInterval 
     * @param {string} appid 
     * @param {number} lat
     * @param {number} lon
     */
    constructor(id: string, name: string, description: string, checkInterval: number, appid: string, lat: number, lon: number) {
        super(id, name, description, checkInterval);
        this.latitude = lat;
        this.longitude = lon;
        this.appId = appid;
        this.owmClient = new OwmClient(axios);
    }

    /**
     * 
     * @return {Promise<unknown>}
     */
    async poll(): Promise<unknown> {
        return this.owmClient.onecall.getData({
            lat: this.latitude,
            lon: this.longitude,
            appid: this.appId
        });
    }

    /**
     * 
     * @param {ICommand} command
     * @return {Promise<IExecutionResult>} 
     */
    sendCommand(command: ICommand): Promise<IExecutionResult> {
        return Promise.reject(new Error("Not implemented"));ß
    }

    /**
     * 
     * @return {unknown}
     */
    getMetaData(): unknown {
        return undefined;
    }

    /**
     * Set the latitude for the area of interest for weather
     * @param {number} latitude 
     */
    setLatitude(latitude: number) : void {
        this.latitude = latitude;
    }
    
    /**
     * 
     * @return {number} latitude of the AOI for weather
     */
    getLatitude(): number {
        return this.latitude;
    }

    /**
     * 
     * @param {number} longitude set the longitude for the AOI for weather
     */
    setLongitude(longitude: number) : void {
        this.longitude = longitude;
    }
    
    /**
     * 
     * @return {number} longitude of the AOI
     */
    getLongitude() : number {
        return this.longitude;
    }

    /**
     * 
     * @param {IDataEvent} evt 
     * @return {boolean}
     */
    hasChanged(evt: IDataEvent): boolean {
        return true;
    }

}