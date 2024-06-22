const shim = require('fabric-shim');
const util = require('util');

const ABstore = class {

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
    if (args.length != 2) {
      return shim.error('Incorrect number of arguments. Expecting 2');
    }

    let A = args[0];
    let Aval = args[1];

    if (isNaN(Aval)) {
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

    let AdminValbytes = await stub.getState("admin");
    if (!AdminValbytes) {
      throw new Error('Failed to get state of asset holder Admin');
    }
    let AdminVal = parseInt(AdminValbytes.toString());

    let amount = parseInt(args[2]);
    if (typeof amount !== 'number') { 
      throw new Error('Expecting integer value for amount to be transferred');
    }

    Aval = Aval - amount;
    Bval = Bval + amount - (amount/10);
    AdminVal = AdminVal + (amount/10);
    console.info(util.format('Aval = %d, Bval = %d, AdminVal = %d\n', Aval, Bval, AdminVal));

    await stub.putState(A, Buffer.from(Aval.toString()));
    await stub.putState(B, Buffer.from(Bval.toString()));
    await stub.putState(Admin, Buffer.from(AdminVal.toString()));
  }

  async delete(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting 1');
    }

    let A = args[0];

    await stub.deleteState(A);
  }

  async query(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting name of the person to query');
    }

    let jsonResp = {};
    let A = args[0];

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
