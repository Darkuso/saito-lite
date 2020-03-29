const Big = require('big.js');

class Blockchain {

  constructor(app) {
    this.app                   = app || {};

    this.index		     	= {};
    this.index.blocks		= [];
    this.index.paths		= [];
    this.index.stakers          = [];

    this.bsh_lc_hmap           	= [];
    this.bsh_bid_hmap          	= [];
    this.bid_bsh_hmap          	= [];
    this.bsh_ts_hmap          	= [];

    this.lc_pos_set          	= false
    this.lc_pos             	= 0;
    this.last_lc_pos		= 0;

    this.run_callbacks		= 1;
    this.callback_limit		= 50;

    this.fork_id			= "";
    this.fork_id_mod		= 10;		// regenerate every N blocks

    this.genesis_ts            	= 0;
    this.genesis_bid           	= 0;
    this.genesis_period       	= 100000;

    this.last_bsh              	= "";
    this.last_bid              	= 0;
    this.last_ts               	= 0;
    this.last_bf              	= 0.0;
    this.lowest_acceptable_ts  	= 0;
    this.lowest_acceptable_bsh 	= "";
    this.lowest_acceptable_bid	= 0;

    this.indexing_active         = 0;

    //
    // staking vars
    //
    this.last_staker_pos   	= 0;
    this.last_staker_bid   	= -1;
    this.last_staker_sid   	= -1;

  }


