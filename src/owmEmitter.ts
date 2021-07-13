import {DeltaPollingEmitter, ICommand, IDataEvent, IExecutionResult, ISettings, ITraceableAction} from '@curium.rocks/data-emitter-base';
import { IPollingSettings } from '@curium.rocks/data-emitter-base/build/src/pollingEmitter';

import {OneCallApiResponse, OwmClient} from '@curium.rocks/openweathermap-client';
import axios from 'axios';

/**
 * 
 * @param {Record<string, unknown>} obj
 * @return {boolean} 
 */
export function hasLatLong (obj: Record<string, unknown>) : boolean {
    return obj['lat'] != null && obj['lon'] != null;
}

export interface LatLong {
    lat: number;
    lon: number;
}

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
    sendCommand(    
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        command: ICommand): Promise<IExecutionResult> {
        return Promise.reject(new Error("not implemented"));
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
     * @param {ISettings} settings 
     */
    public override async applySettings(settings: ISettings & ITraceableAction & IPollingSettings): Promise<IExecutionResult> {
        const baseResult = await super.applySettings(settings);
        if(!baseResult.success) return baseResult;
        if(settings.additional != null) {
            if(hasLatLong(settings.additional as Record<string, unknown>)) {
                const pos:LatLong = settings.additional as LatLong;
                this.setLatitude(pos.lat);
                this.setLongitude(pos.lon);
            }
        }
        return baseResult;
    }

    /**
     * 
     * @param {IDataEvent} evt 
     * @return {boolean}
     */
    hasChanged(evt: IDataEvent): boolean {
        if(this._lastDataEvent == null) return true;

        const lastEvt:OneCallApiResponse = this._lastDataEvent?.data as OneCallApiResponse;
        const newEvt:OneCallApiResponse = evt.data as OneCallApiResponse;

        // use the timestamp field to check for updates
        return lastEvt.current.dt != newEvt.current.dt;
    }

}