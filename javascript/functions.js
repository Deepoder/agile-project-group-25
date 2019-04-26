var findFoe = (Player) => {
    var randomAttack = Math.floor(Math.random()* (Player.characters[0].attack/3) + 1);
    var randomHealth = Math.floor(Math.random()* ((Player.characters[0].health) - Player.characters[0].attack) + Player.characters[0].attack);
    var foe = {name: 'foe', hp: randomHealth, attack:randomAttack};
    return foe
};

module.exports = {
    findFoe,
}