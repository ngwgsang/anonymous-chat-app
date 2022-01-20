const redirect = (page) =>{
    document.querySelector('.indexpage').style.display = "none";
    document.querySelector('.app').style.display = "none";
    document.querySelector(page).style.display = "flex"
}
redirect('.indexpage')

// document.querySelector('.btn--join').addEventListener('click', (e) => redirect('.app'))
//###########################################################################


var HOST = location.origin.replace(/^http/, 'ws')
var ws = new WebSocket(HOST);
var username = 'anonymous';
var roomid = 'TESTROOM';

function scrollToBottom () {
    var div = document.querySelector('.app__main__screen');
    div.scrollTop = div.scrollHeight - div.clientHeight;
}
let flag = 0
ws.addEventListener("open", ()=>{

    document.querySelector('.btn--join').addEventListener('click', (e) => {
        if (document.querySelector('#nickname').value != '') username = document.querySelector('#nickname').value 
        if (document.querySelector('#roomid').value != '') roomid = document.querySelector('#roomid').value
        document.querySelector('.app__sidebar__number span').innerText = roomid
        ws.send(`JOIN_*${username}*_${roomid}`);
        redirect('.app') 
    });
    document.querySelector('.btn--send').addEventListener('click', (e) => {
        let msg = document.querySelector('#msgbar').value
        ws.send(`SEND_*${username}*_${msg}`);
        flag = 1;
    });
    document.querySelector('#msgbar').addEventListener('keypress', (e) => {
        if (e.key === 'Enter'){
            let msg = document.querySelector('#msgbar').value
            ws.send(`SEND_*${username}*_${msg}`);
        flag = 1;
        }
    });
    
    ws.addEventListener("message", (data) =>{
        
        // Toastify({
        //     text: data.data,
        //     className: "info",
        //     style: {
        //       background: "linear-gradient(to right, #00b09b, #96c93d)",
        //     }
        //   }).showToast();
        
          renderDataToMsg(data.data);
          if (flag == 1) {
              scrollToBottom();
              flag = 0;
          }
    })
});


//###########################################################################
function renderDataToMsg(data){
    let str = '' + data
    let box = [];
    // cắt chuỗi
    while(str.length > 0 ){
        box.push( str.substr(0, str.search('/x/')) );
        str = str.slice(str.search('/x/')+ 3);
    }
    // chuỗi -> obj 
    let allmsg = []
    box.forEach((e) =>{
        let time = e.substr(0, e.search('_'))
        e = e.slice(e.search('_') + 1)
        let sender =  e.substr(0, e.search('_'))
        e = e.slice(e.search('_') + 1)
        let content = " " + e

        allmsg.push({
            msg_content: content,
            msg_time: time,
            msg_sender: sender,
        })
    })

    let member = []
    // render ra screen 
    document.querySelector('.app__main__screen').innerHTML = "";
    document.querySelector('.app__sidebar__memberlist').innerHTML ="";
    allmsg.forEach((e) =>{
        member.push(e.msg_sender)
        if (e.msg_sender == username){
            document.querySelector('.app__main__screen').innerHTML += `
                <li class="message mine"> 
                    <span class="message__content">${e.msg_content}</span>
                    <span class="message__info">Gửi bới ${e.msg_sender} lúc ${e.msg_time}</span>
                </li>
            `
        }
        else {
            document.querySelector('.app__main__screen').innerHTML += `
            <li class="message other"> 
                <span class="message__content">${e.msg_content}</span>
                <span class="message__info">Gửi bới ${e.msg_sender} lúc ${e.msg_time}</span>
            </li>
        `
        }
    })
    Array.prototype.unique = function() {
        return Array.from(new Set(this));
    }
    console.log(member.unique());
    member.unique().forEach((e) =>{
        document.querySelector('.app__sidebar__memberlist').innerHTML += `
        <li class="member">
            <span class="member--name">${e}</span> 
        </li>
        `
    })
}