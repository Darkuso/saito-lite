const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const ChatGroup = require('./lib/chatgroup');

class ChatCore extends ModTemplate {

  constructor(app) {

    super(app);
    this.name = "Chat";
    this.events = ['encrypt-key-exchange-confirm'];
    this.groups = [];
  }

  receiveEvent(type, data) {

    //
    // new encryption channel opened
    //
    if (type === "encrypt-key-exchange-confirm") {
      if (data.members === undefined) { return; }
      let newgroup = this.createChatGroup(data.members);
      this.addNewGroup(newgroup);
      this.sendEvent('chat-render-request', {});
      this.saveChat();
    }

  }

  initialize(app) {

    super.initialize(app);

    //
    // create chatgroups from keychain
    //
    let keys = this.app.keys.returnKeys();
    for (let i = 0; i < keys.length; i++) {
      let members = [keys[i].publickey, this.app.wallet.returnPublicKey()];
      let newgroup = this.createChatGroup(members);
      this.addNewGroup(newgroup);
    }

    //
    // create chatgroups from groups
    //
    let g = this.app.keys.returnGroups();
    for (let i = 0; i < g.length; i++) {
      let members = g[i].members;
      let newgroup = this.createChatGroup(members);
      this.addNewGroup(newgroup);
    }
    this.sendEvent('chat-render-request', {});
  }

  async onPeerHandshakeComplete(app, peer) {

    if (this.groups.length == 0) {
      let { publickey } = peer.peer;
      //
      // create mastodon server
      //
      let members = [peer.peer.publickey];
      let newgroup = this.createChatGroup(members);
      this.addNewGroup(newgroup);
    }

    let group_ids = this.groups.map(group => group.id);

    let txs = new Promise((resolve, reject) => {
      app.storage.loadTransactionsByKeys(group_ids, "Chat", 50, (txs) => {
        resolve(txs);
      });
    });

    let tx_messages = {} ;

    txs = await txs;

    if (txs.length > 0) {
      txs.forEach(tx => {
        let { group_id } = tx.transaction.msg;
        let txmsg = tx.returnMessage();
        let msg_type = tx.transaction.from[0].add == app.wallet.returnPublicKey() ? 'myself' : 'others';
        let msg = Object.assign(txmsg, { sig: tx.transaction.sig, type: msg_type });
        (tx_messages[group_id] = tx_messages[group_id] || []).unshift(msg);
      });

      this.groups = this.groups.map(group => {
        group.messages = tx_messages[group.id] || [];
        return group;
      });
    }

    this.sendEvent('chat-render-request', {});
    this.saveChat();
  }


  // key can be singular person or group key (TODO group keys?)
  createChatGroup(members=null) {

    if (members == null) { return; }
    members.sort();

    let id = this.app.crypto.hash(`${members.join('_')}`)
    let identicon = "";
    let address = "";

    if (members.length == 2) {
      address = members[0] != this.app.wallet.returnPublicKey() ? members[0] : members[1];
    } else {
      address = "Group " + id.substring(0, 10);
    }
    identicon = this.app.keys.returnIdenticon(address);

    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].id == id) { return; }
    }

    return {
      id,
      name: address.substring(0, 16),
      members: members,
      messages: [],
      identicon: identicon,
    };
  }

  addNewGroup(chatgroup) {
    let cg = new ChatGroup(this.app, chatgroup);

    if (this.app.options.chat) {
      if (this.app.options.chat.groups) {
        this.app.options.chat.groups.forEach(group => {
          if (group.id == chatgroup.id) {
            cg.messages = group.messages || [];
          }
        });
      }
    }

    cg.is_encrypted = 0;
    cg.initialize(this.app);
    this.groups.push(cg);
  }

  //
  // onChain messages received on the blockchain arrive here
  //
  onConfirmation(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();
    if (conf == 0) {
      if (txmsg.request == "chat message") {
        if (tx.transaction.from[0].add == app.wallet.returnPublicKey()) { return; }
	      this.receiveChatMessage(app, tx);
      }
    }
  }


  //
  // messages received peer-to-peer arrive here
  //
  handlePeerRequest(app, req, peer, mycallback) {

    if (req.request == null) { return; }
    if (req.data == null) { return; }

    let tx = req.data //new saito.transaction(JSON.parse(req.data));

    try {

      switch (req.request) {

        case "chat message":
          this.receiveMessage(app, new saito.transaction(tx.transaction));
          if (mycallback) { mycallback({ "payload": "success", "error": {} }); };
          break;

        case "chat broadcast message":

          // save state of message
          let archive = this.app.modules.returnModule("Archive");
          archive.saveTransactionByKey(tx.transaction.msg.group_id, tx);

          this.app.network.peers.forEach(p => {
            if (p.peer.publickey !== peer.peer.publickey) {
              p.sendRequest("chat message", tx);
            }
          });
          if (mycallback) { mycallback({ "payload": "success", "error": {} }); }
          break;
      }

     } catch(err) {
      console.log(err);
    }
  }

  sendMessage (app, tx) {
    let recipient = app.network.peers[0].peer.publickey;
    let relay_mod = app.modules.returnModule('Relay');
    relay_mod.sendRelayMessage(recipient, 'chat broadcast message', tx);
  }

  receiveMessage(app, tx) {

    let txmsg = tx.returnMessage();

    this.groups.forEach(group => {
      if (group.id == txmsg.group_id) {
        let msg_type = tx.transaction.from[0].add == this.app.wallet.returnPublicKey() ? 'myself' : 'others';
        let msg = Object.assign(txmsg, { sig: tx.transaction.sig, type: msg_type });
        group.messages.push(msg);

        if (this.app.wallet.returnPublicKey() != txmsg.publickey) {
          this.sendEvent('chat_receive_message', msg);
        }

        this.sendEvent('chat-render-request', {});
      }
    });
  }

  saveChat() {

    this.app.options.chat = Object.assign({}, this.app.options.chat);
    this.app.options.chat.groups = this.groups.map(group => {
      let {id, name, members, is_encrypted} = group;
      return {id, name, members, is_encrypted};
    });
    this.app.storage.saveOptions();
  }

  chatLoadMessages(app, tx) {}
  async chatRequestMessages(app, tx) {}

}


module.exports = ChatCore;

