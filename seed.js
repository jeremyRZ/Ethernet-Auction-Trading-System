Eutil = require('ethereumjs-util');
EcommerceStore = artifacts.require("./EcommerceStore.sol");
module.exports = function(callback) {
 current_time = Math.round(new Date() / 1000);
 var stuffPrice = '0.0001';
 amt_1 = web3.utils.toWei(stuffPrice, 'ether');
 EcommerceStore.deployed().then(function(i) {i.addProductToStore('fifa21', 'Game Photo', 'QmV8AJFej4n162ZvrftYGsocVVRgjBHn28j5vaALZ1xZkz', 'QmNPF8pxvEu38Gk7AXLwxk1qe2WsjG5PTPFtsWwumHgfDN', current_time, current_time + 86400, 5*amt_1, 1).then(function(f) {console.log(f)})});
 EcommerceStore.deployed().then(function(i) {i.addProductToStore('Lin photo1', 'Photo', 'QmTAzYJeq4ifZFENFtmKQ8cXHdPiFb6PBDFfgn1QBttPii', 'QmNPF8pxvEu38Gk7AXLwxk1qe2WsjG5PTPFtsWwumHgfDN', current_time, current_time + 86400, 5*amt_1, 1).then(function(f) {console.log(f)})});
 EcommerceStore.deployed().then(function(i) {i.addProductToStore('Lin photo2', 'Photo', 'Qmew5nqVCCdvquybHko5MHCVhF2ZJsmiEFq4cx2wYqEoGu', 'QmNPF8pxvEu38Gk7AXLwxk1qe2WsjG5PTPFtsWwumHgfDN', current_time, current_time + 86400, 5*amt_1, 1).then(function(f) {console.log(f)})});
}