  async addBlockToBlockchain(blk, force=false) {


console.log("\n\n ... adding block "+blk.block.id+": " + blk.returnHash());
console.log("FORCED?: " + force);

    this.indexing_active = 1;

    ///////////////////
    // SANITY CHECKS //
    ///////////////////
    if (blk.is_valid == 0) {
      console.log("ERROR 178234: block is not valid when adding to chain. terminating...");
      this.indexing_active = 0;
      return;
    }


    if ((blk.block.ts < this.genesis_ts || blk.block.id < this.genesis_bid) && force != true) {
      console.log("ERROR 792837: block id precedes genesis period. terminating...");
      this.indexing_active = 0;
      return;
    }

    if (this.isHashIndexed(blk.returnHash())) {
      console.log("ERROR 582039: blockchain already contains this block hash. terminating...");
      this.indexing_active = 0;
      return;
    }


    //
    // pos --> position in header / blocks index
    //
    this.last_lc_pos = this.lc_pos;

    //
    // previous block not indexed, but acceptable
    //
    if (blk.block.ts < this.lowest_acceptable_ts) {
      this.lowest_acceptable_ts = blk.block.ts;
    }


    //
    // track first block
    //
    // if we are adding our first block, we set this as our lowest
    // acceptable ts to avoid requesting earlier blocks ad infinitum
    // into the past.
    //
    // lowest acceptable bid must be updated so that we know the
    // earliest block we need to worry about when handling full slip
    // validation.
    //
    if (this.lowest_acceptable_ts == 0) {

      this.lowest_acceptable_bid = blk.block.id;
      this.lowest_acceptable_bsh = blk.returnHash();
      this.lowest_acceptable_ts = this.last_ts;

      if (this.lowest_acceptable_ts == 0) {
        this.lowest_acceptable_ts = blk.block.ts;
      }

    } else {

      if (this.lowest_acceptable_ts > blk.block.ts) {
        if (!force) {
          this.lowest_acceptable_ts = blk.block.ts;
        }
      }

    }


    //
    // fetch missing blocks
    //
    if (blk.block.ts > this.lowest_acceptable_ts) {
      if (!this.isHashIndexed(blk.block.prevbsh))  {
        if (this.lc_pos_set == true) {
          if (blk.block.id > (this.index.blocks[this.lc_pos].block.bid - this.genesis_period)) {

            //
            // TODO - request missing block
            //
	    console.log("ERROR 148019: missing block");
	    process.exit();

          }
        }
      }
    }



    ////////////////////
    // insert indexes //
    ////////////////////
    let pos = this.binaryInsert(this.index.blocks, blk, (a, b) => { return a.block.ts - b.block.ts; });
    this.bsh_bid_hmap[blk.returnHash()] = blk.block.id;
    this.bsh_ts_hmap[blk.returnHash()] = blk.block.ts;
    this.index.blocks[pos] = blk;
    this.index.paths[pos] = [];
    this.index.stakers[pos] = [];


    ////////////////////////////
    // identify longest chain //
    ////////////////////////////
    let i_am_the_longest_chain		= 0;
    let shared_ancestor_pos	  	= 0;
    let shared_ancestor_pos_found	= false;


    ///////////////////
    // wind / unwind //
    ///////////////////
    let new_chain_bsh			= [];
    let old_chain_bsh			= [];
    let new_chain_pos			= [];
    let old_chain_pos			= [];



    //
    // the following code attempts to identify whether the new block forms part of the 
    // longest-chain. it does this by rolling the existing longest-chain block and the 
    // new longest-chain block backwards and seeing which one has the most accumulated
    // work.
    //
    // the initial checks are sanity-checks on startup that allow us to start with the
    // longest chain if we are just starting to sync the chain. the longest code down 
    // below with nchain / lchain (new chain / longest chain) are the bits that do the 
    // heavy-lifting.
    //
    // the loop also creates the arrays of POS and BSH data needed for submission to 
    // validating the new (proposed) blockchain and unwinding / winding our latest
    // data.
    //
    if (this.index.blocks.length == 1) {

      i_am_the_longest_chain = 1;

      this.lc_pos = pos;

      this.last_bsh = blk.returnHash();
      this.last_bid = blk.block.id;
      this.last_bf  = blk.block.bf;
      this.last_ts  = blk.block.ts;

      new_chain_bsh.push(blk.returnHash());
      new_chain_pos.push(pos);

    }


    if (this.last_bsh == blk.block.prevbsh && this.index.blocks.length > 1) {

      //
      // last block is longest chain
      //
      if (this.bsh_lc_hmap[this.last_bsh] == 1) {

        i_am_the_longest_chain = 1;
        shared_ancestor_pos = this.last_lc_pos;
        new_chain_bsh.push(blk.returnHash());
        new_chain_pos.push(pos);

      }
    }

    //
    // trace back to find shared ancestor
    //
    if (i_am_the_longest_chain == 0) {

      if (blk.block.id >= this.index.blocks[this.lc_pos].block.id) {

        //
        // find the last shared ancestor
        //
        let lblk = this.index.blocks[this.lc_pos];
        let nblk = this.index.blocks[pos];

        if (blk.block.id == lblk.block.id) {
          i_am_the_longest_chain = 1;
        }

        if (blk.block.prevbsh == lblk.returnHash()) {
          i_am_the_longest_chain = 1;

	  new_chain_bsh.push(blk.returnHash());
	  new_chain_pos.push(pos);

        } else {

          let lchain_pos 		= this.lc_pos;
          let nchain_pos 		= pos;
          let lchain_len 		= 0;
          let nchain_len 		= 0;
          let lchain_bf  		= lblk.block.bf;
          let nchain_bf  		= nblk.block.bf;
          let lchain_ts  		= lblk.block.ts;
          let nchain_ts  		= nblk.block.ts;
          let lchain_prevbsh		= lblk.block.prevbsh;
          let nchain_prevbsh		= nblk.block.prevbsh;

          let search_pos       		= null;
          let search_bf        		= null;
          let search_ts        		= null;
          let search_bsh      		= null;
          let search_prevbsh  		= null;


          old_chain_bsh.push(lblk.returnHash());
	  old_chain_pos.push(this.lc_pos);
          new_chain_bsh.push(blk.returnHash());
	  new_chain_pos.push(pos);


          if (nchain_ts >= lchain_ts) {
            search_pos 			= nchain_pos - 1;
          } else {
            search_pos 			= lchain_pos - 1;
          }

          while (search_pos >= 0) {

            let sblk = this.index.blocks[search_pos];

            search_ts	    = sblk.block.ts;
            search_bf       = sblk.block.bf;
            search_bsh      = sblk.returnHash();
            search_prevbsh  = sblk.block.prevbsh;

            //
            // hey look, it's the common ancestor!
            //
            if (search_bsh == lchain_prevbsh && search_bsh == nchain_prevbsh) {
              shared_ancestor_pos_found = true;
              shared_ancestor_pos = search_pos;
              search_pos = -1;

            //
            // keep looking
            //
            } else {

              if (search_bsh == lchain_prevbsh) {
                lchain_len++;
                lchain_prevbsh = this.index.blocks[search_pos].block.prevbsh;
                lchain_bf = lchain_bf + this.index.blocks[search_pos].block.bf;

		old_chain_bsh.push(search_bsh);
		old_chain_pos.push(search_pos);

              }

              if (search_bsh == nchain_prevbsh) {
                nchain_prevbsh = this.index.blocks[search_pos].block.prevbsh;
                nchain_len++;
                nchain_bf = nchain_bf + this.index.blocks[search_pos].block.bf;

		new_chain_bsh.push(search_bsh);
		new_chain_pos.push(search_pos);

              }

              shared_ancestor_pos = search_pos;
              search_pos--;

              //
              // new chain completely disconnected
              //
              if (shared_ancestor_pos == 1) {
                if (nchain_prevbsh == "") {
                  await this.addBlockToBlockchainSuccess(blk, pos, 0, force);
                  return;
                }
              }
              if (shared_ancestor_pos == 0) {
                if (nchain_prevbsh != lchain_prevbsh) {
                  await this.addBlockToBlockchainSuccess(blk, pos, 0, force);
                  return;
                }
              }
            }
          }

          //
          // longest chain if more routing AND burning work
          //
          if (nchain_len > lchain_len && nchain_bf >= lchain_bf && shared_ancestor_pos_found == true) {
            i_am_the_longest_chain = 1;
          }
        }
      } else {

        console.log("edge case with unordered blocks...");

        //
        // this catches an edge case that happens if we ask for blocks starting from
        // id = 132, but the first block we RECEIVE is a later block in that chain,
        // such as 135 or so.
        //
        // in this case our blockchain class will treat the first block as the starting
        // point and we run into issues unless we explicitly reset the blockchain to
        // treat block 132 as the proper first block.
        //
        // so we reset this to our first block and mark it as part of the longest chain
        // the network will figure this out in time as further blocks build on it.
        //
        if (blk.block.prevbsh == this.last_bsh && blk.block.prevbsh != "") {

          //
          // reset later blocks
          //
          for (let h = pos+1; h < this.index.blocks.length; h++) {
            this.bsh_lc_hmap[this.index.blocks[h].returnHash()] = i_am_the_longest_chain;
          }

          //
          // onChainReorganization
          //
          this.onChainReorganization(this.index.blocks[h].block.id, this.index.blocks[h].returnHash(), 0, pos);
          i_am_the_longest_chain = 1;

        }

      }
    }


    //
    // insert into LC hashmap
    //
    this.bsh_lc_hmap[this.index.blocks[pos].returnHash()] = i_am_the_longest_chain;

    //
    // update blockchain state variables depending
    //
    if (i_am_the_longest_chain == 1) {

      this.last_bsh  = this.index.blocks[pos].returnHash();
      this.last_bf   = this.index.blocks[pos].block.bf;
      this.last_ts   = this.index.blocks[pos].block.ts;
      this.last_bid  = this.index.blocks[pos].block.id;

      this.lc_pos = pos;
      this.lc_pos_set = true;

    }


    //
    // by now we know if our block forms part of the longest chain, or not. we
    // need to add its slips to our hashmap and staking indices, but do not 
    // necessarily need to validate them all unless this block is supposed to 
    // be part of the longest chain.
    //
    // the code below either inserts the slip data into the indices needed and
    // skips right to add-block-to-blockchain-success or (if we are dealing with
    // the longest chain and a new block there) we go through full slip validation
    // as well, kicking into the blockchain.validate() function which triggers
    // unwinding and then rewinding the chain.
    //


    //
    // first block (lc = 0, need two blocks for chain)
    //
    if (i_am_the_longest_chain == 1 && this.index.blocks.length == 1) {

      //
      // block #1 needs hashmap
      //
      for (let i = 0; i < blk.transactions.length; i++) {
        this.app.shashmap.insert_new_transaction(blk, blk.transactions[i]);
      }

      //
      // validate is necessary as it adds outputs to hashmap
      //
      await this.handleTransactionSlips(blk, pos);
      await this.validate(blk, pos, 1, [blk.returnHash()], [], [pos], []);
      await this.addBlockToBlockchainSuccess(blk, pos, 1);

      return;

    }


    //
    // non longest-chains
    //
    if (i_am_the_longest_chain == 0) {
      await this.handleTransactionSlips(blk, pos);
      await this.addBlockToBlockchainSuccess(blk, pos, 0);
      return;
    }



    //
    // if we hit this point we have a chain reorganization, and need to pass
    // new and old chain information to the blockchain validation function, which
    // unwinds / winds the chain
    //
    new_chain_bsh.reverse();
    old_chain_bsh.reverse();
    new_chain_pos.reverse();
    old_chain_pos.reverse();


    await this.handleTransactionSlips(blk, pos);
    await this.validate(
      blk,
      pos,
      i_am_the_longest_chain,
      new_chain_bsh,
      old_chain_bsh,
      new_chain_pos,
      old_chain_pos,
    );

  }



