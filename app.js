const express = require('express');
const hbs = require('hbs');
const axios = require('axios');
const _ = require('lodash');
const port = process.env.PORT || 8080;

var app = express();
hbs.registerPartials(__dirname + '/views/partials');

app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');

app.get('/', (request, response) => {
    response.render('index.hbs', {
        title_page: 'Official Front Page',
        header: 'IT\'S TIME TO D-D-D-DUEL!'
    })
});

app.get('/home', (request, response) => {
    response.render('index.hbs', {
        title_page: 'Official Front Page',
        header: 'IT\'S TIME TO D-D-D-DUEL!'
    })
});

app.get('/login', (request, response) => {
    response.render('login.hbs', {
        title_page: 'Login Page',
        header: 'IT\'S TIME TO D-D-D-DUEL!'
    })
});

app.get('/about', (request, response) => {
    response.render('about.hbs', {
        title_page: 'About Page',
        header: 'IT\'S TIME TO D-D-D-DUEL!'
    })
});

app.get('/character', (request, response) => {
    response.render('character.hbs', {
        title_page: 'My Character Page',
        header: 'IT\'S TIME TO D-D-D-DUEL!'
    })
});


app.get('/account', (request, response) => {
    response.render('account.hbs', {
        title_page: 'My Account Page',
        header: 'IT\'S TIME TO D-D-D-DUEL!'
    })
});

app.listen(port, () => {
    console.log(`Server is up on the port ${port}`);
});