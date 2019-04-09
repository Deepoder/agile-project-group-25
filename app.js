const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const axios = require('axios');
const _ = require('lodash');
const port = process.env.PORT || 8080;
const fs = require('fs');

var authentication = false;
var user = 'Characters';

const user_db = require('./javascript/user_db.js');
const character_db = require('./javascript/character_db.js');

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
    user = 'Characters';
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
        var db = character_db.getDb();
        db.collection('Character').find({email: user}).toArray((err, item) => {
            if (err) {
                console.log(err)
            } else {
                try {
                    var character_name = item[0].character_name;
                    var health = item[0].health;
                    var dps = item[0].dps;
                    var win = item[0].win;
                    var lose = item[0].lose;

                    response.render('character.hbs', {
                        title_page: 'My Character Page',
                        header: 'Character Stats',
                        username: user,
                        character_name: `${character_name}`,
                        character_health: `${health}`,
                        character_dps: `${dps}`
                    })
                } catch (e) {
                    response.render('character.hbs', {
                        title_page: 'My Character Page',
                        header: 'Character Stats',
                        username: user,
                        character_name: 'CREATE CHARACTER NOW',
                        character_health: 'CREATE CHARACTER NOW',
                        character_dps: 'CREATE CHARACTER NOW'
                    })
                }
            }
        });
    }
});

// const find = async (user) => {
//     try {
//         const db = character_db.getDb();
//         const collection = db.collection('Character');
//         const answer = await collection.findOne({email: user});
//         return answer
//     } catch (e) {
//         console.log(e)
//     }
// };
// console.log(find('95jvt71@gmail.com'));

app.get('/character_creation', (request, response) => {
    if (authentication === false) {
        response.redirect('/login')
    } else {
        var db = character_db.getDb();

        db.collection('Character').find({email: user}).toArray((err, items) => {
            if (err) {
                response.send(`alert('Cannot find it')`)
            } else {
                try {
                    if (items[0].email === user) {
                        output = "You already have a character ready for battle!";
                        response.render('character_creation.hbs', {
                            title_page: 'Character Creation',
                            header: 'Create Character',
                            username: user,
                            output_error: `${output}`
                        })
                    }
                } catch (e) {
                    output = "Create a character now!";
                    response.render('character_creation.hbs', {
                        title_page: 'Character Creation',
                        header: 'Create Character',
                        username: user,
                        output_error: `${output}`
                    })
                }
            }
        });
    }
});

app.post('/create_character', (request, response) => {
    var character_name = request.body.character_name;
    var db = character_db.getDb();

    db.collection('Character').find({email: user}).toArray( (err, item) => {
        if (err) {
            response.send('Unable to get all students')
        } else {
            try {
                if(item[0].email === user) {
                    response.redirect('/character_creation')
                }
            } catch (e) {
                db.collection('Character').insertOne({
                    character_name: character_name,
                    email: user,
                    health: 10,
                    dps: 6,
                    win: 0,
                    lose: 0
                }, (err, result) => {
                    if (err) {
                        response.send('Unable to insert stats');
                    }
                    // response.send(JSON.stringify(result.ops, undefined, 2));
                    response.redirect('/character')
                });
            }
        }
    });
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
    character_db.init();
});