  async initialize() {

    try {

      if (this.app.options.blockchain != undefined) {
        if (this.app.options.blockchain.genesis_period != undefined) {

          this.last_bid			= this.app.options.blockchain.last_bid;
          this.last_bsh			= this.app.options.blockchain.last_bsh;
          this.last_ts			= this.app.options.blockchain.last_ts;
          this.last_bf			= this.app.options.blockchain.last_bf;
          this.genesis_ts			= this.app.options.blockchain.genesis_ts;
          this.genesis_bid		= this.app.options.blockchain.genesis_bid;
          this.genesis_period		= this.app.options.blockchain.genesis_period;

          this.lowest_acceptable_ts	= this.app.options.blockchain.lowest_acceptable_ts;
          this.lowest_acceptable_bsh 	= this.app.options.blockchain.lowest_acceptable_bsh;
          this.lowest_acceptable_bid	= this.app.options.blockchain.lowest_acceptable_bid;
        }
      }

      await this.app.storage.loadBlocksFromDisk(this.genesis_period*2);

    } catch (err) {
      console.log(err);
    }

  }



  isFullySynced() {
    let x = this.last_bid - this.genesis_period;
    if (x < 0) { return true; }
    if (this.index.blocks.length >= this.genesis_period || x <= 0) {
      if (x > this.lowest_acceptable_bid || (x <= 0 && this.lowest_acceptable_bid == 1)) {
        return true;
      }
    }
    return false;
  }



  async handleTransactionSlips(blk, pos) {

/*
console.log("+++++++++++++++++++");
console.log("+++1 ADD SLIP 1++++");
console.log("+++++++++++++++++++");
*/

    //
    // insert to shashmap
    //
    for (let i = 0; i < blk.transactions.length; i++) {

      //
      // add to shashmap
      //
      this.app.shashmap.insert_new_transaction(blk, blk.transactions[i]);

      //
      // new staking slips
      //
      if (blk.transactions[i].transaction.type == 4 || blk.transactions[i].transaction.type == 2) {
/*
console.log("-------------------");
console.log("TXSLIPS: " + JSON.stringify(blk.transactions[i].transaction.to));
*/
	for (let ii = 0; ii < blk.transactions[i].transaction.to.length; ii++) {
	  if (blk.transactions[i].transaction.to[ii].type == 4) {
/*
console.log("+++++++++++++++++++");
console.log("+++2 ADD SLIP 2++++");
console.log("+++++++++++++++++++");
*/
	    this.addStakingSlip(blk, blk.transactions[i].transaction.to[ii], pos);
	  }
        }
      }
    }

  }



  async validate(blk, pos, i_am_the_longest_chain, new_block_hashes, old_block_hashes, new_chain_pos, old_chain_pos) {

/***
console.log("\n\nADDING BLOCK: " + blk.block.id);
console.log(" hash --> " + blk.returnHash());
console.log(" prev --> " + blk.block.prevbsh);
console.log("_______________________");
console.log(JSON.stringify(new_block_hashes));
console.log(JSON.stringify(new_chain_pos));
console.log(JSON.stringify(old_block_hashes));
console.log(JSON.stringify(old_chain_pos));
console.log("_______________________");
***/

    //
    // unwind and wind
    //
    if (old_block_hashes.length > 0) {
      await this.unwindChain(
        blk,
        pos,
        i_am_the_longest_chain,
        new_block_hashes,
        old_block_hashes,
        0,
        0,
        old_block_hashes.length-1
      );
    } else {
      await this.windChain(
        blk,
        pos,
        i_am_the_longest_chain,
        new_block_hashes,
        old_block_hashes,
        0,
        0,
        0,
      );
    }

    return;

  }

