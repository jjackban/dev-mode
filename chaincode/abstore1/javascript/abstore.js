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
      await stub.putState("admin", Buffer.from("0"));
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
    // initialise only if 2 parameters passed.
    if (args.length != 2) {
      return shim.error('Incorrect number of arguments. Expecting 2');
    }

    let A = args[0];
    let Aval = args[1];

    if (typeof parseInt(Aval) !== 'number') {
      return shim.error('Expecting integer value for asset holding');
    }

    await stub.putState(A, Buffer.from(Aval));
  }

  async invoke(stub, args) {
    if (args.length != 3) {
      throw new Error('Incorrect number of arguments. Expecting 3');
    }

    let A = args[0];
    let B = args[1];
    let Admin = "admin";
    if (!A || !B) {
      throw new Error('asset holding must not be empty');
    }

    // Get the state from the ledger
    let Avalbytes = await stub.getState(A);
    if (!Avalbytes) {
      throw new Error('Failed to get state of asset holder A');
    }
    let Aval = parseInt(Avalbytes.toString());

    let Bvalbytes = await stub.getState(B);
    if (!Bvalbytes) {
      throw new Error('Failed to get state of asset holder B');
    }

    let Bval = parseInt(Bvalbytes.toString());

    let AdminValbytes = await stub.getState(Admin);
    if (!AdminValbytes) {
      throw new Error('Failed to get state of asset Admin');
    }

    let AdminVal = parseInt(Bvalbytes.toString());

    // Perform the execution
    let amount = parseInt(args[2]);
    if (typeof amount !== 'number') {
      throw new Error('Expecting integer value for amount to be transaferred');
    }

    Aval = Aval - amount;
    Bval = Bval + amount - ( amount / 10 );
    AdminVal = AdminVal + ( amount / 10 );
    console.info(util.format('Aval = %d, Bval = %d, AdminVal = %d\n', Aval, Bval, AdminVal));

    // Write the states back to the ledger
    await stub.putState(A, Buffer.from(Aval.toString()));
    await stub.putState(B, Buffer.from(Bval.toString()));
    await stub.putState(Admin, Buffer.from(AdminVal.toString()));

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

  // query callback representing the query of a chaincode
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

  async transferPoint(stub, args) {
    if (args.length !== 4) {
        throw new Error('Incorrect number of arguments. Expecting 4');
    }
    
    const chaincodeName = args[0];
    const from = args[1];
    const amount = parseInt(args[3]);

    const fromAsBytes = await stub.getState(from);
    if (!fromAsBytes || fromAsBytes.length === 0) {
        throw new Error(`${from} does not exist`);
    }

    const fromPoint = parseInt(fromAsBytes.toString());
    if (fromPoint < amount) {
        throw new Error('Not enough points');
    }

    var valByte = [];
    for (var i = 1; i < args.length; i++) {
        valByte[i] = Buffer.from(args[i]);
    }

    const invokeResponse = await stub.invokeChaincode(chaincodeName, ['receivePoint', valByte]);
    if (invokeResponse.status !== 200) {
        throw new Error(`Failed to invoke chaincode ${chaincodeName}: ${invokeResponse.message}`);
    }

    fromPoint -= amount;
    // Write the states back to the ledger
    await stub.putState(from, Buffer.from(fromAsBytes.toString()));

    return invokeResponse.payload;
  }

  async receivePoint(stub, args) {
    if (args.length !== 3) {
        throw new Error('Incorrect number of arguments. Expecting 3');
    }

    console.info(util.format('arg1 = %d, arg2 = %d, arg3 = %d\n', args[0], args[1], args[2]));
    const to = args[1];
    const amount = parseInt(args[2]);

    const toAsBytes = await stub.getState(to);
    if (!toAsBytes || toAsBytes.length === 0) {
        throw new Error(`${to} does not exist`);
    }

    const toPoint = parseInt(toAsBytes.toString());
    toPoint += amount;
    await stub.putState(to, Buffer.from(toPoint.toString()));

    return Buffer.from(toPoint.amount.toString());
  }
};

shim.start(new ABstore());
