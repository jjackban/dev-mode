/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

const shim = require('fabric-shim');
const util = require('util');

const ABstore = class {

  // Initialize the chaincode
  async Init(stub) {
    console.info('========= ABstore Init =========');
    let ret = stub.getFunctionAndParameters();
    console.info(ret);
    try {
      await stub.putState("Admin",Buffer.from("0"));
      return shim.success();
    } catch (err) {
      return shim.error(err);
    }
  }

  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);
    let method = this[ret.fcn];
    if (!method) {
      console.log('no method of name:' + ret.fcn + ' found');
      return shim.success();
    }
    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  async init(stub, args) {
    // initialise only if 6 parameters passed.
    if (args.length != 2) {
      return shim.error('Incorrect number of arguments. Expecting 2');
    }

    let A = args[0];
    let Aval = args[1];

    if (typeof parseInt(Aval) !== 'number' ) {
      return shim.error('Expecting integer value for asset holding');
    }
    
    await stub.putState(A, Buffer.from(Aval));
   
  }

  async transfer(stub, args) {
  if (args.length != 3) {
    throw new Error('Incorrect number of arguments. Expecting 3');
  }

  let sender = args[0];
  let receiver = args[1];
  let amount = parseInt(args[2]);

  // 90% transfer plus
  let transferAmount = amount * 0.9;
  let fee = amount - transferAmount;

  if (isNaN(transferAmount) || transferAmount <= 0) {
    throw new Error('Expecting positive integer value for transfer amount');
  }

  let senderBalanceBytes = await stub.getState(sender);
  if (!senderBalanceBytes || senderBalanceBytes.length === 0) {
    throw new Error('Failed to get state of sender');
  }
  let senderBalance = parseInt(senderBalanceBytes.toString());

  let receiverBalanceBytes = await stub.getState(receiver);
  if (!receiverBalanceBytes || receiverBalanceBytes.length === 0) {
    throw new Error('Failed to get state of receiver');
  }
  let receiverBalance = parseInt(receiverBalanceBytes.toString());

  if (senderBalance < amount) {
    throw new Error('Sender does not have enough balance');
  }

  senderBalance -= amount;
  receiverBalance += transferAmount;

  await stub.putState(sender, Buffer.from(senderBalance.toString()));
  await stub.putState(receiver, Buffer.from(receiverBalance.toString()));

  console.info(`Transferred ${transferAmount} (90% of ${amount}) from ${sender} to ${receiver}`);
}

  // Deletes an entity from state
  async delete(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting 1');
    }

    let A = args[0];

    // Delete the key from the state in ledger
    await stub.deleteState(A);
  }
  
  async query(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting name of the person to query')
    }

    let jsonResp = {};
    let A = args[0];

    // Get the state from the ledger
    let Avalbytes = await stub.getState(A);
    if (!Avalbytes) {
      jsonResp.error = 'Failed to get state for ' + A;
      throw new Error(JSON.stringify(jsonResp));
    }

    jsonResp.name = A;
    jsonResp.amount = Avalbytes.toString();
    console.info('Query Response:');
    console.info(jsonResp);
    return Avalbytes;
  }
};

shim.start(new ABstore());