  async windChain(blk, pos, i_am_the_longest_chain, new_block_hashes, old_block_hashes, force, resetting_flag, current_wind_index, new_block_pos, old_block_pos) {

console.log("CURRENT WIND INDEX: " + current_wind_index);
console.log(JSON.stringify(new_block_hashes));

    let this_block_hash = new_block_hashes[current_wind_index];

    //
    // this is the last block to add
    //
    if (blk.returnHash() === this_block_hash) {

      if (blk.validates == 1) { return 1; }

      let block_validates = await blk.validate();
      if (block_validates) {


        //
        // we do not handle onChainReorganization for everything
        // here as we do for older blocks. the reason for this is
        // that the block is not yet saved to disk.
        //
        // onChainReorganization is run on addBlockToBlockchainSuccess
        //

        //
        // spend shashmap
        //
        for (let i = 0; i < blk.transactions.length; i++) {
          this.app.shashmap.spend_transaction(blk.transactions[i], blk.block.id);
        }

        await this.addBlockToBlockchainSuccess(blk, pos, i_am_the_longest_chain, force);
        return;

      } else {

        //
        // the block does not validate, unwind
        //
        if (current_wind_index == 0) {

          // this is the first block we have tried to add
          // and so we can just roll out the older chain
          // again as it is known good.
          //
          // note that old and new hashes are swapped
          // and the old chain is set as null because
          // we won't move back to it. we also set the
          // resetting_flag to 1 so we know to fork
          // into addBlockToBlockchainFailure
          //
          if (old_block_hashes.length > 0) {
            this.windChain(
              blk,
              pos,
              i_am_the_longest_chain,
              old_block_hashes,
              new_block_hashes,
              force,
              1,
              0,
              old_chain_pos,
              new_chain_pos,
            );
            return;
          } else {
            await this.addBlockToBlockchainFailure(blk, pos, i_am_the_longest_chain, force);
            return;
          }

        } else {

          //
          // we need to unwind some of our previously
          // added blocks from the new chain. so we
          // swap our hashes to wind/unwind.
          //
          let chain_to_unwind_hashes = [];
          let chain_to_unwind_pos = [];

          //
          // remove previous added
          //
          for (let i = current_wind_index; i < new_block_hashes.length; i++) {
            chain_to_unwind_hashes.push(new_block_hashes[i]);
            chain_to_unwind_pos.push(new_chain_pos[i]);
          }

          //
          // unwind NEW and wind OLD with resetting flag active
          //
          this.unwindChain(
            blk,
            pos,
            i_am_the_longest_chain,
            old_block_hashes,
            chain_to_unwind_hashes,
            force,
            1,
            chain_to_unwind_hashes.length,
            old_block_pos,
            chain_to_unwind_pos,
          );
          return;

        }
      }

    } else {

console.log("trying to load: " + this_block_hash);
      let new_blk = await this.returnBlockByHashFromMemoryOrDisk(this_block_hash);

      if (new_blk == null) {

        //
        //
        //
        console.log("ERROR 620394: block does not exist on disk that should. terminating");
        process.exit();

      }

      if (new_blk.validates == 1) { return 1; }
      if (new_blk.validate()) {

        this.onChainReorganization(this_block_hash, new_blk.block.id, 1, new_chain_pos[current_wind_index]);

        //
        // spend in shashmap
        //
        for (let i = 0; i < new_blk.transactions.length; i++) {
          shashmap.spend_transaction(new_blk.transactions[i], new_blk.block.id);
        }

        if (current_wind_index == new_block_hashes.length-1) {
          if (resetting_flag == 0) {
            await this.addBlockToBlockchainSuccess(blk, pos, i_am_the_longest_chain, force);
            return;
          } else {
            await this.addBlockToBlockchainFailure(blk, pos, i_am_the_longest_chain, force);
            return;
          }
        } else {
          this.windChain(
            blk,
            pos,
            i_am_the_longest_chain,
            new_block_hashes,
            old_block_hashes,
            force,
            resetting_flag,
            current_wind_index+1,
            new_chain_pos,
            old_chain_pos,
          );
          return;
        }
      } else {

        if (current_wind_index == 0) {
          this.windChain(
            blk,
            pos,
            i_am_the_longest_chain,
            old_block_hashes, // flipped
            [],
            force,
            1,     // reset as invalid
            0,
            old_chain_pos,
            [],
          );

        } else {

          //
          // we need to unwind some of our previously
          // added blocks from the new chain. so we
          // swap our hashes to wind/unwind.
          //
          let chain_to_unwind_hashes = [];
          let chain_to_unwind_pos = [];

          for (let i = current_wind_index; i < new_block_hashes.length; i++) {
            chain_to_unwind_hashes.push(new_block_hashes[h]);
            chain_to_unwind_pos.push(new_chain_pos[h]);
          }


          //
          // unwind NEW and wind OLD, and set resetting_flag to 1
          //
          this.unwindChain(
            blk,
            pos,
            i_am_the_longest_chain,
            old_block_hashes,
            chain_to_unwind_hashes,
            force,
            1,
            chain_to_unwind_hashes.length-1,
	    old_chain_pos,
	    chain_to_unwind_pos,
          );
        }
      }
    }
  }


  async unwindChain(blk, pos, i_am_the_longest_chain, new_block_hashes, old_block_hashes, force, resetting_flag, current_unwind_index, new_chain_pos, old_chain_pos) {
    if (old_block_hashes.length > 0) {
      //
      // load old block
      //
      let old_blk = await this.returnBlockByHashFromMemoryOrDisk(old_block_hashes[current_unwind_index]);
      if (old_blk == null) {

        //
        // request missing block
        //
        console.log("ERROR 721058: cannot find block that should exist on disk...");
        console.log(" missing: " + old_block_hashes[current_unwind_index]);
        process.exit();

      }

      //
      // block or data is legit, so run on_chain_reorganization
      // this should update the LC index as well
      this.onChainReorganization(old_blk.returnHash(), old_blk.block.id, 0, old_chain_pos[current_unwind_pos]);


      //
      // we either move on to our next block, or we hit
      // the end of the chain of blocks to unspend and
      // move on to wind the proposed new chain
      //
      if (current_unwind_index == 0) {
        await this.windChain(
          blk,
          pos,
          i_am_the_longest_chain,
          new_block_hashes,
          old_block_hashes,
          force,
          resetting_flag,
          0,
  	  new_chain_pos,
	  old_chain_pos,
        );
      } else {
        await this.unwindChain(
          blk,
          pos,
          i_am_the_longest_chain,
          new_block_hashes,
          old_block_hashes,
          force,
          resetting_flag,
          current_unwind_index-1,
  	  new_chain_pos,
	  old_chain_pos,
        );
      }
    } else {

      //
      // no more blocks to unwind
      //
      await this.windChain(
        blk,
        pos,
        i_am_the_longest_chain,
        new_block_hashes,
        old_block_hashes,
        force,
        resetting_flag,
        0,
        new_chain_pos,
        old_chain_pos,
      );

    }
  }


