const komodo = require('npm-komodorpc-library');

const conn = new komodo.Connect(rpc_user='user2957205584',
rpc_password='passdf598a327594cb250bd80daa8e283e8e6851841929e40595fc20bc024932de1467',
rpc_ipaddress='http://127.0.0.1',
rpc_port='32648');

async function mainfunc(){
    let walletinfo = await conn.getwalletinfo() // await works in a async function
    console.log(walletinfo)
}

async function getnewaddress(){
    let address = await conn.getnewaddress() // await works in a async function
    console.log(address)
    // sendtoaddress(address,10)
}
async function sendtoaddress(address,coin){
    let out = await conn.sendtoaddress(address,coin) // await works in a async function
    console.log(out)
}

async function addnode(address){
    await conn.addnode(address,"onetry") // await works in a async function
    let out = await conn.getpeerinfo(false)
    console.log(out)
}

mainfunc()
//addnode("192.158.0.6:8233")
// getnewaddress()
