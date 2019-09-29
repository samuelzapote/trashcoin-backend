var express = require('express');
var app = express();

// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
const admin = require('firebase-admin');
// var firebase = require("firebase/app");

// Add the Firebase products that you want to use
// require("firebase/database");

// firebase.initializeApp(firebaseConfig);

let serviceAccount = require('./firebase-config');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

let doc = db.collection('tests').doc('komodo-server-1');

let observer = doc.onSnapshot(docSnapshot => {
  console.log(`Received doc snapshot: ${docSnapshot.data().coinAmnt}`);
  
}, err => {
  console.log(`Encountered error: ${err}`);
});

// console.log(defaultProject.name);

// var userId = firebase.auth().currentUser.uid;
// firebase.database().ref('tests/komodo-server-1/').once('value').then(function(snapshot) {
//    console.log(snapshot);
// });

// var docRef = firebase.database().ref('tests/' + 'komodo-server-1');
// docRef.on('value', function(snapshot) {
//   console.log(snapshot.val());
// });


// app.get('/', function (req, res) {
//    res.send('Hello World');
// })
//
// var server = app.listen(8081, function () {
//    var host = server.address().address
//    var port = server.address().port
//
//    console.log("Example app listening at http://%s:%s", host, port)
// })
