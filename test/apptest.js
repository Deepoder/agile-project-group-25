const assert = require('chai').assert;
const fight = require('../javascript/functions').fight;
const findFoe = require('../javascript/functions').findFoe;

describe('Fight', function(){
    it('fight should return an object', function(){
        let test_player = {'current_health': 10, 'attack': 5}
        let test_foe = {'hp': 10, 'attack': 5}
        let result = fight(test_player, test_foe);
        assert.typeOf(result, 'object')
    })
});

describe('findFoe', function(){
    it('findFoe should return a number', function () {
        let test_player = {'characters': [{'max_health': 10, 'current_health': 10, 'attack': 5}]};
        let result = findFoe(test_player);
        assert.typeOf(result.attack, 'number')
    })
});