  returnLastSharedBlockId(fork_id, latest_known_block_id) {

    // if there is no fork_id submitted, we backpedal 1 block to be safe
    if (fork_id == null || fork_id == "") { return 0; }
    if (fork_id.length < 2) { if (latest_known_block_id > 0) { latest_known_block_id - 1; } else { return 0; } }

    // roll back latest known block id to known fork ID measurement point
    for (let x = latest_known_block_id; x >= 0; x--) {
      if (x%this.fork_id_mod == 0) {
        latest_known_block_id = x;
        x = -1;
      }
    }

    let our_latest_bid = this.last_bid;

    // roll back until we have a match
    for (let fii = 0; fii < (fork_id.length/2); fii++) {

      var peer_fork_id_pair = fork_id.substring((2*fii),(2*fii)+2);
      var our_fork_id_pair_blockid = latest_known_block_id;

      if (fii == 0)  { our_fork_id_pair_blockid = latest_known_block_id - 0; }
      if (fii == 1)  { our_fork_id_pair_blockid = latest_known_block_id - 10; }
      if (fii == 2)  { our_fork_id_pair_blockid = latest_known_block_id - 20; }
      if (fii == 3)  { our_fork_id_pair_blockid = latest_known_block_id - 30; }
      if (fii == 4)  { our_fork_id_pair_blockid = latest_known_block_id - 40; }
      if (fii == 5)  { our_fork_id_pair_blockid = latest_known_block_id - 50; }
      if (fii == 6)  { our_fork_id_pair_blockid = latest_known_block_id - 75; }
      if (fii == 7)  { our_fork_id_pair_blockid = latest_known_block_id - 100; }
      if (fii == 8)  { our_fork_id_pair_blockid = latest_known_block_id - 200; }
      if (fii == 9)  { our_fork_id_pair_blockid = latest_known_block_id - 500; }
      if (fii == 10) { our_fork_id_pair_blockid = latest_known_block_id - 1000; }
      if (fii == 11) { our_fork_id_pair_blockid = latest_known_block_id - 5000; }
      if (fii == 12) { our_fork_id_pair_blockid = latest_known_block_id - 10000; }
      if (fii == 13) { our_fork_id_pair_blockid = latest_known_block_id - 50000; }

      if (our_latest_bid < our_fork_id_pair_blockid) {} else {

        // return hash by blockid
        var tmpklr = this.returnHashByBlockId(our_fork_id_pair_blockid);

        // if we have not found a match, return 0 since we have
        // irreconciliable forks, so we just give them everything
        // in the expectation that one of our forks will eventually
        // become the longest chain
        if (tmpklr == "") { return 0; }

        var our_fork_id_pair = tmpklr.substring(0, 2);

        // if we have a match in fork ID at a position, treat this
        // as the shared forkID
        if (our_fork_id_pair == peer_fork_id_pair) {
          return our_fork_id_pair_blockid;
        }
      }
    }
    return 0;
  }




  returnLongestChainIndexPosArray(chainlength=10) {

    if (this.index.blocks.length == 0) { return []; }
    if (this.index.blocks.length < chainlength) { chainlength = this.index.blocks.length; }
    if (chainlength == 0) { return []; }

    var bchainIndex = [];
    var chain_pos = this.lc_pos;

    bchainIndex.push(chain_pos);

    for (let z = 0; z < chainlength; z++) {

      var prev_pos = chain_pos-1;
      var prev_found = 0;

      if (prev_pos == -1) {
        z = chainlength+1;
      } else {
        while (prev_pos >= 0 && prev_found == 0) {
          if (this.index.blocks[prev_pos].returnHash() == this.index.blocks[chain_pos].block.prevbsh) {
            bchainIndex.push(prev_pos);
            prev_found = 1;
            chain_pos = prev_pos;
          } else {
            prev_pos--;
          }
        }
      }
    }
    return bchainIndex;
  }



  updateForkId(blk) {

    if (blk == null) { return this.fork_id; }

    let base_bid	= blk.block.id;
    let fork_id   = "";
    let indexpos  = this.index.blocks.length-1;

    //
    // roll back to consensus starting point for measuring
    //
    for (let x = base_bid; x >= 0; x--) {
      if (x%this.fork_id_mod == 0) {
        base_bid = x;
        x = -1;
      }
    }

    for (let i = 0, stop = 0; stop == 0 && i < this.genesis_period;) {

      let checkpointblkid = base_bid-i;
      indexpos = this.returnLongestChainIndexArray(checkpointblkid, indexpos);

      if (indexpos == -1 || checkpointblkid < 0) { stop = 1; }
      else {
        let th = this.index.hash[indexpos];
        fork_id += th.substring(0,2);
      }

      //
      // if this is edited, we have to
      // also change the function
      //
      // - returnLastSharedBlockId
      //
      if (i == 10000) { i = 50000; }
      if (i == 5000)  { i = 10000; }
      if (i == 1000)  { i = 5000; }
      if (i == 500)   { i = 1000; }
      if (i == 200)   { i = 500; }
      if (i == 100)   { i = 200; }
      if (i == 75)    { i = 100; }
      if (i == 50)    { i = 75; }
      if (i == 40)    { i = 50; }
      if (i == 30)    { i = 40; }
      if (i == 20)    { i = 30; }
      if (i == 10)    { i = 20; }
      if (i == 0)     { i = 10; }

      if (i > this.genesis_period || i == 50000) { stop = 1; }

    }

    this.fork_id = fork_id;

  }

  async addBlockToBlockchainSuccess(blk, pos, i_am_the_longest_chain, force=false) {

console.log("Add Block to Blockchain Success!");

    //
    // save block to disk
    //
    await this.app.storage.saveBlock(blk, i_am_the_longest_chain);


    //
    // reorganize THIS block
    //
    if (i_am_the_longest_chain == 1) {

      this.app.wallet.resetExistingSlips(blk.block.id, blk.returnHash(), i_am_the_longest_chain);
      this.bsh_lc_hmap[blk.returnHash()] = 1;
      this.bid_bsh_hmap[blk.block.id] = blk.returnHash();

      this.lc_pos_set	= true;
      this.lc_pos 	= pos;

      this.saveBlockchain(blk);
    }


    //
    // update modules (with sync info) ?
    //
    //this.app.modules.updateBlockchainSync(blk.block.id, this.returnTargetBlockId());

    //
    // cleanup
    //
    this.app.mempool.removeBlockAndTransactions(blk);

    //
    // propagate block
    //
    this.app.network.propagateBlock(blk);


    //
    // only now process
    //
    if (!force) {

      //
      // wallet process slips (if non forced)
      //
      this.app.wallet.processPayments(blk, i_am_the_longest_chain);

      //
      // pass control to the callback manager
      //
      if (this.run_callbacks == 1) {

        blk.affixCallbacks(0);

        if (i_am_the_longest_chain == 1 && !force) {

          let our_longest_chain = this.returnLongestChainIndexPosArray(this.callback_limit);
          for (let i = 0; i < our_longest_chain.length && i < this.callback_limit; i++) {

	    // run callbacks with TXS
	    //
            let blk = this.index.blocks[our_longest_chain[i]];
            if (blk != null) {
              await blk.runCallbacks(i);
    	    }
  	  }
        }

        //
        // callback
        //
console.log("---------> callbacks on: " + blk.block.id);
	this.app.modules.onNewBlock(blk, i_am_the_longest_chain);

      }
    }

    //
    // update genesis period
    //
    this.updateGenesisBlock(blk, pos);


    //
    // permit addition of next block
    //
    this.indexing_active = 0;


    if (!force) {
      this.app.miner.startMining(blk);
    }

  }



