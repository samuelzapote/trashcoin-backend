const komodo = require('npm-komodorpc-library');

const conn = new komodo.Connect(rpc_user='user3661840881',
rpc_password='passd961a6e2cac6e8078bc079ce5c22601dad8bb045e37dbfc50c8e36bd06361fab4a',
rpc_ipaddress='http://127.0.0.1',
rpc_port='15184');

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

module.exports = {
  conn:conn
}


//addnode("192.158.0.6:8233")
// getnewaddress()
