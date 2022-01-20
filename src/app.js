//######################################################################
require('dotenv').config()
const express = require('express');
const { Server } = require('ws');
const PORT = process.env.PORT || 3000;
const INDEX = '../public/index.html';

const server = express()
  .use(express.static('./public'))
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });
wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('message', (data) =>{ exResquest(data.toString(), ws) });

    ws.on('close', () => console.log('Client disconnected'));
});


//######################################################################
const { initializeApp } = require('firebase/app');
const { getDatabase, set, get , ref , child , update, remove, push  } = require('firebase/database');
const { async } = require('@firebase/util');

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "chat-app-24f8d.firebaseapp.com",
  databaseURL: "https://chat-app-24f8d-default-rtdb.firebaseio.com",
  projectId: "chat-app-24f8d",
  storageBucket: "chat-app-24f8d.appspot.com",
  messagingSenderId: "706080583608",
  appId: "1:706080583608:web:eb08a9e8bc3e99a150e94d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbref = ref(db);

const formatMsgBeforeSendToCLient = (msg) =>  {
  let str =""
  msg.forEach((e) =>{
    str += ` ${e.msg_time}_${e.msg_sender}_${e.msg_content} /x/` 
  })
  console.log(str)
  return str;
} 

const sendRoomMessageToMember =  (chatroom, ws) =>{
  get(child(dbref, `${chatroom}/chatroom_msg`))
  .then((snapshot)=>{
    var box= []
    console.log(snapshot.val())
    snapshot.forEach((e) => {box.push(e.val())})
    ws.send(formatMsgBeforeSendToCLient(box));
  })

}



function pad(val) {
  var valString = val + "";
  if (valString.length < 2) {
    return "0" + valString;
  } else {
    return valString;
  }
}

function strDate(){
  var date = new Date
  return date.getFullYear() +":"+pad((date.getUTCMonth()+1))+":"+ pad(date.getDate()) + ":" + pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds());
}

const sendMsgToServer = (chatroom , user,  msg) =>{
  set(ref(db, `${chatroom}/chatroom_msg/${strDate()}`), {
    msg_content: msg,
    msg_sender: user,
    msg_time: strDate()
  })
}
// Xử lý request 
const getHeadFromRequest = req =>  req.substr(0,req.indexOf("_*")) 
const getUsernameFromRequest = req =>  req.slice(req.indexOf("_*") + 2,req.indexOf("*_")) 
const getContentFromRequest = req =>  req.slice(req.indexOf("*_") + 2) 
// 
var roomid =''
var username  = '' 

async function exResquest(req, ws) {
  let req_head = getHeadFromRequest(req);
  let req_username = getUsernameFromRequest(req);
  let req_content = getContentFromRequest(req);

  switch( req_head ) {
  case 'JOIN':
    roomid = req_content;
    username = req_username;
    sendRoomMessageToMember(req_content, ws);
    setInterval(() => {sendRoomMessageToMember(req_content, ws)}, 6000);
    break;
  case 'SEND':
    sendMsgToServer(roomid , username , req_content );
    sendRoomMessageToMember(roomid, ws)
    break;

  default:
    // code block
    console.log("ko ok");
  }
}

