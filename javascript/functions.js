var findFoe = (Player) => {
    var randomAttack = Math.floor(Math.random()* (Player[0].characters[0].attack/3) + 1);
    var randomHealth = Math.floor(Math.random()* ((Player[0].characters[0].health) - Player[0].characters[0].attack) + Player[0].characters[0].attack);
    var randomExp = Math.floor(Math.random()* (((Player[0].characters[0].health + 2) -10) + 10));
    var foe = {name: 'foe', level: randomLevel, hp: {max:randomHealth, current:randomHealth}, attack:randomAttack, exp:randomExp, status:'alive', match:Player.name};
    return foe
};

module.exports = {
    findFoe,
}