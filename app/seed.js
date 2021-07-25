Eutil = require('ethereumjs-util');
EcommerceStore = artifacts.require("./EcommerceStore.sol");
module.exports = function(callback) {
 current_time = Math.round(new Date() / 1000);
 var stuffPrice = '0.0001';
 amt_1 = web3.utils.toWei(stuffPrice, 'ether');
 EcommerceStore.deployed().then(function(i) {i.addProductToStore('fifa21', 'Game Photo', 'QmV8AJFej4n162ZvrftYGsocVVRgjBHn28j5vaALZ1xZkz', 'QmNPF8pxvEu38Gk7AXLwxk1qe2WsjG5PTPFtsWwumHgfDN', current_time, current_time + 86400, 5*amt_1, 1).then(function(f) {console.log(f)})});
 EcommerceStore.deployed().then(function(i) {i.addProductToStore('Ronaldo', 'Game Photo', 'QmPVnVfTxCAciu3e1nmZtRdYbAjjQgGq77hSKzVjRp8Csw', 'QmNPF8pxvEu38Gk7AXLwxk1qe2WsjG5PTPFtsWwumHgfDN', current_time, current_time + 86400, 5*amt_1, 1).then(function(f) {console.log(f)})});
 EcommerceStore.deployed().then(function(i) {i.addProductToStore('Lin', 'Game Photo', 'QmX8Xgj8CgFTdhFjWSVN87ueK6D4J8P85n7mv6bAw3b1mc', 'QmNPF8pxvEu38Gk7AXLwxk1qe2WsjG5PTPFtsWwumHgfDN', current_time, current_time + 86400, 5*amt_1, 1).then(function(f) {console.log(f)})});
}