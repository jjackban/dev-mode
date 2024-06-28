const express = require('express');
const app = express();
let path = require('path');
let sdk = require('./sdk');

const PORT = 8001;
const HOST = '0.0.0.0';
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.get('/init', function (req, res) {
   let user = req.query.user;
   let userval = req.query.userval;
   
   let args = [user, userval];
   sdk.send(false, 'init', args, res);
});

app.get('/charge', function (req, res) {
   let user = req.query.user;
   let userval = req.query.userval;
   
   let args = [user, userval];
   sdk.send(false, 'charge', args, res);
});

app.get('/initItem', function (req, res) {
   let itemName = req.query.itemName;
   let styleNum = req.query.styleNum;
   let brand = req.query.brand;
   let inventory = req.query.inventory;
   
   let args = [itemName, styleNum, brand, inventory];
   sdk.send(false, 'initItem', args, res);
});

app.get('/purchaseItem', function (req, res) {
   let user = req.query.user;
   let itemId = req.query.itemId;
   
   let args = [user, itemId];
   sdk.send(false, 'purchaseItem', args, res);
});

app.get('/invoke', function (req, res) {
   let sender = req.query.sender;
   let reciever = req.query.reciever;
   let value = req.query.value;
   
   let args = [sender, reciever, value];
   sdk.send(false, 'invoke', args, res);
});

app.get('/queryitem', function (req, res) {
   let itemId = req.query.itemId;
   let args = [itemId];
   sdk.send(true, 'queryItem', args, res);
});

app.get('/querypurchase', function (req, res) {
   let user = req.query.user;
   let args = [user];
   sdk.send(true, 'queryPurchase', args, res);
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
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);