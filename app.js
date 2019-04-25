const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const axios = require('axios');
const _ = require('lodash');
const port = process.env.PORT || 8080;
const fs = require('fs');

var authentication = false;
var user = 'Characters';

const database = require('./javascript/database.js')

const user_db = require('./javascript/user_db.js');
const character_db = require('./javascript/character_db.js');
const fight = require('./javascript/fighting_saves');

var app = express();
hbs.registerPartials(__dirname + '/views/partials');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');

app.use(express.static(__dirname + '/views'));

app.get('/index', (request, response) => {
    var condition = false;
    if (authentication === true) {
        var condition = true;
    }
    response.render('index.hbs', {
        title_page: 'Official Front Page',
        header: 'Fight Simulator',
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

app.get('/login', (request, response) => {
    response.render('login.hbs', {
        title_page: 'Login Page',
        header: 'Fight Simulator',
        username: user
    })
});

app.get('/', (request, response) => {
    response.render('index.hbs', {
        title_page: 'Official Front Page',
        header: 'Fight Simulator',
        welcome: `Welcome ${user}`,
        username: user,
        condition: false
    })
});

app.post('/user_logging_in', async (request, response) => {

    var email_entry = request.body.email;
    var password_entry = request.body.password;

    // var output_entry = user_db.login_check(email, password);

    var db = database.getDb();
    var account = await db.collection('accounts').find({email: email_entry}).toArray()

    if (account.length == 1) {
        authentication = true;
        user = email_entry;
        response.redirect('/index')
    } else {
        response.redirect('/index')
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
    var output = ""
    var existing_account = await db.collection('accounts').find({email: request.body.email_entry}).toArray()
    if (existing_account.length == 1) {
        var output = "Account already exists with that email"
    } else {
        db.collection('accounts').insertOne({
            first_name: request.body.first_name_entry,
            last_name: request.body.last_name_entry,
            email: request.body.email_entry,
            password: request.body.password_entry
        })
        var output = "Account successfully created"
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
        response.redirect('/index')
    } else {
        var db = database.getDb()
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
            var health = account[0].characters[0].health;
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

app.get('/character_creation', async (request, response) => {
    if (authentication === false) {
        response.redirect('/index')
    } else {
        var db = database.getDb();
        var account = await db.collection('accounts').find({email: user}).toArray((error, item) => {
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

app.post('/character_creation', async (request, response) => {

    var db = database.getDb();
    var account = await db.collection('accounts').find({email:user}).toArray()

    if (account[0].characters === undefined || account[0].characters.length === 0){
        db.collection('accounts').updateOne({email: user}, {"$push":{
                "characters": {
                    character_name: request.body.character_name,
                    health: 10,
                    attack: 5,
                    wins: 0,
                    losses: 0
                }
            }
        })

        response.render('character_creation.hbs', {
            title_page: 'Character Creation',
            username: user,
            output: "Successfully Created A Character!"
        })

    } else {
        console.log("Not Implemented Yet")
    }
});


app.get('/account', (request, response) => {

    if (authentication === false) {
        response.redirect('/index');
    } else {
        database.getDb().collection('accounts').find({email: user}).toArray((err, item) => {
            if (err) {
                console.log(err);
            } else {
                try {
                    var win = item[0].characters[0].wins;
                    var loses = item[0].characters[0].losses;
                    var user = item[0].email;
                    response.render('account.hbs', {
                        win: win,
                        losses: loses,
                        email: user,
                        header: 'Account'
                    })
                } catch {
                    response.redirect("/account_error");
                }
            }
        });
    }
});

app.get('/account_error', (request, response) => {
    if (authentication === false) {
        response.redirect('/index');
    } else {
        response.render('account_error.hbs',{
            email: user,
            header: 'Account'
        })
    }
});

app.get('/fight', (request, response) => {
    var outcome = 'Win';

    if (authentication === false) {
        response.redirect('/index');
    } else {
        // console.log(response.body);
        var db = database.getDb();
        db.collection('accounts').find({email: user}).toArray( (err, item) => {
            if (err) {
                console.log(err)
            } else {
                try {
                    var name_player = item[0].characters[0].character_name;
                    var health_player = item[0].characters[0].health;
                    var dps_player = item[0].characters[0].attack;

                    var health_enemy = _.random(1, health_player + 5);
                    var dps_enemy = _.random(1, dps_player + 5);

                    fight.add_info(name_player, health_player, dps_player, health_enemy, dps_enemy);

                    arena_stats = fight.get_info();

                    response.render('fighting.hbs', {
                        title_page: `Let's fight!`,
                        header: 'Fight Fight Fight!',
                        username: user,
                        character_name: `${name_player}`,
                        enemy_name: `The Enemy`,
                        health_player: `Health: ${health_player}`,
                        dps_player: `DPS: ${dps_player}`,
                        health_enemy: `Health: ${arena_stats.enemy_health}`,
                        dps_enemy: `DPS: ${arena_stats.enemy_dps}`
                    })
                } catch (e) {
                    console.log(e)
                }
            }
        })
    }
});

app.get('/fight/update_stats', (request, response) => {
    if (authentication === false) {
        response.redirect('/index')
    } else {
        var arena_stats = fight.get_info(); //This is a dictionary

        var player_name = arena_stats.player_name;

        var player_health = arena_stats.player_health;
        var player_dps = arena_stats.player_dps;

        var enemy_health = arena_stats.enemy_health;
        var enemy_dps = arena_stats.enemy_dps;

        var new_player_health = player_health - enemy_dps;
        var new_enemy_health = enemy_health - player_dps;

        if (new_player_health > new_enemy_health && new_player_health > 0) {
            reply = 'You are winning!'
        } else if (new_enemy_health > new_player_health && new_player_health > 0) {
            reply = 'Enemy is winning'
        }

        fight.add_info(player_name, new_player_health, player_dps, new_enemy_health, enemy_dps);

        if (new_player_health <= 0 && new_enemy_health > 0) {
            var db = character_db.getDb();
            db.collection('accounts').find({email: user}).toArray((err, item) => {
                if (err) {
                    console.log(err)
                } else {
                    var lose = item[0].lose;
                    db.collection('accounts').updateOne({email: user}, {'$set': {'characters.0.losses': lose + 1}}, (err, item) => {
                        if (err) {
                            console.log(err)
                        } else {
                            response.render('win_lose_page.hbs', {
                                win_lose: `${lose}`
                            })
                        }
                    })
                }
            })
        } else if (new_enemy_health <= 0 && new_player_health > 0) {
            database.getDb().collection('accounts').find({email: user}).toArray((err, item) => {
                if (err) {
                    console.log(err)
                } else {
                    var win = item[0].characters[0].wins;
                    var health = item[0].characters[0].health;
                    var dps = item[0].characters[0].attack;
                    database.getDb().collection('accounts').updateOne({email: user}, {'$set': {'characters.0.health': health +10, 'characters.0.attack': dps + 5, 'characters.0.wins': win + 1}}, (err, item) => {
                        if (err) {
                            console.log(err)
                        } else {
                            var win = 'YOU WIN!';
                            response.render('win_lose_page.hbs', {
                                win_lose: `${win}`
                            })
                        }
                    })
                }
            })
        } else if (new_player_health <= 0 && new_enemy_health <= 0) {
            var tie = 'ITS A TIE';
            response.render('win_lose_page.hbs', {
                win_lose: `${tie}`
            })
        } else {
            response.render('fighting.hbs', {
                title_page: `Let's fight!`,
                header: 'Fight Fight Fight!',
                username: user,
                character_name: `${player_name}`,
                enemy_name: `The Enemy`,
                health_player: `Health: ${new_player_health}`,
                dps_player: `DPS: ${player_dps}`,
                health_enemy: `Health: ${new_enemy_health}`,
                dps_enemy: `DPS: ${enemy_dps}`,
                outcome: `${reply}`
            })
        }
    }

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
    db.collection('accounts').updateOne({email:user}, {$pop: {"characters": 1}})
    response.redirect("/character")
});

app.listen(port, () => {
    console.log(`Server is up on the port ${port}`);
    database.init();
});