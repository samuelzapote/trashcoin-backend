const komodo = require('npm-komodorpc-library');

const conn = new komodo.Connect(rpc_user='user568251219',
rpc_password='pass766db41922bac0bbe3c1909a41e3dfe0291e2c1b6c76f7172c3e9bdf46f64d16f9',
rpc_ipaddress='http://127.0.0.1',
rpc_port='12450');

async function mainfunc(){
    let walletinfo = await conn.getwalletinfo() // await works in a async function
    console.log(walletinfo)
}

mainfunc()