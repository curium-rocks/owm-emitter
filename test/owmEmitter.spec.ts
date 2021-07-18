import { describe, it} from 'mocha';
import { expect, should } from 'chai';
import {OwmEmitter, OwmEmitterOptions} from "../src/owmEmitter";
import {OneCallApiResponse} from "@curium.rocks/openweathermap-client";
import {IDataEvent} from "@curium.rocks/data-emitter-base";

const testId = 'test-id';
const testDesc = 'test-desc';
const testName = 'test-name';
const checkInterval = 1000;
const appId = process.env.OWM_API_KEY as string;
const lat = 57.21071966276383;
const lon = -114.88605492829488;

const owmOptions:OwmEmitterOptions = {
    id: testId,
    description: testDesc,
    name: testName,
    checkInterval: checkInterval,
    appId: appId,
    latitude: lat,
    longitude: lon
}

const sleep = (ms: number) => {
    return new Promise((resolve)=>{
        setTimeout(() => {
            resolve(true);
        }, ms)
    })
}

const validateDataEvt = (evt: IDataEvent) => {
    expect(evt).to.not.be.null;
    const resp = evt.data as OneCallApiResponse;
    expect(resp.lon).to.not.be.null;
    expect(resp.lat).to.not.be.null;
    expect(resp.current).to.not.be.null;
    expect(resp.current.dt).to.not.be.null;
}

describe( 'OwmEmitter', function() {
    // eslint-disable-next-line no-invalid-this
    this.timeout(7500);
    describe( 'onData()', function() {
        it( 'Should provide OneCallData from OWM', async function() {
            const emitter = new OwmEmitter(owmOptions);
            try {
                let emitCount = 0;
                const listener = emitter.onData((evt) => {
                    validateDataEvt(evt);
                    listener.dispose();
                    emitter.dispose();
                    emitter.stopPolling();
                    emitCount++;
                });
                emitter.startPolling();
                await sleep(2000);
                expect(emitCount).to.be.greaterThan(0);
            } finally {
                emitter.dispose();
            }
        });
        // TODO: improve this area, date time changes on the second, not a good
        // delta indicator
        it('Should only emit on change', async function() {
            let lastEvent:OneCallApiResponse;
            const emitter = new OwmEmitter(owmOptions);
            try {
                const listener = emitter.onData((evt) => {
                    validateDataEvt(evt);
                    const apiResp:OneCallApiResponse = evt.data as OneCallApiResponse;
                    if(lastEvent != null) {
                        expect(lastEvent.current.dt).to.not.be.eq(apiResp.current.dt);
                    } else {
                        should().fail();
                    }
                });
                emitter.startPolling();
                await sleep(3000);
            } finally {
                emitter.dispose();
            }
        });
    });
    describe('onState()', function() {
        it('Should notify of connection state change', async function() {
            // eslint-disable-next-line no-invalid-this
            this.timeout(15000);
            const emitter = new OwmEmitter({
                id: testId,
                name: testName,
                description: testDesc,
                checkInterval: checkInterval,
                appId: appId,
                latitude: lat,
                longitude: lon,
                dcThresholdMs: 3000
            });
            try {
                emitter.startPolling();
                await sleep(1500);
                const result = await emitter.probeStatus();
                expect(result.connected).to.be.true;
                let dcEvent = false;
                let eventCount = 0;
                emitter.onStatus((evt) => {
                    if(evt.connected == false) dcEvent = true;
                    eventCount++;
                })
                emitter.stopPolling();
                await sleep(10000);
                const newState = await emitter.probeStatus();
                expect(newState.connected).to.be.false;
                expect(dcEvent).to.be.true;
                expect(eventCount).to.be.eq(1);

            } finally {
                emitter.dispose();
            }        });
    });
    describe('setLatitude()', function(){
        it('should persist latitude', function(){
            const emitter = new OwmEmitter(owmOptions);
            try {
                emitter.setLatitude(25.00);
                expect(emitter.getLatitude()).to.be.eq(25.00);
            } finally {
                emitter.dispose();
            }
        })
    })
    describe('setLongitude()', function(){
        it('should persist longitude', function(){
            const emitter = new OwmEmitter(owmOptions);
            try {
                emitter.setLongitude(25.00);
                expect(emitter.getLongitude()).to.be.eq(25.00);
            } finally {
                emitter.dispose();
            }
        })
    })
    describe('sendCommand()', function() {
        it('Should allow stopping polling', async function() {
            const emitter = new OwmEmitter(owmOptions);
            try {
                let emitCount = 0;
                emitter.onData((evt) => {
                    emitCount++;
                })
                emitter.startPolling();
                await sleep(3000);
                expect(emitCount).to.be.greaterThan(0);
                emitter.stopPolling();
                emitCount = 0;
                await sleep(3000);
                emitter.dispose();
                expect(emitCount).to.be.eq(0);
            } finally {
                emitter.dispose();
            }
        });
        it('Should allow starting polling', async function() {
            const emitter = new OwmEmitter(owmOptions);
            try {
                let emitCount = 0;
                emitter.onData((evt) => {
                    emitCount++;
                })
                await sleep(3000);
                expect(emitCount).to.be.eq(0);
                emitter.startPolling();
                await sleep(3000);
                expect(emitCount).to.be.greaterThan(0);
            } finally {
                emitter.dispose();
            }
        });
    });
    describe('probeState()', function() {
        it('Should provide the current state', async function() {
            const emitter = new OwmEmitter(owmOptions);
            try {
                emitter.startPolling();
                await sleep(2000);
                const status = await emitter.probeStatus();
                expect(status.timestamp).to.not.be.null;
                expect(status.connected).to.be.true;
                expect(status.bit).to.be.false;
            } finally {
                emitter.dispose();
            }
        });
    });
    describe('probeCurrent()', function() {
        it('Should provide the latest cached data', async function() {
            const emitter = new OwmEmitter(owmOptions);
            try {
                emitter.startPolling();
                await sleep(2000);
                const data = await emitter.probeCurrentData();
                validateDataEvt(data);
            } finally {
                emitter.dispose();
            }
        });
    })    
});