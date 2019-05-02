const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const hbsHelpers = require('handlebars-helpers')
const port = process.env.PORT || 8080;

var authentication = false;
var user = 'Characters';

const database = require('./database/database.js');
const functions = require('./javascript/functions.js');

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
    response.render('index.hbs', {
        title_page: 'Official Front Page',
        header: "Fighting Simulator",
        welcome: `Welcome ${user}`,
        username: user,
        condition: authentication
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
        condition: false,
        active: {home: true}
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
        response.status(400);
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
                output: "You don't have a character! Create one now!",
                condition: false,
                active: {character: true}
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
                character_dps: `${dps}`,
                active: {character: true},
                condition: true
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
                        condition: true,
                        basename: 'characters'
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
                    losses: 0,
                    gold: 0,
                    level: 1
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
                    condition: false,
                    active: {account: true}
                })
            } else {
                response.render('account.hbs', {
                    wins: item[0].characters[0].wins,
                    losses: item[0].characters[0].losses,
                    header: 'Account',
                    email: user,
                    condition: true,
                    active: {account: true}
                })
            }
        })
    }
});

app.get('/fight', (request, response) => {
    if (authentication === false){
        response.redirect('/')
    } else {
        try {
            var db = database.getDb();
            db.collection('accounts').find({email:user}).toArray((error, item) => {
                if (item[0].characters === undefined || item[0].characters.length === 0) {
                    response.render('fighting.hbs', {
                        title: 'Fight!',
                        output: 'You do not have a character to fight with!',
                        condition: false,
                    })
                } else if (item[0].characters[0].current_battle === undefined ||
                    item[0].characters[0].current_battle.player.health <= 0 ||
                    item[0].characters[0].current_battle.foe.hp <= 0){
                    var foe = functions.findFoe(item[0]);
                    var player = {'character_name': item[0].characters[0].character_name,
                        'max_health': item[0].characters[0].max_health,
                        'current_health': item[0].characters[0].current_health,
                        'attack': item[0].characters[0].attack,
                        'level': item[0].characters[0].level
                    };

                    db.collection('accounts').findOneAndUpdate({email:user},
                        {$set: {'characters.0.current_battle': {player, foe}}},
                        {upsert:true, new:true})

                    db.collection('accounts').find({email:user}).toArray((error, item) => {
                        response.render('fighting.hbs', {
                            title: 'Fight!',
                            character_name: `Character Name: ${item[0].characters[0].current_battle.player.character_name}`,
                            character_health: `Current Health: ${item[0].characters[0].current_battle.player.current_health}`,
                            character_attack: `Attack: ${item[0].characters[0].current_battle.player.attack}`,
                            enemy_health: `Enemy Health: ${item[0].characters[0].current_battle.foe.hp}`,
                            enemy_attack: `Enemy Attack: ${item[0].characters[0].current_battle.foe.attack}`,
                            condition: true
                        })
                    })

                } else {
                    db.collection('accounts').find({email:user}).toArray((error, item) => {
                        response.render('fighting.hbs', {
                            title: 'Fight!',
                            character_name: `Character Name: ${item[0].characters[0].current_battle.player.character_name}`,
                            character_health: `Current Health: ${item[0].characters[0].current_battle.player.current_health}`,
                            character_attack: `Attack: ${item[0].characters[0].current_battle.player.attack}`,
                            enemy_health: `Enemy Health: ${item[0].characters[0].current_battle.foe.hp}`,
                            enemy_attack: `Enemy Attack: ${item[0].characters[0].current_battle.foe.attack}`,
                            condition: true
                        })
                    })
                }
            });
        } catch (error){
            console.log(error)
        }
    }
});

app.post('/fight', async (request, response) => {

    var db = database.getDb();
    var account = await db.collection('accounts').find({email: user}).toArray();
    var current_battle = account[0].characters[0].current_battle;
    var player = current_battle.player;
    var foe = current_battle.foe;

    var fight_result = functions.fight(player, foe)

    player = fight_result.player;
    foe = fight_result.foe;


    response.render('fighting.hbs', {
        title: 'Fight!',
        character_name: `Character Name: ${fight_result.player.character_name}`,
        character_health: `Current Health: ${fight_result.player.current_health}`,
        character_attack: `Attack: ${fight_result.player.attack}`,
        enemy_health: `Enemy Health: ${fight_result.foe.hp}`,
        enemy_attack: `Enemy Attack: ${fight_result.foe.attack}`,
        condition: true
    });

    db.collection('accounts').updateOne({email:user}, {$set: {'characters.0.current_battle': {player, foe}}})
    console.log(account[0].characters[0].current_battle)


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

module.exports = app;