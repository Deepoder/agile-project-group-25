const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const axios = require('axios');
const _ = require('lodash');
const port = process.env.PORT || 8080;
const fs = require('fs');

var authentication = false;
var user = 'guest';

const user_db = require('./javascript/user_db.js');

var app = express();
hbs.registerPartials(__dirname + '/views/partials');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');

app.get('/', (request, response) => {
    response.render('index.hbs', {
        title_page: 'Official Front Page',
        header: 'Fight Simulator',
        welcome: `Welcome ${user}`,
        username: user
    })
});

app.get('/logout', (request, response) => {
    authentication = false;
    response.redirect('/');
});

app.get('/login', (request, response) => {
    response.render('login.hbs', {
        title_page: 'Login Page',
        header: 'Fight Simulator',
        username: user
    })
});

app.post('/user_logging_in', (request, response) => {
    // console.log(request.body);
    var email = request.body.email;
    var password = request.body.password;

    // console.log(note.login_check(email, password));

    var output = user_db.login_check(email, password);

    if (output === 'Success!') {
        authentication = true;
        user = email;
        response.redirect('/')
        // response.render('account.hbs', {
        //     title_page: 'Account Page',
        //     header: 'Fight Simulator',
        //     output: `${output}`
        // })
    } else {
        response.render('login.hbs', {
            title_page: 'Account Page',
            header: 'Fight Simulator',
            username: user,
            output: `${output}`
        })
        // response.redirect('/')
    }
});

app.get('/sign_up', (request, response) => {
    response.render('sign_up.hbs', {
        title_page: 'Sign Up Form',
        header: 'Registration Form',
        username: user
    })
});

app.post('/insert', (request, response) => {
    //console log the data they sent you
    // console.log(request.body);

    var first_name = request.body.first_name;
    var last_name = request.body.last_name;
    var email = request.body.email;
    var password = request.body.password;
    var password_repeat = request.body.password_repeat;

    var output = user_db.add_new_user(first_name, last_name, email, password, password_repeat);

    // response.send(`${first_name1} ${last_name1} ${password1}`)

    response.render('sign_up.hbs', {
        title_page: 'Sign Up Form',
        header: 'Registration Form',
        username: user,
        output_error: `${output}`
    })

    // response.send(JSON.stringify(request.body));

    //send them data back (can be a file)
    // response.send(request.body);
});

app.get('/character', (request, response) => {

    if (authentication === false) {
        response.redirect('/login')
    } else {
        response.render('character.hbs', {
            title_page: 'My Character Page',
            header: 'IT\'S TIME TO D-D-D-DUEL!',
            username: user
        })
    }
});


app.get('/account', (request, response) => {

    if (authentication === false) {
        response.redirect('/login');
    } else {
        response.render('account.hbs', {
            title_page: 'My Account Page',
            header: 'IT\'S TIME TO D-D-D-DUEL!',
            username: user
        })
    }
});


app.listen(port, () => {
    console.log(`Server is up on the port ${port}`);
});