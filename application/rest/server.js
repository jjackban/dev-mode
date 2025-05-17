const express = require('express');
const app = express();
const cors = require('cors');
let path = require('path');
let sdk = require('./sdk');

const port = 8001;
const HOST = '0.0.0.0';
app.use(cors()); // <- 이 한 줄 추가
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.get('/init', function (req, res) {
   let user = req.query.user;
   let userval = req.query.userval;
   
   let args = [user, userval];
   sdk.send(false, 'init', args, res);
});
// 예시 라우트
app.post('/addUser', (req, res) => {
   // 로직 수행 (예: DB 저장, 체인코드 실행 등)
   console.log('addUser called with:', req.body);
   res.json({ result: 'User added' });
});

app.get('/invoke', function (req, res) {
   let sender = req.query.sender;
   let reciever = req.query.reciever;
   let value = req.query.value;
   
   let args = [sender, reciever, value];
   sdk.send(false, 'invoke', args, res);
});

app.get('/query', function (req, res) {
   let name = req.query.name;
   let args = [name];
   sdk.send(true, 'query', args, res);
});

app.get('/delete', (req, res) => {
   let name = req.query.name;
   let args = [name];
   sdk.send(false, 'delete', args, res)
});

app.use(express.static(path.join(__dirname, '../client')));
app.listen(port, () => {
   console.log(`Server listening at http://0.0.0.0:${port}`);
 });