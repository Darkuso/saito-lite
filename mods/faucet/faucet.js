const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const Big = require('big.js');

const FaucetAppSpace = require('./lib/email-appspace/faucet-appspace');
const FaucetSidebar = require('./lib/arcade-sidebar/arcade-right-sidebar')
const FaucetSidebarRow = require('./lib/arcade-sidebar/arcade-sidebar-row.template')


class Faucet extends ModTemplate {

    constructor(app) {

        super(app);

        this.name = "Faucet";

        this.initial = 10;
        this.payoutRatio = 0.75;

        this.backup_payout = 50;
        this.registry_payout = 50;

        //
        // we want this running in all browsers
        //
        if (app.BROWSER == 1) {
            this.browser_active = 1;
        }

    }


    respondTo(type) {
        if (type == 'email-appspace') {
            let obj = {};
            obj.render = this.renderEmail;
            obj.attachEvents = this.attachEventsEmail;
            return obj;
        }

        if (type == 'arcade-sidebar') {
            let obj = {};
            obj.render = this.renderArcadeSidebar;
            obj.attachEvents = this.attachEventsArcadeSidebar;
            return obj;
        }
        return null;
    }

    async onPeerHandshakeComplete(app, peer) {
        if(this.browser_active ==1) {
            console.log('drawing achievements');
            try {
                if (document.querySelector(".arcade-sidebar-done")) {
                    await this.app.network.sendRequestWithCallback("get achievements", this.app.wallet.returnPublicKey(), (rows) => {
                        rows.forEach(row => this.renderAchievmentRow(row));
                      });
                } 
            } catch(err) {
                console.error(err);
            }
        }
    }

    

    renderAchievmentRow(row){
        if(typeof(row.label) != "undefined" || typeof(row.icon) != "undefined") {
            document.querySelector(".arcade-sidebar-done").innerHTML += FaucetSidebarRow(row.label, row.icon, row.count);            
        }
    }


    async handlePeerRequest(app, message, peer, mycallback = null) {
        if (message.request == "get achievements") {
            var achievements = await this.returnAchievements(message.data)
            mycallback(achievements);
        }

        if (message.request == "user wallet backup") {
            this.payoutFirstInstance(message.data, message.request, this.backup_payout);
        }

        if (message.request == "update activities") {
            var completed = await this.returnEvents(message.data)
            mycallback(completed);
        }

    }

    returnEventRow(event) {
        let obj = {};
        obj.count = "";
        switch (event) {
            case 'user wallet backup':
                obj.label = "Wallet Backup";
                obj.icon = "fas fa-download";
                break;
            case 'register identifier':
                obj.label = "Name Yourself";
                obj.icon = "fas fa-user-tag"
                break;
        }
        return obj;
    }

    returnNumberBadge(x) {
        let obj = {}
          obj.count = x;
        switch (true) {
            case (x = 0):
                obj.label = "No transactions yet!";
                obj.icon = "0tx badge";
                break;
            case (x = 1):
                obj.label = "Your first Transaction!";
                obj.icon = "1tx badge";
                break;                
            case (x > 1 && x <= 10):
                obj.label = x + " transactions!";
                obj.icon = "1tx badge";
                break;
            case (x > 9 && x <= 50):
                obj.label = "Multiple Transactions - cool!";
                obj.icon = "10tx badge";
                break;
            case (x > 50 && x <= 100):
                obj.label = "50 TX - a real user";
                obj.icon = "50tx badge";
                break;
            case (x > 100 && x <= 500):
                obj.label = "100 TX - a regular!";
                obj.icon = "100tx badge";
                break;
            case (x > 500 &&x <= 1000):
                obj.label = "500 TX - hard core!";
                obj.icon = "500tx badge";
                break;
        }
        if (x > 1000) {
            obj.label = "Master";
            obj.badge = "master badge";
            obj.count = (Math.floor(x / 1000)).toString + "k";
        }
        return obj;
    }

    async returnAchievements(key) {
        let achievements = [];
        let rows = await this.returnEvents(key, false);
        for (let i = 0; i < rows.length; i++) {
            achievements.push(this.returnEventRow(rows[i].event));
        }
        let tx_count = await this.returnUserTxCount(key);
        achievements.push(this.returnNumberBadge(tx_count));
        return achievements;
    }

    renderEmail(app, data) {
        data.faucet = app.modules.returnModule("Faucet");
        FaucetAppspace.render(app, data);
    }
    attachEventsEmail(app, data) {
        data.faucet = app.modules.returnModule("Faucet");
        FaucetAppspace.attachEvents(app, data);
    }

    renderArcadeSidebar(app, data) {
        data.faucet = app.modules.returnModule("Faucet");
        FaucetSidebar.render(app, data);
    }

