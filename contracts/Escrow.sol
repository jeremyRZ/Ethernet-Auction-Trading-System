pragma solidity ^0.5.16;
contract Escrow {
 uint public productId;
 address public buyer;
 address public seller;
 address public arbiter;
 uint public amount;
 bool public fundsDisbursed;
 mapping (address => bool) releaseAmount;
 uint public releaseCount;
 mapping (address => bool) refundAmount;
 uint public refundCount;

 event CreateEscrow(uint _productId, address _buyer, address _seller, address _arbiter);
 event UnlockAmount(uint _productId, string _operation, address _operator);
 event DisburseAmount(uint _productId, uint _amount, address _beneficiary);

 constructor(uint _productId, address _buyer, address _seller, address _arbiter) payable public {
  productId = _productId;
  buyer = _buyer;
  seller = _seller;
  arbiter = _arbiter;
  amount = msg.value;
  fundsDisbursed = false;
  emit CreateEscrow(_productId, _buyer, _seller, _arbiter);
 }

 function releaseAmountToSeller(address caller) public {
  require(!fundsDisbursed);
  if ((caller == buyer || caller == seller || caller == arbiter) && releaseAmount[caller] != true) {
   releaseAmount[caller] = true;
   releaseCount += 1;
   emit UnlockAmount(productId, "release", caller);
  }

  if (releaseCount == 2) {
   address(uint160(seller)).transfer(amount);
   fundsDisbursed = true;
   emit DisburseAmount(productId, amount, seller);
  }
 }

 function refundAmountToBuyer(address caller) public {
  require(!fundsDisbursed);
  if ((caller == buyer || caller == seller || caller == arbiter) && refundAmount[caller] != true) {
   refundAmount[caller] = true;
   refundCount += 1;
   emit UnlockAmount(productId, "refund", caller);
  }

  if (refundCount == 2) {
   address(uint160(buyer)).transfer(amount);
   fundsDisbursed = true;
   emit DisburseAmount(productId, amount, buyer);
  }
 }
     function escrowInfo() public view returns (address, address, address, bool, uint, uint){
        return (seller, buyer, arbiter, fundsDisbursed, releaseCount, refundCount);
    }
}