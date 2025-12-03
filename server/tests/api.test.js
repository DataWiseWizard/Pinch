const request = require('supertest');
const expect = require('chai').expect;

const API_URL = 'http://localhost:5000'; 

describe('Pinch API Smoke Tests', function() {
    it('should return 200 OK on root /', async function() {
        const response = await request(API_URL).get('/');
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('status', 'running');
    });

    it('should return a list of pins on GET /pins', async function() {
        const response = await request(API_URL).get('/pins');
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('pins');
        expect(response.body.pins).to.be.an('array');
    });

    it('should fail search if no query provided', async function() {
        const response = await request(API_URL).get('/pins/search');
        expect(response.status).to.equal(400); // Should fail
    });
});