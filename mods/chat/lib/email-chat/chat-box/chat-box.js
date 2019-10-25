const ChatBoxTemplate = require('./chat-box.template.js');
const ChatBoxMessageContainerTemplate = require('./chat-box-message-container.template.js');


module.exports = ChatBox = {

    render(app, data) {
        document.querySelector('.chat-box').innerHTML = ChatBoxTemplate(data.chat.active.group_name);

        data.chat.active.messages.forEach(message => {
            let type = message.publickey == app.wallet.returnPublicKey() ? 'myself' : 'others';
            document.querySelector('.chat-box-main').innerHTML += ChatBoxMessageContainerTemplate(message, '1239841203498', type);
    ***REMOVED***);

        this.scrollToBottom();
***REMOVED***,

    attachEvents(app, data) {
      let msg_input = document.querySelector(".chat-box-new-message-input");
      msg_input.addEventListener("keypress", (e) => {
          if ((e.which == 13 || e.keyCode == 13) && !e.shiftKey) {
              e.preventDefault();
              if (msg_input.value == '') {return;***REMOVED***
              this.sendMessage(app, data, msg_input.value);
              this.scrollToBottom();
              msg_input.value = '';
      ***REMOVED***
  ***REMOVED***);

      document.querySelector('.chat-box-header')
              .addEventListener('click', (e) => {
                let chat_box = document.querySelector('.chat-box')
                chat_box.style.height = chat_box.style.height == '3em' ? '38em' : '3em';
          ***REMOVED***);

***REMOVED***,

    sendMessage(app, data, msg) {
      let msg_data = {
          message: msg,
          group_id: data.chat.active.group_id,
          publickey: app.wallet.returnPublicKey(),
          timestamp: new Date().getTime()
  ***REMOVED***;

      let newtx = this.createMessage(app, data, msg_data);
      app.network.propagateTransaction(newtx);

      this.addMessageToDOM(msg_data, newtx.transaction.sig, "myself");
***REMOVED***,

    addMessageToDOM(data, sig, type) {
        document.querySelector(".chat-box-main").innerHTML += ChatBoxMessageContainerTemplate(data, sig, type);
        this.scrollToBottom();
***REMOVED***,

    createMessage(app, data, msg_data) {
        let publickey = app.network.peers[0].peer.publickey;
        let newtx = app.wallet.createUnsignedTransactionWithDefaultFee(publickey);
        if (newtx == null) { return; ***REMOVED***

        newtx.transaction.msg = {
            module: "Chat",
            request: "chat message",
            publickey: msg_data.publickey,
            group_id: msg_data.group_id,
            message:  msg_data.message,
    ***REMOVED***
    ***REMOVED*** will possibly encrypt
    ***REMOVED*** this.saito.keys.encryptMessage(this.saito.wallet.returnPublicKey(), msg),
    ***REMOVED***
            timestamp: msg_data.timestamp,
    ***REMOVED***;

***REMOVED*** newtx.transaction.msg = this.app.keys.encryptMessage(this.app.wallet.returnPublicKey(), newtx.transaction.msg);
        newtx.transaction.msg.sig = app.wallet.signMessage(JSON.stringify(newtx.transaction.msg));
        newtx = app.wallet.signTransaction(newtx);
        return newtx;
***REMOVED***,

    scrollToBottom() {
        let chat_box_main = document.querySelector(".chat-box-main")
        chat_box_main.scrollTop = chat_box_main.scrollHeight;
***REMOVED***
***REMOVED***

