const express = require('express');
const app = express();
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-config');
const rpclib = require('./rpclib');
const MODE = 'MEMBER';
const userEnv = require('./user-env');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
let db = admin.firestore();
let masterMetadataRef = db.collection('users').doc('metadata');

conn = rpclib.conn;

// Supplier Logic
let observer = masterMetadataRef.onSnapshot(masterMetadataDoc => {
  // console.log(`Received doc snapshot: ${docSnapshot.data().addNode.ip}`);
  const masterMetadata = masterMetadataDoc.data();
  // In case of an active node addition, communicate with komodo to attempt the registry.
  if (MODE == 'ADMIN') {
    const recycleDictionary = {
      paper: 2.5,
      bottle: 1.0,
      can: 2.0,
      plastic: 1.5,
      metal: 2.0,
      other: 0
    }
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
    if (masterMetadata.reqCoins) {
      let request = masterMetadata.reqCoins;
      let reward = 0;
      if (recycleDictionary.hasOwnProperty(request.material)) {
        reward = recycleDictionary[request.material];
      } else {
        reward = recycleDictionary.other;
      }
      if (reward > 0) {
        // TODO: Komodo send determined amount to hash address
          // Done
          db.collection('users').doc(request.uid).get().then((userDoc) => {
            const userMetadataRef = db.collection('metadatas').doc(userDoc.data().userMetadata + '');
            userMetadataRef.get().then((userMetadataDoc) => {
              let newRecycledReg = userMetadataDoc.data().recycledReg;
              newRecycledReg[request.material] += 1;
              userMetadataRef.update({
                recycledReg: newRecycledReg,
                recycled: true,
              });
            })
          })
      }
    }
  }
}, err => {
  console.log(`Encountered error: ${err}`);
});

// User Logic
if (MODE == 'MEMBER') {
  const userRef = db.collection('users').doc(userEnv.uid);
  userRef.get().then((userDoc) => {
    const userMetadataRef = db.collection('metadatas').doc(userDoc.data().userMetadata);
    userMetadataRef.onSnapshot(userMetadataDoc => {
      const userMetadata = userMetadataDoc.data();
      if (userMetadata.recycled) {
        // TODO: Request Wallet Info
        const walletRes;

        userRef.update({
          coinAmount: walletRes
        }).then(() => {
          userMetadataRef.update({
            recycled: false
          });
        });
      }
    }, err => {});
  })


}  

// console.log(defaultProject.name);

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
