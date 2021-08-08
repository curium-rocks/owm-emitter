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

export interface OwmEmitterOptions {
    /**
     * Unique identifier for the emitter
     */
    id: string;
    /**
     * Useful name of the emitter
     */
    name: string;
    /**
     * Full description of the emitter
     */
    description: string;
    /**
     * How often to check the owm one call api for new data, do not set
     * this higher than your allowable call rates
     */
    checkInterval: number;
    /**
     * Your OWM App ID
     */
    appId: string;
    /**
     * The latitude of the targeted area
     */
    latitude: number;
    /**
     * The longitude of the targeted area
     */
    longitude: number;
    /**
     * The amount of milliseconds without receiving a message, that triggers the emitter
     * being considered disconnected.
     */
    dcThresholdMs?: number;
}

/**
 * Polls the OWM one call API, looks for changes, 
 * and emits an event on change.
 */
export class OwmEmitter extends DeltaPollingEmitter {
    public static readonly TYPE = 'OWM-EMITTER';
    private readonly owmClient: OwmClient;
    private readonly appId: string;

    private latitude: number;
    private longitude: number;


    /**
     *
     * @param {OwmEmitterOptions} options
     */
    constructor(options:OwmEmitterOptions) {
        super(options.id, options.name, options.description, options.checkInterval);
        this.latitude = options.latitude;
        this.longitude = options.longitude;
        this.appId = options.appId;
        this.owmClient = new OwmClient(axios);
        if(options.dcThresholdMs != null) {
            this.setDCCheckInterval(options.dcThresholdMs*3, options.dcThresholdMs);
        }
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
     * @return {unknown}
     */
    getEmitterProperties(): unknown {
        return {
            appId: this.appId,
            latitude: this.getLatitude(),
            longitude: this.getLongitude(),
            checkInterval: this._interval
        }
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

    /**
     * Get the emitter type
     * @return {string}
     */
    public getType(): string {
        return OwmEmitter.TYPE;
    }
}