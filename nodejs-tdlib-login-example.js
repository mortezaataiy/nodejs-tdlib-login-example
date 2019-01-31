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

const myDebug = false; // if you want to see logs change this to true
const showSommeryLogs = true;
function myLog(msg,msg2){
  if(myDebug){
    console.log('-----------------');
    console.log(msg,msg2);
  }
}
function sommeryLogs(msg,msg2){
  if(showSommeryLogs){
    console.log('-----------------');
    console.log(msg,msg2);
  }
}
function myError(msg,msg2){
  if(myDebug){
    console.log('=================');
    console.error(msg,msg2);
  }
}
var authState = {};
// authState[user_id] = 'waitPhoneNumber'
// authState[user_id] = 'waitAuthCode'
// authState[user_id] = 'waitAuthPass'

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
var BotId;
BotClient.connect()
BotClient.login(() => API_BOT_AUTH)
BotClient.on('error', e => myError('Bot error', e))
BotClient.on('update', u => {
  if(u['_'] == 'updateNewMessage'
                && u.message
                && u.message.sender_user_id != BotId
                && u.message.content
                && u.message.content.text
                && u.message.content.text.text){
    var txt = u.message.content.text.text;
    var user_id = u.message.sender_user_id;
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
      recivedAuthFromUser(txt, user_id);
    }
  }
  else if(u['_'] == 'updateOption'
                && u.name == 'my_id'
                && u.value
                && u.value['_'] == 'optionValueInteger'
                && u.value.value){
    BotId = u.value.value;
    myLog('BotId', BotId);
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
        .then(o => {
          myLog('From then:', o);
        })
        .catch(e => myError(e));
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
        myLog('####### my waitPhoneNumber', user_id);
        authState[user_id] = "waitPhoneNumber";
        var txt = "plz send phone number like this:\n/send c+123456789012\n(char 'c' need!)";
        getAuthFromUser(authState[user_id], txt, user_id);
        return;
      }
      else if(u.authorization_state['_'] == 'authorizationStateWaitCode'){
        myLog('####### my waitAuthCode', user_id);
        authState[user_id] = "waitAuthCode";
        var txt = "plz send code like this:\n/send c12345\n(char 'c' need!)\n(if send code without a char with telegram the code has expired!)";
        getAuthFromUser(authState[user_id], txt, user_id);
        return;
      }
      else if(u.authorization_state['_'] == 'authorizationStateWaitPassword'){
        myLog('####### my waitAuthPass', user_id);
        authState[user_id] = "waitAuthPass";
        var txt = "plz send password like this:\n/send c12345\n(char 'c' need!)";
        getAuthFromUser(authState[user_id], txt, user_id);
        return;
      }
      else if(u.authorization_state['_'] == 'authorizationStateReady'){
        myLog('####### my authorizationStateReady %%%%%%%%%% :))))) ');
        authState[user_id] = "Ready";
        var txt = "now you can send ping in private.";
        botSendMessage(authState[user_id] + ", " + txt,user_id);
        var objTemp = {
          '_': 'getMe'
        };

        UserClientAsyncInvode(objTemp)
        .then(result => {
          myLog('####### my GetMe $ output:', result);
          UserId = result.id;
        })
        .catch(e => myError);

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
      if(u.message.content.text.text){
        UserClientRecivedText(u.message.content.text.text,u.message.chat_id);
      }
    }
    myError('UserClient update', u);
  })

  UserClient.connect()
  UserClient.login(() => ({ type: 'user' }))
}
function UserClientInvode(objTemp, user_id_debug){
  myLog('#######invoke',objTemp)
  UserClient.invoke(objTemp)
  .then(o => {
    myLog('From then:', o);
  })
  .catch(e => {
    if(e.message){
      botSendMessage(e.message, user_id_debug);
    }
    myError(e)
  });
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
  sommeryLogs('recived text from UserClient:', text)
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
  .then(o => {
    myLog('From then:', o);
  })
  .catch(e => {
    if(e.message){
      botSendMessage(e.message, user_id);
    }
    myError(e)
  });
}
// send what auth need from api bot to user
function getAuthFromUser(thisAuthState, txt, user_id){
    botSendMessage(thisAuthState + ", " + txt, user_id);
}
// proccess recived auth data from api bot
function recivedAuthFromUser(input,user_id){
    var type = '';
    var dataType = '';
    switch (authState[user_id]) {
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
    }
    if(type && input && dataType){
      var objTemp = {
        "_": type
      };
      objTemp[dataType]= input;
      UserClientInvode(objTemp, user_id);
    }
    else{
      myError('type or input or dataType is empty, type:', type);
      myError('input', input);
      myError('dataType', dataType);
      myError('user_id', user_id);
    }
}
