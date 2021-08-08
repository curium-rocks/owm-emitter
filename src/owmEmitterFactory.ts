import { BaseEmitter, IDataEmitter, IEmitterDescription, IEmitterFactory, IFormatSettings, LoggerFacade } from "@curium.rocks/data-emitter-base";
import { OwmEmitter } from "./owmEmitter";

/**
 * 
 */
export class OwmEmitterFactory implements IEmitterFactory {

    private _loggerFacade?:LoggerFacade;

    /**
     * 
     * @param {string} message 
     * @return {Promise<IDataEmitter>} 
     */
    private static rejectValidationError(message:string) : Promise<IDataEmitter> {
        return Promise.reject(new Error(message));
    }

    /**
     * 
     * @param {IEmitterDescription} description 
     * @return {Promise<IDataEmitter>}
     */
    buildEmitter(description: IEmitterDescription): Promise<IDataEmitter> {
        if(description.emitterProperties == null) return OwmEmitterFactory.rejectValidationError("Missing required emitter properties");
        const props = description.emitterProperties as Record<string, unknown>;
        if(props == null) return OwmEmitterFactory.rejectValidationError("Invalid type for emitter properties");
        if(props.appId == null) return OwmEmitterFactory.rejectValidationError("Missing required appId property");
        if(props.checkInterval == null) OwmEmitterFactory.rejectValidationError("Missing required checkInterval property");
        if(props.latitude == null) OwmEmitterFactory.rejectValidationError("Missing required latitude property");
        if(props.longitude == null) OwmEmitterFactory.rejectValidationError("Missing required longitude property");
        return Promise.resolve(new OwmEmitter({
            id: description.id,
            name: description.name,
            description: description.description,
            appId: props.appId as string,
            checkInterval: props.checkInterval as number,
            latitude: props.latitude as number,
            longitude: props.longitude as number
        }));
    }

    /**
     * 
     * @param {string} base64StateData 
     * @param {IFormatSettings} formatSettings
     * @return {Promise<IDataEmitter>}
     */
    recreateEmitter(base64StateData: string, formatSettings: IFormatSettings): Promise<IDataEmitter> {
        return BaseEmitter.recreateEmitter(base64StateData, formatSettings);
    }

    /**
     * 
     * @param {LoggerFacade} loggerFacade 
     */
    setLoggerFacade(loggerFacade: LoggerFacade): void {
        this._loggerFacade = loggerFacade;
    }

}