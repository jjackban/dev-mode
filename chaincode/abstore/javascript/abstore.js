/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

const shim = require('fabric-shim'); // Hyperledger Fabric Shim API를 임포트
const util = require('util'); // 유틸리티 모듈을 임포트

// ABstore 클래스 정의
const ABstore = class {

  // 체인코드 초기화 함수
  async Init(stub) {
    console.info('========= ABstore Init ========='); // 초기화 로그 출력
    let ret = stub.getFunctionAndParameters(); // 호출된 함수와 매개변수를 가져옴
    console.info(ret); // 함수와 매개변수 정보를 로그로 출력
    try {
      return shim.success(); // 성공 상태 반환
    } catch (err) {
      return shim.error(err); // 오류 발생 시 오류 상태 반환
    }
  }

  // 체인코드 호출 함수
  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters(); // 호출된 함수와 매개변수를 가져옴
    console.info(ret); // 함수와 매개변수 정보를 로그로 출력
    let method = this[ret.fcn]; // 호출된 함수 이름으로 메서드 찾기
    if (!method) { // 메서드가 존재하지 않을 경우
      console.log('no method of name:' + ret.fcn + ' found'); // 오류 로그 출력
      return shim.success(); // 기본 성공 상태 반환
    }
    try {
      let payload = await method(stub, ret.params); // 메서드 실행 및 결과 반환
      return shim.success(payload); // 성공 상태 반환
    } catch (err) {
      console.log(err); // 오류 로그 출력
      return shim.error(err); // 오류 상태 반환
    }
  }

  // 초기화 메서드, 6개의 매개변수가 필요한 경우에만 초기화
  async init(stub, args) {
    if (args.length != 6) { // 매개변수가 6개가 아닌 경우
      return shim.error('Incorrect number of arguments. Expecting 6'); // 오류 반환
    }

    let A = args[0]; // 첫 번째 매개변수를 변수 A에 할당
    let Aval = args[1]; // 두 번째 매개변수를 변수 Aval에 할당


    if (typeof parseInt(Aval) !== 'number') { // Aval 또는 Bval이 숫자가 아닌 경우
      return shim.error('Expecting integer value for asset holding'); // 오류 반환
    }

    await stub.putState(A, Buffer.from(Aval)); // A의 상태를 원장에 저장
  }

  // 자산 이전을 수행하는 메서드 (거래)
  async invoke(stub, args) {
    if (args.length != 3) { // 매개변수가 3개가 아닌 경우
      throw new Error('Incorrect number of arguments. Expecting 3'); // 오류 발생
    }

    let A = args[0]; // 첫 번째 매개변수를 변수 A에 할당
    let B = args[1]; // 두 번째 매개변수를 변수 B에 할당
    if (!A || !B) { // A 또는 B가 없는 경우
      throw new Error('asset holding must not be empty'); // 오류 발생
    }

    // 원장에서 상태 가져오기 
    let Avalbytes = await stub.getState(A);
    if (!Avalbytes) { // A의 상태를 가져오지 못한 경우
      throw new Error('Failed to get state of asset holder A'); // 오류 발생
    }
    let Aval = parseInt(Avalbytes.toString()); // 상태 값을 정수로 변환

    let Bvalbytes = await stub.getState(B);
    if (!Bvalbytes) { // B의 상태를 가져오지 못한 경우
      throw new Error('Failed to get state of asset holder B'); // 오류 발생
    }
    let Bval = parseInt(Bvalbytes.toString()); // 상태 값을 정수로 변환

    let amount = parseInt(args[2]); // 세 번째 매개변수를 정수로 변환
    if (typeof amount !== 'number') { // amount가 숫자가 아닌 경우
      throw new Error('Expecting integer value for amount to be transaferred'); // 오류 발생
    }

    Aval = Aval - amount; // A의 자산에서 amount만큼 감소
    Bval = Bval + amount; // B의 자산에서 amount만큼 증가
    console.info(util.format('Aval = %d, Bval = %d\n', Aval, Bval)); // 변환된 자산 로그 출력

    // 상태를 원장에 다시 쓰기
    await stub.putState(A, Buffer.from(Aval.toString())); // A의 새로운 상태 저장
    await stub.putState(B, Buffer.from(Bval.toString())); // B의 새로운 상태 저장
  }

  // 상태에서 엔티티 삭제 메서드 (사용자 삭제)
  async delete(stub, args) {
    if (args.length != 1) { // 매개변수가 1개가 아닌 경우
      throw new Error('Incorrect number of arguments. Expecting 1'); // 오류 발생
    }

    let A = args[0]; // 첫 번째 매개변수를 변수 A에 할당

    // 원장의 상태에서 키 삭제
    await stub.deleteState(A); // A의 상태 삭제
  }

  // 상태 조회 메서드 (정보 출력)
  async query(stub, args) {
    if (args.length != 1) { // 매개변수가 1개가 아닌 경우
      throw new Error('Incorrect number of arguments. Expecting name of the person to query'); // 오류 발생
    }

    let jsonResp = {}; // 응답 객체 생성
    let A = args[0]; // 첫 번째 매개변수를 변수 A에 할당

    // 원장에서 상태 가져오기
    let Avalbytes = await stub.getState(A);
    if (!Avalbytes) { // A의 상태를 가져오지 못한 경우
      jsonResp.error = 'Failed to get state for ' + A; // 오류 메시지 설정
      throw new Error(JSON.stringify(jsonResp)); // 오류 발생
    }

    jsonResp.name = A; // 응답 객체에 이름 설정
    jsonResp.amount = Avalbytes.toString(); // 응답 객체에 자산 설정
    console.info('Query Response:'); // 조회 응답 로그 출력
    console.info(jsonResp); // 응답 객체 로그 출력
    return Avalbytes; // A의 상태 반환
  }
};

// 체인코드 시작
shim.start(new ABstore());
