const chai = require('chai');
const assert = chai.assert;

const server = require('../server');

const chaiHttp = require('chai-http');
chai.use(chaiHttp);

suite('Functional Tests', function () {
  this.timeout(5000);
  suite('Integration tests with chai-http', function () {
    // #19 - Run Functional Tests on API Endpoints using Chai-HTTP
    test('Test GET /hello with no name', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get('/hello')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'hello Guest');
          done();
        });
    });
    // #20 - Run Functional Tests on API Endpoints using Chai-HTTP II
    test('Test GET /hello with your name', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get('/hello?name=Dave')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'hello Dave');
          done();
        });
    });
    // #21 - Run Functional Tests on an API Response using Chai-HTTP III - PUT method
    test('Send {surname: "Colombo"}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put('/travellers')
        .send({ surname: "Colombo" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.name, 'Cristoforo');
          assert.equal(res.body.surname, 'Colombo');
          done();
        });
    });
    // #22 - Run Functional Tests on an API Response using Chai-HTTP IV - PUT method
    test('Send {surname: "da Verrazzano"}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put('/travellers')
        .send({ "surname": "da Verrazzano" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.name, 'Giovanni');
          assert.equal(res.body.surname, 'da Verrazzano');
        });
        done();
    });
  });
});

const Browser = require('zombie');
Browser.site = 'https://boilerplate-mochachai.david-ff1.repl.co/'
const browser = new Browser();

suite('Functional Tests with Zombie.js', function () {
  this.timeout(5000);

  suiteSetup(function(done) {
    return browser.visit('/', done);
  });

  suite('Headless browser', function () {
    // #23 - Simulate Actions Using a Headless Browser
    test('should have a working "site" property', function() {
      assert.isNotNull(browser.site);
    });
  });

  suite('"Famous Italian Explorers" form', function () {
    // #24 - Run Functional Tests Using a Headless Browser
    test('Submit the surname "Colombo" in the HTML form', function (done) {
      browser.fill('surname', 'Colombo').then(() => {
        browser.pressButton('submit', () => {
        browser.assert.success();
        browser.assert.text('span#name', 'Cristoforo');
        browser.assert.text('span#surname', 'Colombo');
        browser.assert.elements('span#dates', 1);
        done();
        });
      });
    });
    // #25 - Run Functional Tests Using a Headless Browser II
    test('Submit the surname "Vespucci" in the HTML form', function (done) {
      browser.fill('surname', 'Vespucci').then(() => {
        browser.pressButton('submit', () => {
        browser.assert.success();
        browser.assert.text('span#name', 'Amerigo');
        browser.assert.text('span#surname', 'Vespucci');
        browser.assert.elements('span#dates', 1);
        done();
        });
      });
    });
  });
});
