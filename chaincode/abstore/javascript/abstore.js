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

  async charge(stub, args) {
    if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting 3');
    }

    let user = args[0];

    let Uservalbytes = await stub.getState(user);
    if (!Uservalbytes || Uservalbytes.length === 0) {
      throw new Error('Failed to get state of asset holder A');
    }
    let Userval = parseInt(Uservalbytes.toString());

    let amount = parseInt(args[1]);
    if (typeof amount !== 'number') {
      throw new Error('Expecting integer value for amount to be transaferred');
    }

    Userval = Userval + amount;
    console.info(util.format('Userval = %d\n', Userval));

    // Write the states back to the ledger
    await stub.putState(user, Buffer.from(Userval.toString()));
  }

  async init(stub, args) {
    if (args.length != 2) {
      return shim.error('Incorrect number of arguments. Expecting 6');
    }

    let user = args[0];

    let userPurchase = user + '_userPurchases';

    let userval = args[1];

    let purchase= {
      purchases: []
    };


    if (typeof parseInt(userval) !== 'number') {
      return shim.error('Expecting integer value for asset holding');
    }

    let purchaseJSON = JSON.stringify(purchase);

    await stub.putState(user, userval);
    await stub.putState(userPurchase, Buffer.from(purchaseJSON));
  }

  async invoke(stub, args) {
    if (args.length != 3) {
      throw new Error('Incorrect number of arguments. Expecting 3');
    }

    let A = args[0];
    let B = args[1];
    let Admin = 'admin';
    if (!A || !B) {
      throw new Error('asset holding must not be empty');
    }

    // Get the state from the ledger
    let Avalbytes = await stub.getState(A);
    if (!Avalbytes || Avalbytes.length === 0) {
      throw new Error('Failed to get state of asset holder A');
    }
    let Aval = parseInt(Avalbytes.toString());

    let Bvalbytes = await stub.getState(B);
    if (!Bvalbytes || Bvalbytes.length === 0) {
      throw new Error('Failed to get state of asset holder B');
    }

    let Bval = parseInt(Bvalbytes.toString());

    let Adminvalbytes = await stub.getState(Admin);
    if (!Adminvalbytes) {
      throw new Error('Failed to get state of asset holder Admin');
    }
    let Adminval = parseInt(Adminvalbytes.toString());
    // Perform the execution
    let amount = parseInt(args[2]);
    if (typeof amount !== 'number') {
      throw new Error('Expecting integer value for amount to be transaferred');
    }

    Aval = Aval - amount;
    Bval = Bval + amount - (amount / 10);
    Adminval = Adminval + (amount / 10);
    console.info(util.format('Aval = %d, Bval = %d, Adminval = %d\n', Aval, Bval, Adminval));

    // Write the states back to the ledger
    await stub.putState(A, Buffer.from(Aval.toString()));
    await stub.putState(B, Buffer.from(Bval.toString()));
    await stub.putState(Admin, Buffer.from(Adminval.toString()));
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

  async initItem(stub, args) {
    if (args.length != 4) {
      throw new Error('Incorrect number of arguments. Expecting 4');
    }
  
    let itemName = args[0];
    let styleNum = args[1];
    let brand = args[2];
    let inventory = args[3];
  
    if (!itemName || !styleNum || !brand || !inventory) {
      throw new Error('Item details must not be empty');
    }
  
    // Generate itemId using current time and seller information
    let itemId = `${brand}_${styleNum}`;
  
    let item = {
      id: itemId,
      name: itemName,
      inventory: parseFloat(inventory),
    };
  
    let itemJSON = JSON.stringify(item);
  
    await stub.putState(itemId, Buffer.from(itemJSON));
  }

  async purchaseItem(stub, args) {
    if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting 2');
    }
  
    let user = args[0];
    let userPurchase = user + '_userPurchases';
    let itemId = args[1];
  
    // 원장으로부터 사용자 상태 가져오기
    let userBytes = await stub.getState(userPurchase);
    if (!userBytes || userBytes.length === 0) {
      throw new Error(`User ${user} does not exist`);
    }
    let userObj = JSON.parse(userBytes.toString());
  
    // 원장으로부터 아이템 상태 가져오기
    let itemBytes = await stub.getState(itemId);
    if (!itemBytes || itemBytes.length === 0) {
      throw new Error(`Item ${itemId} does not exist`);
    }
    let itemObj = JSON.parse(itemBytes.toString());
  
    // 아이템 재고 감소
    if (itemObj.inventory <= 0) {
      throw new Error(`Item ${itemId} is out of stock`);
    }
    itemObj.inventory -= 1;
  
    // 사용자의 구매 목록에 아이템 추가
    userObj.purchases.push(itemId);
  
    // 상태 업데이트
    await stub.putState(userPurchase, Buffer.from(JSON.stringify(userObj)));
    await stub.putState(itemId, Buffer.from(JSON.stringify(itemObj)));
  }

  async queryItem(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting item ID');
    }
  
    let itemId = args[0];
  
    // Get the state from the ledger
    let itemBytes = await stub.getState(itemId);
    if (!itemBytes) {
      throw new Error('Failed to get state for ' + itemId);
    }
  
    let item = JSON.parse(itemBytes.toString());
  
    console.info('Query Item Response:');
    console.info(item);
  
    return Buffer.from(JSON.stringify(item));
  }

  async queryPurchase(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting item ID');
    }
  
    let user = args[0];
    let userPurchase = user + '_userPurchases';
  
    // Get the state from the ledger
    let userBytes = await stub.getState(userPurchase);
    if (!userBytes) {
      throw new Error('Failed to get state for ' + userPurchase);
    }
  
    let purchase = JSON.parse(userBytes.toString());
  
    console.info('Query purchase Response:');
    console.info(purchase);
  
    return Buffer.from(JSON.stringify(purchase));
  }

};

shim.start(new ABstore());