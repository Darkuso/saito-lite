const Header = require('../../../../../lib/ui/header/header');

const ChatRoomTemplate = require('./chat-room.template');
const ChatRoomHeaderTemplate = require('./chat-room-header.template');
const ChatRoomFooterTemplate = require('./chat-room-footer.template');
const ChatRoomMessageTemplate = require('./chat-room-message.template');

const ChatMessageContainerTemplate = require('./chat-message-container.template');

module.exports = ChatRoom = {
    group: {***REMOVED***,
    render(app, data) {
        let main = document.querySelector('.main');
        main.innerHTML = ChatRoomTemplate();

        this.group = data.chat.groups.filter(group => data.chat.active_group_id === `chat-row-${group.group_id***REMOVED***`);

        this.group[0].messages.forEach(room_message => {
            let { author, timestamp ***REMOVED*** = room_message;
            let type = app.wallet.returnPublicKey() == author ? 'myself' : 'others';
            document.querySelector('.chat-room-content').innerHTML
                += ChatMessageContainerTemplate(room_message, timestamp, type);
    ***REMOVED***)

***REMOVED*** let header = document.querySelector('.header');
***REMOVED*** header.classList.remove("header-home");
***REMOVED*** header.classList.add("chat-room-header");
***REMOVED*** header.innerHTML = ChatRoomHeaderTemplate(this.group[0].name);
        document.querySelector('.chat-room-header').innerHTML = ChatRoomHeaderTemplate(this.group[0].group_name);

***REMOVED*** let footer = document.querySelector('.footer');
***REMOVED*** footer.classList.remove("nav-bar");
***REMOVED*** footer.classList.add("chat-room-footer");
***REMOVED*** footer.innerHTML = ChatRoomFooterTemplate();
***REMOVED*** footer.style.display = 'flex';
        document.querySelector('.chat-room-footer').innerHTML = ChatRoomFooterTemplate();

        this.attachEvents(app, data);
***REMOVED***,

    attachEvents(app, data) {
        let fired = false;

        console.log("NEW GROUP: ", this.group);

        let renderDefaultHeaderAndFooter = (app) => {
    ***REMOVED*** header
            let header = document.querySelector('.header');
            header.classList.remove("chat-room-header");
            Header.render(app);

    ***REMOVED*** footer
            let footer = document.querySelector('.footer');
            footer.classList.remove("chat-room-footer");
            footer.innerHTML = '';
            footer.style.display = 'none';
    ***REMOVED*** NavBar.render(chat.app);
    ***REMOVED***

        let submitMessage = () => {
            let message_input = document.querySelector('#input.chat-room-input');
            let msg = message_input.value;
            if (msg == '') { return; ***REMOVED***

            message_input.value = '';

            let newtx = this.createMessage(app, this.group[0].group_id, msg);
            this.sendMessageOnChain(app, newtx);

            console.log(this.group);

    ***REMOVED*** add message to group
    ***REMOVED*** this.group.addMessage(newtx);

            this.addTXToDOM(newtx);
            this.scrollToBottom();
    ***REMOVED***

        document.querySelector('#back-button')
                .addEventListener('click', () => {
                    data.chat.active = "chat_list";
            ***REMOVED*** renderDefaultHeaderAndFooter(chat);
                    data.chat.main.render(app, data);
            ***REMOVED***);

        document.querySelector('.chat-room-submit-button')
                .addEventListener('click', () => {
                    submitMessage();
            ***REMOVED***);

        document.addEventListener('keydown', (e) => {
            if (e.keyCode == '13') {
                if (!fired) {
                    fired = true;
                    e.preventDefault();
                    submitMessage();

                    console.log("event fired");
            ***REMOVED***
        ***REMOVED***
    ***REMOVED***);

        document.addEventListener('keyup', (e) => {
            if (e.keyCode == '13') { fired = false; ***REMOVED***
    ***REMOVED***);

        app.connection.on('chat_receive_message', (data) => {
            this.addMessageToDOM(data);
            this.scrollToBottom();
    ***REMOVED***);
***REMOVED***,

    createMessage(app, group_id, msg) {
        let publickey = app.network.peers[0].peer.publickey;
        let newtx = app.wallet.createUnsignedTransaction(publickey, 0.0, 0.0);
        if (newtx == null) { return; ***REMOVED***

        newtx.transaction.msg = {
            module: "Chat",
            request: "chat message",
            publickey: app.wallet.returnPublicKey(),
            group_id: group_id,
            message:  msg,
    ***REMOVED***this.app.keys.encryptMessage(this.app.wallet.returnPublicKey(), msg),
            timestamp: new Date().getTime(),
    ***REMOVED***;

***REMOVED*** newtx.transaction.msg = this.app.keys.encryptMessage(this.app.wallet.returnPublicKey(), newtx.transaction.msg);
        newtx.transaction.msg.sig = app.wallet.signMessage(JSON.stringify(newtx.transaction.msg));
        newtx = app.wallet.signTransaction(newtx);
        return newtx;
***REMOVED***,

    sendMessage(app, tx, callback=null) {
        app.network.sendTransactionToPeers(tx, "chat send message", callback);
***REMOVED***,

    sendMessageOnChain(app, tx, callback=null) {
        app.network.propagateTransaction(tx);
***REMOVED***,

    addTXToDOM(tx) {
        document.querySelector('.chat-room-content')
                .innerHTML += ChatMessageContainerTemplate(tx.returnMessage(), tx.transaction.msg.sig, 'myself');
***REMOVED***,

    addMessageToDOM(msg) {
        document.querySelector('.chat-room-content')
                .innerHTML += ChatMessageContainerTemplate(msg, msg.sig, msg.type);
***REMOVED***,

    scrollToBottom() {
        let chat_room_content = document.querySelector(".chat-room-content");
        chat_room_content.scrollTop = chat_room_content.scrollHeight;
***REMOVED*** chat_room_content.scrollIntoView(false);
***REMOVED***
***REMOVED***
