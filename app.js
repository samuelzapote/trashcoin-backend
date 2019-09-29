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
const rpclib = require('./rpclib');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

conn=rpclib.conn;

let doc = db.collection('users').doc('metadata');

//Logic for addind node to network
let observer = doc.onSnapshot(docSnapshot => {
  // console.log(`Received doc snapshot: ${docSnapshot.data().addNode.ip}`);
  if(docSnapshot.data().addNode.active){
    let out = conn.addnode(docSnapshot.data().addNode.ip,"onetry");
    out.then((res)=>console.log(res));
    let peers = conn.getpeerinfo();

      peers.then((res)=>{
      console.log(res);
      res.forEach((x)=>{
        if(x.addr==docSnapshot.data().addNode.ip||x.addrlocal==docSnapshot.data().addNode.ip){
          console.log("Your node added to Network");
          let data = {
              addNode: {
                active : false,
                ip:'',
                repNode:'',
                uid:null
              },
              coinReq:docSnapshot.data().coinReq,
              nodeReg:docSnapshot.data().nodeReg
            };

            let setDoc = db.collection('users').doc('metadata').set(data);
        }
      })
    })
  }
}, err => {
  console.log(`Encountered error: ${err}`);
});


//logic for walletinfo on user collection
// let wallet = db.collection('user').doc('metadata');
//
// // let observer = wallet.onSnapshot(docSnapshot => {},err=>{});
// let coininfo = wallet.onSnapshot(docSnapshot => {
//
// },err=>{});

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
