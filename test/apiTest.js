const request = require('supertest');
const assert = require('chai').assert;
const expect = require('chai').expect;
const mongoose = require('mongoose');
const database = require('../database/database.js');
const chai = require('chai'), chaiHttp = require('chai-http');
const conn = require('../database/index.js');

const app = require('../app');

chai.use(chaiHttp);

describe('POST /login', () => {
    before((done) => {
        conn.connect()
            .then(() => done())
            .catch((err) => done(err))
    })
    after((done)=> {
        conn.close()
            .then(()=> done())
            .catch((err) => done(err))
    })

    it("Valid Login", function(done){
        chai.request(app).post('/login').type('form')
            .send({
                "email": "account1@gmail.com",
                "password": "1234567890"
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    })

    it("Invalid Login", function(done){
        chai.request(app).post('/login').type('form')
            .send({
                "email": "account1@gmail2.com",
                "password": "1234567890"
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    })


})

describe('GET /account', function () {
    it("should return 200 status code on successful connection' ", function (done) {
        chai.request(app)
            .get('/')
            .end(function(err, res) {
                expect(res).to.have.status(200);
                done()
            })
    });
});

describe('GET /character', function () {
    it("should return 200 status code on successful connection' ", function (done) {
        chai.request(app)
            .get('/')
            .end(function(err, res) {
                expect(res).to.have.status(200);
                done()
            })
    });
});

describe('Invalid GET /failure', function () {
    it("should return 200 status code on successful connection' ", function (done) {
        chai.request(app)
            .get('/failure')
            .end(function(err, res) {
                expect(res).to.have.status(404);
                done()
            })
    });
});

describe('POST /insert', function(){
    before((done) => {
        conn.connect()
            .then(() => done())
            .catch((err) => done(err))
    })
    after((done)=> {
        conn.close()
            .then(()=> done())
            .catch((err) => done(err))
    })

    it("Invalid account creation", function(done){
        chai.request(app).post('/insert').type('form')
            .send({
                "first_name_entry":"fname",
                "last_name_entry":"lname",
                "email_entry":"test@test.com",
                "password_entry":1234567890,
                "repeat_password_entry":1234567890
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    })

    it("Valid account creation", function(done){
        chai.request(app).post('/insert').type('form')
            .send({
                "first_name_entry":"fname",
                "last_name_entry":"lname",
                "email_entry":"tit@test.com",
                "password_entry":1234567890,
                "repeat_password_entry":1234567890
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    })
});
