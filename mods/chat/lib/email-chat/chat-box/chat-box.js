const ChatBoxTemplate = require('./chat-box.template.js');
const ChatBoxMessageContainerTemplate = require('./chat-box-message-container.template.js');

const elParser = require('../../../../../lib/helpers/el_parser');

module.exports = ChatBox = {

    group: {***REMOVED***,

    render(app, data, group=null) {

        let active_group_name = "";
        if (group != null) {
          active_group_name = group.group_name;
    ***REMOVED***

        document.querySelector('.chat-manager').append(elParser(ChatBoxTemplate(active_group_name, group.group_id)));

        if (group != null) {
          group.messages.forEach(message => {
            let type = message.publickey == app.wallet.returnPublicKey() ? 'myself' : 'others';
            document.getElementById(`chat-box-main-${group.group_id***REMOVED***`).innerHTML += ChatBoxMessageContainerTemplate(message, '1239841203498', type);
      ***REMOVED***);
    ***REMOVED***

        this.scrollToBottom(group.group_id);
***REMOVED***,

    attachEvents(app, data, group) {
      let { group_id ***REMOVED*** = group;

      let msg_input = document.getElementById(`chat-box-new-message-input-${group_id***REMOVED***`);
      msg_input.addEventListener("keypress", (e) => {
          if ((e.which == 13 || e.keyCode == 13) && !e.shiftKey) {
              e.preventDefault();
              if (msg_input.value == '') { return; ***REMOVED***

              this.sendMessage(app, data, msg_input.value, group_id);
              this.scrollToBottom();

              msg_input.value = '';
      ***REMOVED***
  ***REMOVED***);

      let toggleBoxHeader = (e) => {
        let chat_box = document.getElementById(`chat-box-${group_id***REMOVED***`);
        chat_box.style.height = chat_box.style.height == '3em' ? '38em' : '3em';
  ***REMOVED***;

      let chat_box_header = document.getElementById(`chat-box-header-${group_id***REMOVED***`);

      chat_box_header.removeEventListener('click', toggleBoxHeader);
      chat_box_header.addEventListener('click', toggleBoxHeader);

      document.getElementById(`chat-box-close-${group_id***REMOVED***`)
              .addEventListener('click', (e) => {
                e.stopPropagation();

                let group_id = e.currentTarget.id;
                data.chat.active_groups = data.chat.active_groups.filter(group => group.group_id != group_id);

                let chat_manager = document.querySelector('.chat-manager');
                chat_manager.removeChild(e.path[2]);
          ***REMOVED***);

***REMOVED***,

    sendMessage(app, data, msg, group_id) {
      let msg_data = {
          message: msg,
          group_id: group_id,
          publickey: app.wallet.returnPublicKey(),
          timestamp: new Date().getTime()
  ***REMOVED***;

      let newtx = this.createMessage(app, data, msg_data);
      app.network.propagateTransaction(newtx);

      this.addMessageToDOM(msg_data, newtx.transaction.sig, "myself");
***REMOVED***,

    addMessageToDOM(data, sig, type) {
        let chat_box_main = document.getElementById(`chat-box-main-${data.group_id***REMOVED***`)
        if (!chat_box_main) { return; ***REMOVED***

        chat_box_main.innerHTML += ChatBoxMessageContainerTemplate(data, sig, type);
        this.scrollToBottom(data.group_id);
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

    scrollToBottom(group_id) {
        let chat_box_main = document.getElementById(`chat-box-main-${group_id***REMOVED***`);
        if (chat_box_main) {
          chat_box_main.scrollTop = chat_box_main.scrollHeight;
    ***REMOVED***
***REMOVED***
***REMOVED***

