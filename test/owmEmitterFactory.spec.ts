import { IDataEmitter, ProviderSingleton } from "@curium.rocks/data-emitter-base";
import { OwmEmitter } from "../src/owmEmitter";
import {OwmEmitterFactory } from "../src/owmEmitterFactory";
import { describe, it} from 'mocha';
import { expect, should } from 'chai';
import crypto from 'crypto';
import { IDisposable } from "@curium.rocks/data-emitter-base/build/src/dataEmitter";

const factory = new OwmEmitterFactory();
ProviderSingleton.getInstance().registerEmitterFactory(OwmEmitter.TYPE, factory);

const testDescription = {
    type: OwmEmitter.TYPE,
    id: 'test',
    description: 'test-desc',
    name: 'test-name',
    emitterProperties: {
        appId: 'test-app-id',
        latitude: 0.5,
        longitude: 0.6,
        checkInterval: 30000
    }
}

/**
 * 
 * @param {IDataEmitter} newEmitter 
 */
function validateEmitterMatch(newEmitter:IDataEmitter) : void {
    expect(newEmitter).to.be.instanceOf(OwmEmitter);
    const owmEmitter = newEmitter as OwmEmitter;
    expect(owmEmitter.name).to.be.eq(testDescription.name);
    expect(owmEmitter.id).to.be.eq(testDescription.id);
    expect(owmEmitter.description).to.be.eq(testDescription.description);
    expect(owmEmitter.getLatitude()).to.be.eq(testDescription.emitterProperties.latitude);
    expect(owmEmitter.getLongitude()).to.be.eq(testDescription.emitterProperties.longitude);
}


describe('OwmEmitterFactory', function() {
    describe('buildEmitter()', function() {
        it('Should be created to specification', async function() {
            const emitter = await ProviderSingleton.getInstance().buildEmitter(testDescription);
            try {
                validateEmitterMatch(emitter);
            } finally {
                (emitter as unknown as IDisposable).dispose();
            }
        });
    });
    describe('recreateEmitter()', function() {
        it('Should recreate from plaintext', async function() {
            const emitter = await ProviderSingleton.getInstance().buildEmitter(testDescription);
            validateEmitterMatch(emitter);
            const result = await emitter.serializeState({
                encrypted: false,
                type: OwmEmitter.TYPE
            })
            const recreatedEmitter = await ProviderSingleton.getInstance().recreateEmitter(result, {
                encrypted: false,
                type: OwmEmitter.TYPE
            });
            validateEmitterMatch(recreatedEmitter);
        });
        it('Should recreate from aes-256-gcm', async function() {
            const emitter = await ProviderSingleton.getInstance().buildEmitter(testDescription);
            validateEmitterMatch(emitter);
            const formatSettings = {
                encrypted: true,
                type: OwmEmitter.TYPE,
                algorithm: 'aes-256-gcm',
                iv: crypto.randomBytes(32).toString('base64'),
                key: crypto.randomBytes(32).toString('base64')
            };
            const result = await emitter.serializeState(formatSettings);
            const recreatedEmitter = await ProviderSingleton.getInstance().recreateEmitter(result, formatSettings);
            validateEmitterMatch(recreatedEmitter);
        });
    });
});