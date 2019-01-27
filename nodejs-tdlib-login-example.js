/*
* TDLib (Telegram Database library) authentication example
* with Node.js by [tdl](https://github.com/Bannerets/tdl) pakage.
*
* by mortezaataiy
*
*/

const { Client } = require('tdl')
const { TDLib } = require('tdl-tdlib-ffi')
const {API_ID, API_HASH, BOT_TOKEN} = require('./config.js');

const myDebug = true; // if you want to see logs change this to true
const showSommeryLogs = true;
function myLog(msg,msg2){
  if(myDebug)
    console.log(msg,msg2);
}
function sommeryLogs(msg,msg2){
  if(showSommeryLogs)
    console.log(msg,msg2);
}
function myError(msg,msg2){
  if(myDebug)
    console.error(msg,msg2);
}
var auth1state = null;
// auth1state = 'waitPhoneNumber'
// auth1state = 'waitAuthCode'
// auth1state = 'waitAuthPass'

const API_BOT_AUTH = {
  type: 'bot',
  token: BOT_TOKEN,           // in document say write this line but
  getToken: () => BOT_TOKEN   // if this line dont set pakase get error and dont work
}

const tdlib = new TDLib()

// BotClient:
const BotClient = new Client(tdlib, {
  apiId: API_ID,
  apiHash: API_HASH,
  databaseDirectory: 'api_bot/_td_database',
  filesDirectory: 'api_bot/_td_files'
})
BotClient.connect()
BotClient.login(() => API_BOT_AUTH)
BotClient.on('error', e => myError('Bot error', e))
BotClient.on('update', u => {
  if(u['_'] == 'updateNewMessage'
                && u.message
                && u.message.content
                && u.message.content.text
                && u.message.content.text.text){
    var txt = u.message.content.text.text;
    sommeryLogs('recived from api bot:',txt)
    if(txt == '/start'){
      if(!UserClientstarted){
        startUserClient(u.message.chat_id);
        UserClientstarted = true;
        myLog('#######UserClientstart ')
      }
    }
    if(txt && txt.indexOf('/send')>=0){
      txt = txt.split(' c')[1];
      recivedAuthFromUser(txt)
    }
  }
  //else
  myLog('Bot update', u)
})
sommeryLogs('api bot started. send /start in bot')
function botSendMessage(text,user_id) {
  sommeryLogs('send with api bot:', text)
  BotClient.invoke({
          '_': "sendMessage",
          chat_id: user_id,
          disable_notification: false,
          from_background: true,
          input_message_content: {
            '_': "inputMessageText",
            text: {text: text},
            disable_web_page_preview: false,
            clear_draft: false
          }
        })
}

// UserClient:
var UserClientstarted = false;
var UserId = 0;
const UserClient = new Client(tdlib, {
  apiId: API_ID,
  apiHash: API_HASH,
  databaseDirectory: 'user/_td_database',
  filesDirectory: 'user/_td_files',
})
function startUserClient(user_id){ // user_id is user that start api bot
  sommeryLogs('UserClient start');
  UserClient.on('error', e => myError('UserClient error', e))
  UserClient.on('update', u => {
    if(u['_']=='updateAuthorizationState'){
      if(u.authorization_state['_'] == 'authorizationStateWaitPhoneNumber'){
        myLog('####### my authorizationStateWaitPhoneNumber');
        auth1state = "waitPhoneNumber";
        var txt = "plz send phone number like this:\n/send c+123456789012\n(char 'c' need!)";
        getAuthFromUser(auth1state, txt, user_id);
        return;
      }
      else if(u.authorization_state['_'] == 'authorizationStateWaitCode'){
        myLog('####### my authorizationStateWaitPhoneNumber');
        auth1state = "waitAuthCode";
        var txt = "plz send code like this:\n/send c12345\n(char 'c' need!)\n(if send code without a char with telegram the code has expired!)";
        getAuthFromUser(auth1state, txt, user_id);
        return;
      }
      else if(u.authorization_state['_'] == 'authorizationStateWaitPassword'){
        myLog('####### my authorizationStateWaitPhoneNumber');
        auth1state = "waitAuthPass";
        var txt = "plz send password like this:\n/send c12345\n(char 'c' need!)";
        getAuthFromUser(auth1state, txt, user_id);
        return;
      }
      else if(u.authorization_state['_'] == 'authorizationStateReady'){
        myLog('####### my authorizationStateReady %%%%%%%%%% :))))) ');
        auth1state = "Ready";
        var txt = "now you can send ping in private.";
        botSendMessage(auth1state + ", " + txt,user_id);
        var objTemp = {
          '_': 'getMe'
        };

        UserClientAsyncInvode(objTemp)
        .then(result => {
          myLog('####### my GetMe $ output:', result);
          UserId = result.id;
        })

        return;
      }
      else{
        myError('######UserClient updateAuthentication', u);
      }
      return;
    }
    else if(UserId
      && u['_'] == 'updateNewMessage'
      && u.message.chat_id == UserId
      && u.message.content
      && u.message.content.text){
      myLog("#####$$$$$$$$############",u.message.content.text)
      if(u.message.content.text.text){

      }
    }
    myError('UserClient update', u);
  })

  UserClient.connect()
  UserClient.login(() => ({ type: 'user' }))
}
function UserClientInvode(objTemp){
  myLog('#######invoke',objTemp)
  UserClient.invoke(objTemp)
}
function UserClientAsyncInvode(objTemp){
  return new Promise(function(res,rej){
    async function AsyncInvode(objTemp){
      myLog('#######invoke',objTemp)
      res(await UserClient.invoke(objTemp));
    }
    AsyncInvode(objTemp);
  })
}
function UserClientRecivedText(text,user_id){
  sommeryLogs('recived text with UserClient:', text)
  if(text.toUpperCase() == 'PING' && user_id == UserId)
    UserClientSendMessage('Pong',UserId);
}


function UserClientSendMessage(text,user_id){
  sommeryLogs('send with UserClient:', text)
  UserClient.invoke({
    _: 'sendMessage',
    chat_id: user_id,
    input_message_content: {
      _: 'inputMessageText',
      text: {
        _: 'formattedText',
        text: text
      }
    }
  })
}
// send what auth need from api bot to user
function getAuthFromUser(auth1state, txt, user_id){
    botSendMessage(auth1state + ", " + txt, user_id);
}
// proccess recived auth data from api bot
function recivedAuthFromUser(input){
    var type = '';
    var dataType = '';
    switch (auth1state) {
      case 'waitPhoneNumber':
        type = 'setAuthenticationPhoneNumber';
        dataType = 'phone_number';
        break;
      case 'waitAuthCode':
        type = 'checkAuthenticationCode';
        dataType = 'code';
        break;
      case 'waitAuthPass':
        type = 'checkAuthenticationPassword';
        dataType = 'password';
        break;
      default:

    }
    var objTemp = {
      "_": type
    };
    objTemp[dataType]= input;
    UserClientInvode(objTemp);

}
