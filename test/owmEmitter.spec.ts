import { describe, it} from 'mocha';
import { expect } from 'chai';

describe( 'OwmEmitter', function() {
    describe( 'onData()', function() {
        it( 'Should provide OneCallData from OWM', function() {
            expect(true).to.be.false;
        });
        it('Should only emit on change', function() {
            expect(true).to.be.false;
        });
    });
    describe('onState()', function() {
        it('Should notify of connection state change', function() {
            expect(true).to.be.false;
        });
    });
    describe('sendCommand()', function() {
        it('Should allow setting position', function() {
            expect(true).to.be.false;
        });
        it('Should allow stopping polling', function() {
            expect(true).to.be.false;
        });
        it('Should allow starting polling', function() {
            expect(true).to.be.false;
        });
    });
    describe('probeState()', function() {
        it('Should provide the current state', function() {
            expect(true).to.be.false;
        });
    });
    describe('probeCurrent()', function() {
        it('Should provide the latest cached data', function() {
            expect(true).to.be.false;
        });
    })    
});