  async addBlockToBlockchainFailure(blk, pos, i_am_the_longest_chain, force=no) {

    console.log("FAILURE ADDING BLOCK: " + blk.returnHash() + " -- " + pos + " -- " + i_am_the_longest_chain);
    //
    // restore longest chain
    //
    this.lc_pos = this.last_lc_pos;

    this.onChainReorganization(blk.returnHash(), blk.block.id, 0, pos);

    delete this.bsh_lc_hmap[blk.returnHash()];
    delete this.bsh_bid_hmap[blk.returnHash()];
    delete this.bsh_ts_hmap[blk.returnHash()];


    // reset miner
    this.app.miner.stopMining();
    let oldblk = this.returnLatestBlock();
    if (oldblk != null) {
      this.app.miner.startMining(oldblk);
    }

    //
    // remove bad everything
    //
    this.app.mempool.removeBlockAndTransactions(blk);

    //
    // resume normal operations
    //
    this.indexing_active = 0;
    return 1;

  }





  binaryInsert(list, item, compare, search) {

    var start = 0;
    var end = list.length;

    while (start < end) {

      var pos = (start + end) >> 1;
      var cmp = compare(item, list[pos]);

      if (cmp === 0) {
        start = pos;
        end = pos;
        break;
      } else if (cmp < 0) {
        end = pos;
      } else {
        start = pos + 1;
      }
    }

    if (!search) { list.splice(start, 0, item); }

    return start;
  }

  isHashIndexed(hash) {
    if (this.bsh_bid_hmap[hash] > 0) { return true; }
    return false;
  }


  onChainReorganization(bsh, bid, lc, pos) {

    //
    // update hashmap values
    //
    this.bsh_lc_hmap[bsh] = lc;
    if (lc == 0) {
      delete this.bid_bsh_hmap[bid];
    } else {
      this.bid_bsh_hmap[bid] = bsh;
    }

    //
    // update staking slips
    //
    let prevbsh = this.index.blocks[pos].block.prevbsh;
    let prevbid = bid-1;
    let prevpos = -1;

    for (let i = pos-1; i >= 0 && this.index.blocks[i].block.id >= prevbid; i--) {
      if (prevbsh == this.index.blocks[i].returnHash()) {
        prevpos = i;
      }
    }

    if (lc == 1) {
      if (prevpos == -1) {
	console.log("ERROR updating staking slips: prevpos not found in blockchain.onChainReorganization");
	process.exit();
      }
    }
    this.updateStakingSlip(pos, prevpos, lc);



    //
    // update wallet and modules
    //
    this.app.wallet.onChainReorganization(bsh, bid, lc, pos);
    this.app.modules.onChainReorganization(bsh, bid, lc, pos);


  }

  resetBlockchainOptions() {

    console.log("resetting blockchain: " + this.genesis_period);

    this.last_bid = "";
    this.last_bsh = "";
    this.last_ts = 0;
    this.last_bf = 0.0;
    this.genesis_ts = 0;
    this.genesis_bid = 0;
    this.lowest_acceptable_ts = 0;
    this.lowest_acceptable_bsh = 0;
    this.lowest_acceptable_bid = 0;

    this.saveBlockchain();

  }



  returnLatestBlock() {
    if (this.index.blocks.length == 0) { return null; }
    return this.index.blocks[this.lc_pos];
  }

  returnLatestBlockHash() {
    let blk = this.returnLatestBlock();
    if (blk == null) { return ""; }
    return blk.returnHash();
  }

  returnLatestBlockTimestamp() {
    let blk = this.returnLatestBlock();
    if (blk == null) { return 0; }
    if (blk.block == null) { return 0; }
    return blk.block.ts;
  }


  //
  // returns POS of block on longest chain for BID
  //
  // speed up search by providing a reasonably-close POS as 2nd argument
  //
  returnBlockPos(bid, pos=-1) {

    //
    // brute-force inefficient search through header index
    //
    if (pos == -1) { 
      pos = this.index.blocks.length-1;
      for (let i = pos; i >= 0 && this.index.blocks[i].block.id >= bid; i--) {
        if (this.bsh_lc_hmap[this.index.blocks[i].returnHash()] == 1) {
	  return i;
	}
      }
      return -1;
    }
    
    if (this.index.blocks.length < pos) { return -1; }

    for (let k = pos, cont = 1; k < this.index.blocks.length && cont == 1; k++) {
      if (this.index.blocks[k].block.id == bid) {
        pos = k;
      } else {
        cont = 0;
      }
    }

    //
    // pos is now highest bid at current
    //
    if (this.index.blocks[pos].block.id >= bid) {

      //
      // search down
      //
      for (let i = pos; i >= 0 && this.index.blocks[i].block.id >= bid; i--) {
        if (this.bsh_lc_hmap[this.index.blocks[i].returnHash()] == 1) {
	  return i;
	}
      }

    } else {

      //
      // search up
      //
      for (let i = pos; i < this.index.blocks.length-1 && this.index.blocks[i].block.id <= bid; i++) {
        if (this.bsh_lc_hmap[this.index.blocks[i].returnHash()] == 1) {
	  return i;
	}
      }

    }

    return -1;

  }


  returnBlockByHashFromMemoryOrDisk(hash) {
    let blk = this.returnBlockByHash(hash);
    if (blk == null) {
      blk = this.returnBlockByHashFromDisk(hash);
      return blk;
    } else {
      return blk;
    }
    return null;
  }

  returnBlockByHash(hash) {
    if (this.isHashIndexed(hash)) {
      for (let v = this.index.blocks.length-1; v >= 0; v-- ) {
        if (this.index.blocks[v].returnHash() == hash) {
          return this.index.blocks[v];
        }
      }
    }
    return null;
  }

