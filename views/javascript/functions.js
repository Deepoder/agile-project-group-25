// function hello() {
//     var x = document.getElementById("try").value;
//     console.log(x);
// }
//
// function myFunction() {
//     var testing = document.getElementById("myText").value;
//     document.getElementById("output").innerHTML = testing;
// }
//
// hello();
//
// myFunction();

// document.getElementById("myText").onclick = alert('Hello');

// const fs = require('fs');
//
// const path = './game_database.json';
//
// try {
//     if (fs.existSync(path)){
//         console.log('game_database.json is found');
//     } else {
//         throw 'File game_database.json is not found, creating new file...'
//     }
// } catch(err) {
//     console.log(err);
//     fs.writeFileSync('game_database.json', "{}")
// }