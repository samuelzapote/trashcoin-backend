const express = require('express');
const app = express();
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-config');
const rpclib = require('./rpclib');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
let db = admin.firestore();
let masterMetadataRef = db.collection('users').doc('metadata');

conn = rpclib.conn;


let observer = masterMetadataRef.onSnapshot(masterMetadataDoc => {
  // console.log(`Received doc snapshot: ${docSnapshot.data().addNode.ip}`);
  const masterMetadata = masterMetadataDoc.data();
  if(masterMetadata.addNode.active){
    let out = conn.addnode(masterMetadata.addNode.ip, "onetry");
    out.then((res) => console.log(res));

    let peers = conn.getpeerinfo();
    peers.then((res) => {
      console.log(res);
      res.forEach((x) => {
        if(x.addr == masterMetadata.addNode.ip || x.addrlocal == masterMetadata.addNode.ip) {
          console.log("Your node has been added to the Network");
          let newMasterMetadata = {
            addNode: {
              active : false,
              ip: null,
              repNode: null,
              uid: null
            },
            coinReq: masterMetadata.coinReq,
            nodeReg: masterMetadata.nodeReg
          };

          masterMetadataRef.set(newMasterMetadata);
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
