var express = require('express');
var app = express();
var firebase = require("firebase/app");
require("firebase/auth");
require("firebase/firestore")



var firebaseConfig = {
   apiKey: "AIzaSyDsKMuZo_Wa5o5kpDSxIWYBgbBvXZJ9N7E",
   authDomain: "common-app-fb.firebaseapp.com",
   databaseURL: "https://common-app-fb.firebaseio.com",
   projectId: "common-app-fb",
   storageBucket: "common-app-fb.appspot.com",
   messagingSenderId: "589838531652",
   appId: "1:589838531652:web:5077812d470ec9ce069011"
 };
 var defaultProject = firebase.initializeApp(firebaseConfig);

 console.log(defaultProject.name);

// var userId = firebase.auth().currentUser.uid;
firebase.database().ref('tests/komodo-server-1/').once('value').then(function(snapshot) {
   console.log(snapshot);

 });

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