    attachEventsArcadeSidebar(app, data) {
        data.faucet = app.modules.returnModule("Faucet");
        FaucetSidebar.attachEvents(app, data);
    }

    async payoutFirstInstance(address, event, payout) {
        if (await this.checkEvent(address, event) == false) {
            this.makePayout(address, payout);
        }
        this.recordEvent(address, event);
    }

    async onConfirmation(blk, tx, conf, app) {

        if (app.BROWSER == 1) { return }
           
        if (conf == 0) {
            if (tx.transaction.type == 0) {
                if (this.app.BROWSER == 1) { return; }
                this.updateUsers(tx);
            }
            if (tx.transaction.msg.origin == "Registry") {
                this.payoutFirstInstance(tx.transaction.to[0].add, "register identifier", this.registry_payout);
            }
        }
    }


    async updateUsers(tx) {
        try {
            if (tx.transaction.type >= -999) {
                for (let ii = 0; ii < tx.transaction.from.length; ii++) {
                    if (tx.transaction.from[ii].type >= -999) {
                        if (tx.transaction.from[ii].add != this.app.wallet.returnPublicKey()) {
                            let sql = "SELECT * FROM users where address = $address";
                            let params = {
                                $address: tx.transaction.from[ii].add
                            };
                            let rows = await this.app.storage.queryDatabase(sql, params, "faucet");
                            if (rows.length == 0) {
                                this.addUser(tx, ii);
                            } else {
                                for (let j = 0; j < rows.length; j++) {
                                    if (rows[j].address == tx.transaction.from[ii].add) {
                                        this.updateUser(rows[j], tx, ii);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch (err) {
            console.error(err);
        }
    }

    async updateUser(row, tx, ii) {
        let sql = "";
        let params = {};
        var payout = ((row.total_spend / (row.total_payout + 0.01)) >= this.payoutRatio);
        var newPayout = Math.ceil(row.last_payout_amt / this.payoutRatio);
        var isGame = 0;
        if (typeof tx.transaction.msg.game_id != "undefined") { isGame = 1 };
        var gameOver = 0;
        if (tx.name == "game over") { gameOver = 1 };
        if (payout == true) {
            params = {
                $address: row.address,
                $last_payout_ts: tx.ts,
                $last_payout_amt: newPayout,
                $total_payout: row.total_payout + newPayout,
                $tx_count: row.tx_count + 1,
                $games_finished: row.games_finished + gameOver,
                $game_tx_count: row.game_tx_count + isGame,
                $latest_tx: tx.transaction.ts,
                $total_spend: row.total_spend + Number(tx.fees_total)
            }
            sql = `UPDATE users SET last_payout_ts = $last_payout_ts, last_payout_amt = $last_payout_amt, total_payout = $total_payout, tx_count = $tx_count, games_finished = $games_finished, game_tx_count = $game_tx_count, latest_tx = $latest_tx, total_spend = $total_spend WHERE address = $address`

        } else {
            params = {
                $address: row.address,
                $tx_count: row.tx_count + 1,
                $games_finished: row.games_finished + gameOver,
                $game_tx_count: row.game_tx_count + isGame,
                $latest_tx: tx.transaction.ts,
                $total_spend: row.total_spend + Number(tx.fees_total)
            }
            sql = `UPDATE users SET last_payout_ts = $last_payout_ts, tx_count = $tx_count, games_finished = $games_finished, game_tx_count = $game_tx_count, latest_tx = $latest_tx, total_spend = $total_spend WHERE address = $address`
        }
        let resp = await this.app.storage.executeDatabase(sql, params, "faucet");

        if (payout) {
            this.makePayout(row.address, newPayout);
        }

    }


    async addUser(tx, ii) {
        try {
            //let sql = "INSERT OR IGNORE INTO users (address, tx_count, games_finished, game_tx_count, first_tx, latest_tx, last_payout_ts, last_payout_amt, total_payout, total_spend, referer) VALUES ($address, $tx_count, $games_finished, $game_tx_count, $first_tx, $latest_tx, $last_payout_ts, $last_payout_amt, $total_payout, $total_spend, $referer);"
            var isGame = 0;
            if (typeof tx.transaction.msg.game_id != undefined) { isGame = 1 };
            let params = {
                $address: tx.transaction.from[ii].add,
                $tx_count: 1,
                $games_finished: 0,
                $game_tx_count: isGame,
                $first_tx: tx.transaction.ts,
                $latest_tx: tx.transaction.ts,
                $last_payout_ts: tx.transaction.ts,
                $last_payout_amt: this.initial,
                $total_payout: this.initial,
                $total_spend: Number(tx.fees_total),
                $referer: ''
            }
            let sql = "INSERT OR IGNORE INTO users (address, tx_count, games_finished, game_tx_count, first_tx, latest_tx, last_payout_ts, last_payout_amt, total_payout, total_spend, referer) VALUES ('" + tx.transaction.from[ii].add + "', " + 1 + ", " + 0 + ", " + isGame + ", " + tx.transaction.ts + ", " + tx.transaction.ts + ", " + tx.transaction.ts + ", " + this.initial + ", " + this.initial + ", " + Number(tx.fees_total) + ", '');";
            params = {};

            await this.app.storage.executeDatabase(sql, params, "faucet");

            //initial funds sent
            //this.makePayout(tx.transaction.from[ii].add, this.initial);

            return;
        } catch (err) {
            console.error(err);
        }
    }

    async recordEvent(address, event, time = new Date().getTime()) {
        let sql = "INSERT INTO events (address, event, time) VALUES ($address, $event, $time);";
        let params = {
            $address: address,
            $event: event,
            $time: time
        }
        try {

            await this.app.storage.executeDatabase(sql, params, "faucet");

        } catch (err) {
            console.error(err);
        }
    }

    async returnUserTxCount(address, counted = "tx_count") {

        let sql = "SELECT " + counted + " FROM users where address = $address limit 1";

        let params = {
            $address: address
        }

        try {
            let rows = await this.app.storage.queryDatabase(sql, params, "faucet");
            if (rows.length > 0){
                return rows[0][counted];
            } else {
                return 0;
            }
        } catch (err) {
            console.error(err);
        }
    }

    async returnEvents(address, latest = false) {

        var sql = "";
        if (latest) {
            sql = "SELECT * FROM events where address = $address order by time asc limit 1";
        } else {
            sql = "SELECT * FROM events where address = $address group by event order by time desc";
        }

        let params = {
            $address: address
        }

        try {
            let rows = await this.app.storage.queryDatabase(sql, params, "faucet");
            return rows;
        } catch (err) {
            console.error(err);
        }
    }

    async checkEvent(address, event) {

        let sql = "SELECT * FROM events where address = $address and $event = event";

        let params = {
            $address: address,
            $event: event
        }

        try {
            let rows = await this.app.storage.queryDatabase(sql, params, "faucet");
            if (rows.length >= 1) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            console.error(err);
        }
    }

    async makePayout(address, amount) {
        //send the user a little something.

        let wallet_balance = this.app.wallet.returnBalance();

        if (wallet_balance < amount) {
            console.log("\n\n\n *******THE FAUCET IS POOR******* \n\n\n");
            return;
        }

        try {

            let faucet_self = this;
            let total_fees = Big(amount + 2);
            let newtx = new saito.transaction();
            newtx.transaction.from = faucet_self.app.wallet.returnAdequateInputs(total_fees.toString());
            newtx.transaction.ts = new Date().getTime();

            //console.log("FAUCET INPUTS: " + JSON.stringify(faucet_self.app.wallet.wallet.inputs));

            // add change input
            var total_inputs = Big(0.0);
            for (let i = 0; i < newtx.transaction.from.length; i++) {
                total_inputs = total_inputs.plus(Big(newtx.transaction.from[i].amt));
            }

            //
            // generate change address(es)
            //
            var change_amount = total_inputs.minus(total_fees);

            // break up payment into many slips if large
            var chunks = Math.floor(amount / 100);
            var remainder = amount % 100;

            for (let i = 0; i < chunks; i++) {
                newtx.transaction.to.push(new saito.slip(address, Big(100.0)));
                newtx.transaction.to[newtx.transaction.to.length - 1].type = 0;
            }
            newtx.transaction.to.push(new saito.slip(address, Big(remainder)));
            newtx.transaction.to[newtx.transaction.to.length - 1].type = 0;

            if (Big(change_amount).gt(0)) {
                newtx.transaction.to.push(new saito.slip(faucet_self.app.wallet.returnPublicKey(), change_amount.toFixed(8)));
                newtx.transaction.to[newtx.transaction.to.length - 1].type = 0;
            }

            newtx.transaction.msg.module = "Email";
            newtx.transaction.msg.title = "Saito Faucet - You have been Rewarded";
            newtx.transaction.msg.message = `
            <p>You have received <span class="boldred">${amount} tokens</span> from our Saito faucet.</p>
            `;
            newtx = this.app.wallet.signTransaction(newtx);

            this.app.network.propagateTransaction(newtx);
            return;

        } catch (err) {
            console.log("ERROR CAUGHT IN FAUCET: ", err);
            return;
        }

    }

    shouldAffixCallbackToModule() { return 1; }

}

module.exports = Faucet;
