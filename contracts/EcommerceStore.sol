pragma solidity ^0.5.16;
//EcommerceStore
import "./Escrow.sol";

contract EcommerceStore {
    //定义枚举ProductStatus
    enum ProductStatus {
        Open, //Auction Start
        Sold, //Sold, transaction successful
        Unsold //sold, the transaction was not successful
    }
    enum ProductCondition {
        New, //Whether the auctioned goods are new
        Used //Whether the auctioned goods have been used
    }
    // Used to count the number of items as ID
    uint public productIndex; 
    //Correspondence between product Id and wallet address
    mapping(uint => address) productIdInStore;
    // Find the corresponding product collection by address
    mapping(address => mapping(uint => Product)) stores;
    mapping (uint => address) productEscrow;
 
        //Add bidder information
    struct Bid {
        address bidder;
        uint productId;
        uint value;
        bool revealed; //Has the bid been unveiled
    }
    struct Product {
        uint id;                 //Product id
        string name;             //Product name
        string category ;       //Product Categories
        string imageLink ;       //Image Hash
        string descLink;        // Hash of image description information
        uint auctionStartTime; //Start bidding time
        uint auctionEndTime;    //Bidding End Time
        uint startPrice;       //Auction Price  
        address highestBidder ; //Highest bidder, winner's wallet address
        uint highestBid ;       //The price of the winning bid
        uint secondHighestBid ; //Second place in the bidding price
        uint totalBids ;        //Total number of bidders
        ProductStatus status;    //Status
        ProductCondition condition ;  //New and old product identification
        mapping(address => mapping(bytes32 => Bid)) bids;// Store all bidder information
 
    }
    constructor ()public{
        productIndex = 0;
    }


    //Adding goods to the blockchain
    function addProductToStore(string memory  _name, string memory _category, string memory _imageLink, string memory _descLink, uint _auctionStartTime, uint _auctionEndTime ,uint _startPrice, uint  _productCondition) public  {
        //The start time needs to be less than the end time
        require(_auctionStartTime < _auctionEndTime,"The start time needs to be less than the end time");
        //Product ID self-increment
        productIndex += 1;
        Product memory product = Product(productIndex,_name,_category,_imageLink,_descLink,_auctionStartTime,_auctionEndTime,_startPrice,address(0),0,0,0,ProductStatus.Open,ProductCondition(_productCondition));
        stores[msg.sender][productIndex] = product;
        productIdInStore[productIndex] = msg.sender;
    }


    //Read product information by product ID
    function getProduct(uint _productId)  public view returns (uint,string memory, string memory,string memory,string memory,uint ,uint,uint, ProductStatus, ProductCondition)  {
        Product memory product = stores[productIdInStore[_productId]][_productId];
        return (product.id, product.name,product.category,product.imageLink,product.descLink,product.auctionStartTime,product.auctionEndTime,product.startPrice,product.status,product.condition);
    }
    //Bid, pass in the parameters for the product Id and Hash value (the actual bid price and the combination of the secret key word Hash), need to add Payable
    function bid(uint _productId, bytes32 _bid) payable public returns (bool) {
        Product storage product = stores[productIdInStore[_productId]][_productId];
        require(now >= product.auctionStartTime, "Product bidding time has not yet arrived, not yet started, please wait ...");
        require(now <= product.auctionEndTime,"Commodity bidding has ended");
        require(msg.value >= product.startPrice,"The set virtual price cannot be lower than the opening bid price");
        require(product.bids[msg.sender][_bid].bidder == address(0)); //Before submitting a bid, you must ensure that the value of bid is empty
        //Save the bidder information
        product.bids[msg.sender][_bid] = Bid(msg.sender, _productId, msg.value,false);
        //Incremental number of commodity bids
        product.totalBids += 1;
        //Return to Bid Success
        return true;
    }

    //Announcement, method of unveiling the bid
    function revealBid(uint _productId, string memory _amount, string memory _secret) public {
        //Get product information by product ID
        Product storage product = stores[productIdInStore[_productId]][_productId];
        //Make sure the current time is greater than the bid end time
        require(now > product.auctionEndTime,"Bidding has not yet ended and it is not time to announce the price");
        // Encryption of bid prices with keyword keys
        bytes32 sealedBid = keccak256(abi.encode(_amount,_secret));
        //Obtain bidder information
        Bid memory bidInfo = product.bids[msg.sender][sealedBid];
        //Determine if a wallet address exists, wallet address 0x4333 uint160 of wallet type
        require(bidInfo.bidder > address(0),"Wallet address does not exist"); 
        //Determine if the bid has been announced
        require(bidInfo.revealed == false,"Already unveiled");
        // Defining the refund of the system
        uint refund;
        uint amount = stringToUint(_amount);
        // bidInfo.value Prices used to confuse competitors
        if (bidInfo.value < amount) { //If the value of bidInfo.value is < the actual bid price, then all refunds are returned and the bid is invalid
            refund = bidInfo.value;
        }else { //If it is a valid bid, refer to the following classification
            if (address(product.highestBidder) == address(0)) { //The first person to participate in the announcement, at which point the value is 0
                //Assign the bidder's address to the highest bidder's address
                product.highestBidder = msg.sender;
                // Use the bidder's price as the highest price
                product.highestBid = amount;
                // Set the starting auction price of the item as the second highest price
                product.secondHighestBid = product.startPrice;
                // The extra money as a refund, such as bidInfo.value = 20,amount = 12, then the refund 8
                refund = bidInfo.value - amount;
            }else { //At this point the participant is not the first to participate in the announcement
                // amount = 15 , bidInfo.value = 25,amount > 12 
                if (amount > product.highestBid) {
                    // Assign the original highest-priced address to the second highest-priced address
                    product.secondHighestBid = product.highestBid;
                    // Refund the original highest bid to the original highest bid address
                    
                    address(uint160(product.highestBidder)).transfer(product.highestBid);
                    // Use the current bidder's address as the highest bid address
                    product.highestBidder = msg.sender;
                    // Use the current bid as the highest price for 15
                    product.highestBid = amount;
                    //At this point the refund is 20 - 15 = 5
                    refund = bidInfo.value - amount;
                }else if (amount > product.secondHighestBid) {
                    //
                    product.secondHighestBid = amount;
                    //Refund of all bids
                    refund = amount;
                }else { //If the bid is lower than the second highest bid, the bid will be refunded directly
                    refund = amount;
                }
            }
            if (refund > 0){ //Refunds
                msg.sender.transfer(refund);
                product.bids[msg.sender][sealedBid].revealed = true;
            }
        }
    }
 

    //Get information about the winner of the bid
    function highestBidderInfo (uint _productId)public view returns (address, uint ,uint) {
        Product memory product = stores[productIdInStore[_productId]][_productId];
        return (product.highestBidder,product.highestBid,product.secondHighestBid);
    }    
    //Number of people getting involved in the bidding
    function  totalBids(uint _productId) view public returns (uint) {
        Product memory product = stores[productIdInStore[_productId]][_productId];
        return  product.totalBids;
    }
    //String to uint type
    function stringToUint(string memory s) pure private returns (uint) {
        bytes memory b = bytes(s);
        uint result = 0 ;
        for (uint i = 0; i < b.length; i++ ){
            if (b[i] >=0x30 && b[i] <=0x39){
                result = result * 10  + (uint(uint8(b[i])) - 48);
            }
        }
        return result;
    }
function finalizeAuction(uint _productId) public {
 Product memory product = stores[productIdInStore[_productId]][_productId];
 // 48 hours to reveal the bid
 require(now > product.auctionEndTime);
 require(product.status == ProductStatus.Open);
 require(product.highestBidder != msg.sender);
 require(productIdInStore[_productId] != msg.sender);

 if (product.totalBids == 0) {
  product.status = ProductStatus.Unsold;
 } else {
  // Whoever finalizes the auction is the arbiter
  Escrow escrow = (new Escrow).value(product.secondHighestBid)(_productId, product.highestBidder, productIdInStore[_productId], msg.sender);
  productEscrow[_productId] = address(escrow);
  product.status = ProductStatus.Sold;
  // The bidder only pays the amount equivalent to second highest bidder
  // Refund the difference
  uint refund = product.highestBid - product.secondHighestBid;
  address(uint160(product.highestBidder)).transfer(refund);
 }
 stores[productIdInStore[_productId]][_productId] = product;

 }

 function escrowAddressForProduct(uint _productId) public view returns (address) {
 return productEscrow[_productId];
 }

 function escrowInfo(uint _productId) public view returns (address, address, address, bool, uint, uint) {
 return Escrow(productEscrow[_productId]).escrowInfo();
}

function releaseAmountToSeller(uint _productId) public {
  Escrow(productEscrow[_productId]).releaseAmountToSeller(msg.sender);
}

function refundAmountToBuyer(uint _productId) public {
  Escrow(productEscrow[_productId]).refundAmountToBuyer(msg.sender);
}
}