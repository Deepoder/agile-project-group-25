const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const port = process.env.PORT || 8080;

var authentication = false;
var user = 'Characters';

const database = require('./javascript/database.js')
const functions = require('./javascript/functions.js')

var app = express();
hbs.registerPartials(__dirname + '/views/partials');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');

app.use(express.static(__dirname + '/views'));

app.get('/', (request, response) => {
    var condition = false;

    if (authentication === true) {
        condition = true;
    }

    response.render('index.hbs', {
        title_page: 'Official Front Page',
        header: "Fighting Simulator",
        welcome: `Welcome ${user}`,
        username: user,
        condition: condition
    })

});

app.get('/logout', (request, response) => {
    authentication = false;
    user = 'Characters';
    response.redirect('/');
});

app.get('/', (request, response) => {
    response.render('index.hbs', {
        title_page: 'Official Front Page',
        header: 'Fighting Simulator',
        welcome: `Welcome ${user}`,
        username: user,
        condition: false
    })
});

app.post('/login', async (request, response) => {

    var email_entry = request.body.email;
    var password_entry = request.body.password;

    var db = database.getDb();
    var account = await db.collection('accounts').find({email: email_entry}).toArray();

    if (account.length === 1 && account[0].password === password_entry) {
        authentication = true;
        user = email_entry;
        response.redirect('/')
    } else {
        response.render('index.hbs', {
            condition: false,
            header: 'Fighting Simulator',
            output: "Incorrect email or password"
        })
    }
});

app.get('/sign_up', (request, response) => {
    response.render('sign_up.hbs', {
        title_page: 'Sign Up Form',
        header: 'Registration Form',
        username: user
    })
});

app.post('/insert', async (request, response) => {
    var db = database.getDb();
    var existing_account = await db.collection('accounts').find({email: request.body.email_entry}).toArray();

    if (existing_account.length === 1) {
        var output = "Account already exists with that email"
    } else {
        db.collection('accounts').insertOne({
            first_name: request.body.first_name_entry,
            last_name: request.body.last_name_entry,
            email: request.body.email_entry,
            password: request.body.password_entry
        });
        output = "Account successfully created"
    }
    response.render('sign_up.hbs', {
        title_page: 'Sign Up Form',
        header: 'Registration Form',
        username: user,
        output_msg: `${output}`
    })
});

app.get('/character', async (request, response) => {
    if (authentication === false) {
        response.redirect('/')
    } else {
        var db = database.getDb();
        var account = await db.collection('accounts').find({email: user}).toArray()
        if (account[0].characters === undefined || account[0].characters.length === 0) {
            response.render('character.hbs', {
                title_page: 'My Character Page',
                header: 'Character Stats',
                username: user,
                character_name: 'CREATE CHARACTER NOW',
                character_health: 'CREATE CHARACTER NOW',
                character_dps: 'CREATE CHARACTER NOW'
            })
        } else {
            var character_name = account[0].characters[0].character_name;
            var health = account[0].characters[0].max_health;
            var dps = account[0].characters[0].attack;
            response.render('character.hbs', {
                title_page: 'My Character Page',
                header: 'Character Stats',
                username: user,
                character_name: `${character_name}`,
                character_health: `${health}`,
                character_dps: `${dps}`
            })
        }
    }
});

app.get('/character/creation', async (request, response) => {
    if (authentication === false) {
        response.redirect('/')
    } else {
        var db = database.getDb();
        db.collection('accounts').find({email: user}).toArray((error, item) => {
            try {
                if (item[0].characters === undefined || item[0].characters.length === 0) {
                    response.render('character_creation.hbs', {
                        title_page: 'Character Creation',
                        username: user,
                        output: "Create a new character!",
                        condition: true
                    })
                } else {
                    response.render('character_creation.hbs', {
                        title_page: 'Character Creation',
                        username: user,
                        output: "You already have an existing character",
                        condition: false
                    })
                }
            } catch (error) {
                console.log(error)
            }
        })
    }
});

app.post('/character/creation', async (request, response) => {

    var db = database.getDb();
    var account = await db.collection('accounts').find({email:user}).toArray();

    if (account[0].characters === undefined || account[0].characters.length === 0){
        db.collection('accounts').updateOne({email: user}, {"$push":{
                "characters": {
                    character_name: request.body.character_name,
                    current_health: 10,
                    max_health: 10,
                    attack: 5,
                    wins: 0,
                    losses: 0
                }
            }
        });

        response.render('character_creation.hbs', {
            title_page: 'Character Creation',
            username: user,
            output: "Successfully Created A Character!"
        })

    } else {
        console.log("Not Implemented Yet")
    }
});


app.get('/account', async (request, response) => {
    if (authentication === false){
        response.redirect('/')
    } else {
        var db = database.getDb();
        db.collection('accounts').find({email:user}).toArray((error, item) => {
            if (item[0].characters === undefined || item[0].characters.length === 0) {
                response.render('account.hbs', {
                    email: user,
                    header: 'Account',
                    condition: false
                })
            } else {
                response.render('account.hbs', {
                    wins: item[0].characters[0].wins,
                    losses: item[0].characters[0].losses,
                    header: 'Account',
                    email: user,
                    condition: true
                })
            }
        })
    }
});

app.get('/fight', async (request, response) => {
    var db = database.getDb();
    var account = await db.collection('accounts').find({email:user}).toArray();

    if (authentication === false) {
        response.redirect('/');
    } else {
        if (account[0].characters === undefined || account[0].characters.length === 0) {
            response.render('fighting.hbs', {
                title: 'Fight!',
                output: 'You do not have a character to fight with!',
                condition: false
            })
        } else {

            var foe = functions.findFoe(account[0]);
            var player = account[0].characters[0];

            response.render('fighting.hbs', {
                title: 'Fight!',
                character_name: `Character Name: ${player.character_name}`,
                character_health: `Current Health: ${player.current_health}`,
                character_attack: `Attack: ${player.attack}`,
                enemy_health: `Enemy Health: ${foe.hp}`,
                enemy_attack: `Enemy Attack: ${foe.attack}`,
                condition: true,
            })
        }
    }
});

app.post('/fight/results', (request, response) => {

});

app.post('/update', (request, response) => {
    var db = database.getDb();
    db.collection('accounts').update({email:user},{'$set': {"characters.0.character_name": request.body.new_name}});
    response.redirect('/character')
});

app.get('/update_name', (request, response) => {
    response.render('update_name.hbs', {
        title_page: "Update Name",
        header: "Update Character Name",
        username: user
    })
});

app.post('/delete', async (request, response) => {
    var db = database.getDb();
    db.collection('accounts').updateOne({email:user}, {$pop: {"characters": 1}});
    response.redirect("/character")
});

app.listen(port, () => {
    console.log(`Server is up on the port ${port}`);
    database.init();
});