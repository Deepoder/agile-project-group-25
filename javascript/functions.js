var findFoe = (Player) => {
    var randomAttack = Math.floor(Math.random()* (Player.characters[0].attack/3) + 1);
    var randomHealth = Math.floor(Math.random()* ((Player.characters[0].max_health) - Player.characters[0].attack) + Player.characters[0].attack);
    return {name: 'foe', hp: randomHealth, attack: randomAttack}
};

var fight = (player, foe) => {

    try{

        foe.hp = foe.hp - player.attack;

        if (foe.hp > 0) {
            player.current_health = player.current_health - foe.attack;
            if (player.current_health <= 0){
                player.current_health = 0;
                player.losses += 1;
            }
        }

        if (foe.hp <= 0) {
            foe.hp = 0;
            player.wins += 1
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