  async returnBlockByHashFromDisk(hash) {
    if (this.isHashIndexed(hash)) {
      for (let v = this.index.blocks.length-1; v >= 0; v-- ) {
        if (this.index.blocks[v].returnHash() == hash) {
          return await this.app.storage.loadBlockByHash(hash);
        }
      }
    }
    return null;
  }

  async returnBlockById(bid, mode=0) {

    //
    // mode
    //
    // 0 -- fetch block from memory / txs not needed
    // 1 -- require transactions
    //
    let hash = this.bid_bsh_hmap[bid];
    if (hash == undefined) { return null; }

    if (this.isHashIndexed(hash)) {
      for (let v = this.index.blocks.length-1; v >= 0; v-- ) {
        if (this.index.blocks[v].returnHash() == hash) {
          switch (mode) {
            case 0:
              return this.index.blocks[v];
            case 1:
	      if (this.index.blocks[v].transactions.length == 0) {
                return await this.app.storage.loadBlockByHash(hash);
	      }
              return this.index.blocks[v];
            default:
              return this.index.blocks[v];
          }
        }
      }
    }
  }

  returnMinTxId() {
    if (this.lc_pos == null) { return 0; }
    if (this.index.blocks[this.lc_pos].mintxid == undefined) { return 0; }
    return this.index.blocks[this.lc_pos].maxtxid;
  }

  returnMaxTxId() {
    if (this.lc_pos == null) { return 0; }
    if (this.index.blocks[this.lc_pos].maxtxid == undefined) { return 0; }
    return this.index.blocks[this.lc_pos].maxtxid;
  }

  returnMinTxId() {
    if (this.lc_pos == null) { return 0; }
    if (this.index.blocks[this.lc_pos].mintxid == undefined) { return 0; }
    return this.index.blocks[this.lc_pos].maxtxid;
  }

  returnLowestValidBlock() {
    return this.last_bid - this.genesis_period + 2;
  }


  saveBlockchain(blk) {

    this.app.options.blockchain = Object.assign({}, this.app.options.blockchain);

    if (blk == null) { return; }

    this.last_bsh = blk.returnHash();
    this.last_bid = blk.block.id;
    this.last_ts  = blk.block.ts;
    this.last_bf  = blk.block.bf;

    //
    // selective updates
    //
    if (blk.block.id%this.fork_id_mod == 0) {
      this.fork_id  = this.updateForkId();
    }

    this.app.options.blockchain.last_bsh		= this.last_bsh;
    this.app.options.blockchain.last_bid		= this.last_bid;
    this.app.options.blockchain.last_ts			= this.last_ts;
    this.app.options.blockchain.last_bf			= this.last_bf;

    this.app.options.blockchain.genesis_ts		= this.genesis_ts;
    this.app.options.blockchain.genesis_bid		= this.genesis_bid;
    this.app.options.blockchain.genesis_period		= this.genesis_period;

    this.app.options.blockchain.lowest_acceptable_ts	= this.lowest_acceptable_ts;
    this.app.options.blockchain.lowest_acceptable_bsh	= this.lowest_acceptable_bsh;
    this.app.options.blockchain.lowest_acceptable_bid	= this.lowest_acceptable_bid;

    this.app.storage.saveOptions();

  }




 /**
  * when the blockchain hits a certain length we throw out all of our older blks
  * this is possible because block ids are incremental. We keep 2x the genesis 
  * period of the chain, fairly excessive:
  *
  * @params {saito.block} block
  * @params {integer} position in index
  */
  updateGenesisBlock(blk, pos) {

console.log("start of updating genesis block...");

    //
    // we need to make sure this is not a random block that is disconnected
    // from our previous genesis_id. If there is no connection between it
    // and us, then we cannot delete anything as otherwise the provision of
    // the block may be an attack on us intended to force us to discard
    // actually useful data.
    //
    // we do this by checking that our block is the head of the
    // verified longest chain.
    //
    if (this.index.blocks[this.lc_pos].returnHash() != blk.returnHash()) { return pos; }
    if (this.index.blocks.length < (this.genesis_period*2)) { return pos; }

    if (blk.block.id >= ((this.genesis_period * 2) + 1)) {

      let purge_id = blk.block.id - (this.genesis_period*2);
      this.genesis_bid = blk.block.id - (this.genesis_period);

      //
      // in either case, we are OK to throw out everything below the
      // lowest_block_id that we have found, since even the lowest
      // fork in our guard_period will not need to access transactions
      // from before itself and the genesis period.
      //
      // we use the purge_id variable since our functions inside
      // need to delete from wallet slips, which requires genesis
      // block_id to be set properly.
      //
      return this.purgeArchivedData(purge_id, pos);
    }

    return pos;
  }


  purgeArchivedData(lowest_block_id, pos) {

console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^");
console.log("purging blocks before: " + lowest_block_id);
console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^");

    let items_before_needed = 0;

    //
    // find the number of items in our blockchain before
    // we run into the lowest_block_id. Remember that blocks
    // are going to be sequential so it is only forks that
    // we really worry about
    //
    for (let x = 0; x < this.index.blocks.length; x++) {
      if (this.index.blocks[x].block.bid < lowest_block_id) {
        items_before_needed++;
      }
      else { x = this.index.blocks.length; }
    }




    for (let x = 0; x < items_before_needed; x++) {

      /////////////////////////
      // delete from hashmap //
      /////////////////////////
      let blk = this.index.blocks[x];
      let blkbsh = blk.returnHash();
      delete this.bsh_lc_hmap[blkbsh];
      delete this.bsh_bid_hmap[blkbsh];
      delete this.bsh_ts_hmap[blkbsh];
      delete this.bid_bsh_hmap[blk.block.bid];

      /////////////////////////
      // delete from storage //
      /////////////////////////
      //
      // slips / file / database
      //
      this.app.storage.deleteBlock(blk.block.bid, blk.returnHash(), this.bsh_lc_hmap[blk.returnHash()]);

    }


    ////////////////////////////////////////////////
    // delete from fast-access indexes and blocks //
    ////////////////////////////////////////////////
    this.index.blocks.splice(0, items_before_needed);
    this.index.paths.splice(0, items_before_needed);
    this.index.stakers.splice(0, items_before_needed);
    this.index.staking_reward(0, items_before_needed);

    var newpos = pos - items_before_needed;


    //////////////////
    // and clean up //
    //////////////////
    this.lc_pos = this.lc_pos - items_before_needed;
    this.app.wallet.purgeExpiredSlips();

    return newpos;


  }



