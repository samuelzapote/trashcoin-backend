const express = require('express');
var fs = require('fs'),
    request = require('request');
const app = express();
const admin = require('firebase-admin');
// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');
const vision = require('@google-cloud/vision');
const serviceAccount = require('./firebase-config');
const rpclib = require('./rpclib');
const MODE = 'MEMBER';
const userEnv = require('./user-env');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'common-app-fb.appspot.com'
});
let db = admin.firestore();

let masterMetadataRef = db.collection('users').doc('metadata');
let collectionRegistryRef = db.collection('users').doc('collectionReg');
              

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
    //
    if(masterMetadata.addNode.active ){


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
          }else{
            db.collection('users').doc(masterMetadata.addNode.uid).update({role:'Member'});
            let out = conn.addnode(masterMetadata.addNode.ip, "onetry");
            out.then((res) => console.log(res));
            masterMetadataRef.update({
              nodeReg: masterMetadata.nodeReg.push({
                ip: masterMetadata.addNode.ip,
                uid: masterMetadata.addNode.uid
              })
            })
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
        const tx = conn.sendtoaddress(request.hash,reward);
        tx.then((res)=>console.log(res));
          // Done
          db.collection('users').doc(request.uid).get().then((userDoc) => {
            const userMetadataRef = db.collection('metadatas').doc(userDoc.data().userMetadata + '');
            userMetadataRef.get().then((userMetadataDoc) => {
              let newRecycledReg = userMetadataDoc.data().recycledReg;
              newRecycledReg[request.material] += 1;
              userMetadataRef.update({
                recycledReg: newRecycledReg,
                recycled: true,
              }).then(() => {
                collectionRegistryRef.get().then((collectionRegDoc) => {
                  let newCollectionReg = collectionRegDoc.data();
                  newCollectionReg[request.material] += 1;
                  collectionRegistryRef.update(newCollectionReg);
                });
              });
            }).catch((res)=>console.log(res))
          })
      }
    }
  }
}, err => {
  console.log(`Encountered error: ${err}`);
});

async function quickstart(filePath, ownerUid) {
    // Creates a client
    const client = new vision.ImageAnnotatorClient();

    /**
     * TODO(developer): Uncomment the following line before running the sample.
     */
    const fileName = filePath;
    console.log(fileName);
    const request = {
        image: {content: fs.readFileSync(fileName)},
    };

    const [result] = await client.objectLocalization(request);
    const objects = result.localizedObjectAnnotations;
    objects.forEach(prediction => {
      console.log(`Name: ${prediction.name}`);
      console.log(`Confidence: ${prediction.score}`);
      const hashAddress = conn.getnewaddress();
      hashAddress.then((res) => {
        const newRecycle = {
          material: prediction.name,
          score: prediction.score,
          hash: res,
          uid: ownerUid
        };
        masterMetadataRef.update({
          coinReq: newRecycle
        });
      })
      // const vertices = object.boundingPoly.normalizedVertices;
      // vertices.forEach(v => console.log(`x: ${v.x}, y:${v.y}`));
    });
}

function downloadImage(imageUrl, ownerUid) {
  var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
      console.log('content-type:', res.headers['content-type']);
      console.log('content-length:', res.headers['content-length']);
  
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
  };
  
  let imageName = './images/' + imageUrl.slice(-8) + '.png';
  download(imageUrl, imageName, function(){
    quickstart(imageName, ownerUid);
  });
}


// User Logic
if (MODE == 'MEMBER') {
  const userRef = db.collection('users').doc(userEnv.uid);
  userRef.onSnapshot((userDoc) => {
    const userMetadataRef = db.collection('metadatas').doc(userDoc.data().userMetadata);
    userMetadataRef.onSnapshot(userMetadataDoc => {
      const userMetadata = userMetadataDoc.data();
      if (userMetadata.predictImage) {
        downloadImage(userMetadata.predictImage, userDoc.data().uid);

      }
      if (userMetadata.recycled) {
        // TODO: Request Wallet Info
        const walletRes=conn.getwalletinfo();
        walletRes.then((res)=>{
          userRef.update({
            coinAmount: res.balance + res.unconfirmed_balance
          }).then(() => {
            userMetadataRef.update({
              recycled: false
            });
          });
        })

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
