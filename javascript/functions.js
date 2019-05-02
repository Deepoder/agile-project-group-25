const database = require('./database.js')

// var findFoe = (Player) => {
//     var randomAttack = Math.floor(Math.random()* (Player.characters[0].attack/3) + 1);
//     var randomHealth = Math.floor(Math.random()* ((Player.characters[0].max_health) - Player.characters[0].attack) + Player.characters[0].attack);
//     return {name: 'foe', hp: randomHealth, attack: randomAttack}
// };

var test_player = {
    'characters': [
        {
            character_name: "Test",
            max_health: 10,
            current_health: 10,
            attack: 5,
            level: 1,
        }
    ]
}

    var findFoe = (Player) => {
    var randomLevel = Math.floor(Math.random()* (Player.characters[0].level - 1) + 1);
    var randomAttack = Math.floor(Math.random()* (Player.characters[0].max_health/3) + 1);
    var randomHealth = Math.floor(Math.random()* ((Player.characters[0].max_health) - Player.characters[0].attack) + Player.characters[0].attack);
    var randomExp = Math.floor(Math.random()* (Player.characters[0].level + 3) + 1);
    var randomGold = Math.floor(Math.random() * (Player.characters[0].level + 10) + 5)
    return {
        name: 'foe',
        level: randomLevel,
        hp: randomHealth,
        attack: randomAttack,
        exp: randomExp,
        gold: randomGold
    }
};

console.log(findFoe(test_player))

var fight = (player, foe) => {

    try{
        foe.hp = foe.hp - player.attack;
        if (foe.hp > 0) {
            player.current_health = player.current_health - foe.attack;
            if (player.current_health <= 0){
                player.current_health = 0;
            }
        }
        if (foe.hp <= 0) {
            foe.hp = 0;
        }
        return {player, foe}
    }catch(error){
        console.log(error)
    }
};

module.exports = {
    findFoe,
    fight
}