  //
  // Staking slips are added as unpaid and belonging to teh current staking round.
  //
  addStakingSlip(blk, slip, pos) {

    let x               = {};
        x.slip          = slip;
        x.paid          = 0;

        x.next_bid      = -1;     // if paid, points to bid of next unpaid
        x.next_sid      = -1;     // if paid, points to sid of next unpaid
        x.last_bid      = -1;     // if paid, points to bid of last unpaid
        x.last_sid      = -1;     // if paid, points to sid of last unpaid

    this.index.stakers[pos].push(x);

  }

  updateStakingSlip(pos, prevpos, lc) {

    //
    // add to pending
    //
    if (lc == 1) {

      for (let i = 0; i < this.index.stakers[pos].length; i++) {

	let ii = i-1;
        if (i > 0) {
	  prevpos = pos;
        } else { 
	  ii = this.index.stakers[prevpos].length-1; 
	}

	let slip = this.index.stakers[pos][i];
	slip.paid     = this.staking_round;
	slip.last_bid = this.index.blocks[prevpos].block.id;
	slip.last_sid = ii;
	slip.next_bid = -1;
	slip.next_sid = -1;

        if (this.index.stakers[prevpos][ii].paid >= this.staking_round) {
	  slip.last_bid = this.index.stakers[prevpos][ii].last_bid;
	  slip.last_sid = this.index.stakers[prevpos][ii].last_sid;
        }
        this.index.stakers[prevpos][ii].next_bid = this.index.blocks[pos].block.id;
        this.index.stakers[prevpos][ii].next_sid = i;

        this.stakers_current++;

      }

    //
    // remove from pending
    //
    } else {

      for (let i = 0; i < this.index.stakers[pos].length; i++) {

	let ii = i-1;
        if (i > 0) {
	  prevpos = pos;
        } else { 
	  ii = this.index.stakers[prevpos].length-1; 
	}

	let slip = this.index.stakers[pos][i];
	slip.paid     = slip.paid--;
	slip.last_bid = -1;
	slip.last_sid = -1;
	slip.next_bid = -1;
	slip.next_sid = -1;

        this.index.stakers[prevpos][ii].next_bid = -1;
        this.index.stakers[prevpos][ii].next_sid = -1;

	//
	// unrolled entire round
	//
        this.stakers_current--;
	if (this.stakers_pending == 0) {
	  this.staking_round--;
	} 

      }
    }
  }



  returnWinningStaker(gt, gtrandom=null, bid) {

    if (gtrandom == null) { gtrandom = gt.random; }

//console.log("\nReturn Winning Staker fnct");
//console.log(JSON.stringify(this.index.stakers));

    //
    // pick winning staker
    //
    let results = {};
        results.publickey       = "";
        results.staker_bid	= -1;
        results.staker_sid	= -1;
        results.staker_pos	= -1;

    if (gt != null) { if (gt.publickey != undefined) { results.publickey = gt.publickey; } }

    //
    // pick a random block from the blockchain
    //
    let winnerHash = this.app.crypto.hash(gtrandom).slice(0, 12);
    let winnerNum  = parseInt(winnerHash, 16); // 16 because number is hex
    let winner_pos = (winnerNum % this.index.blocks.length);
    let winner_bid = -1;
    let winner_sid = -1;
    let winner_slip = null;

    //
    // roll down to first block on longest chain
    //
    for (let i = winner_pos, k = 0; i >= 0 && k == 0; i--) {
      if (this.bsh_lc_hmap[this.index.blocks[i].returnHash()] == 1) {
        if (k == winner_bid) {
	  winner_pos = i;
	  k = 1;
        }
      }
    }

    winner_bid = this.index.blocks[winner_pos].block.id;

    //
    // pick staker slip
    //
    let winnerHash2 = this.app.crypto.hash(winnerHash).slice(0, 12);
    let winnerNum2  = parseInt(winnerHash2, 16); // 16 because number is hex
    winner_sid = (winnerNum2 % this.index.stakers[winner_pos].length);


    //
    // if slip is unspent, pick it...
    //
    let is_slip_spent = 0;
    if (this.index.stakers[winner_pos].length == 0) {
      is_slip_spent = 1;
    } else {
      if (this.index.stakers[winner_pos][winner_sid].paid == -1) {
        is_slip_spent = 1;
      }
    }

    //
    //
    //
    if (is_slip_spent == 0) {
      winner_slip = this.index.stakers[winner_pos][winner_sid];
    }

    //
    // or continue from last slip
    //
    else {

      //
      // start at last staking pos
      //
      let pos_of_last_staking_block = this.returnBlockPos(winner_bid, this.last_staker_pos);
      if (pos_of_last_staking_block == -1) {
	console.log("ERROR 5823409: cannot find last staking slip that won!");
	process.exit();
      }

      let sid_of_last_staking_block = this.index.stakers[pos_of_last_staking_block].length-1;


      for (let i = sid_of_last_staking_block; i >= 0; i--) {
	let stkr = this.index.stakers[pos_of_last_staking_block][sid_of_last_staking_block];
        if (stkr.paid >= this.staking_round) {

	  //
	  // found the last paid slip
	  //
	  let next_sid = stkr.next_sid;
	  let next_bid = stkr.next_bid;;
          let next_pos = this.returnBlockPos(stkr.next_bid, i);
	  
	  //
	  // winner
	  //
	  winner_sid = next_sid;
	  winner_bid = next_bid;
	  winner_pos = next_pos;
	  winner_slip = this.index.stakers[winner_pos][winner_sid];

	} else {

	  //
	  // winner
	  //
	  winner_sid = sid_of_last_staking_block;
	  winner_bid = this.index.blocks[pos_of_last_staking_block].block.id;;
	  winner_pos = pos_of_last_staking_block;
	  winner_slip = this.index.stakers[winner_pos][winner_sid];

	}
      }
    }

    results.publickey = winner_slip.slip.add;
    results.staker_bid = winner_bid;
    results.staker_sid = winner_sid;
    results.staker_pos = winner_pos;
    results.staker_slip = winner_slip.slip.returnSignatureSource();

    return results;
  } 
  

}

module.exports = Blockchain;

