// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'
import ecommerce_store_artifacts from '../../build/contracts/EcommerceStore.json'

var EcommerceStore = contract(ecommerce_store_artifacts);

const ipfsAPI = require('ipfs-api');
const ethUtil = require('ethereumjs-util');

const ipfs = ipfsAPI({host: 'localhost', port: '5001', protocol: 'http'});

window.App = {
    start: function() {
     var self = this;
     EcommerceStore.setProvider(web3.currentProvider);
     renderStore();

     var reader;
     $("#product-image").change(function(event) {
        const file = event.target.files[0]
        reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
      });

      $("#add-item-to-store").submit(function(event){
        const req = $("#add-item-to-store").serialize();
        console.log("req:" , req);
        let params = JSON.parse('{"' + req.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
        console.log("params: ", params);
        let decodedParams = {};
        Object.keys(params).forEach(key=>{
            decodedParams[key] = decodeURIComponent(decodeURI(params[key]));
        });
        saveProduct(reader, decodedParams);
        event.preventDefault();
    });

    if($("#product-details").length > 0) {
        //This is product details page
        let productId = new URLSearchParams(window.location.search).get('id');
        renderProductDetails(productId);
       }
       //Submit a bid
       $("#bidding").submit(function(event) {
        $("#msg").hide();
        let amount = $("#bid-amount").val();
        let sendAmount = $("#bid-send-amount").val();
        let secretText = $("#secret-text").val();
        let sealedBid = '0x' + ethUtil.sha3(web3.toWei(amount, 'ether') + secretText).toString('hex');
        let productId = $("#product-id").val();
        console.log(sealedBid + " for " + productId);
        EcommerceStore.deployed().then(function(i) {
         i.bid(parseInt(productId), sealedBid, {value: web3.toWei(sendAmount), from: web3.eth.accounts[0], gas: 440000}).then(
          function(f) {
           $("#msg").html("Your bid has been successfully submitted!");
           $("#msg").show();
           console.log(f)
          }
         )
        });
        event.preventDefault();
     });
     //Reveal the offer
     $("#revealing").submit(function(event) {
        $("#msg").hide();
        let amount = $("#actual-amount").val();
        let secretText = $("#reveal-secret-text").val();
        let productId = $("#product-id").val();
        EcommerceStore.deployed().then(function(i) {
         i.revealBid(parseInt(productId), web3.toWei(amount).toString(), secretText, {from: web3.eth.accounts[0], gas: 440000}).then(
          function(f) {
           $("#msg").show();
           $("#msg").html("Your bid has been successfully revealed!");
           console.log(f)
          }
         )
        });
        event.preventDefault();
     });

     $("#finalize-auction").submit(function(event) {
        $("#msg").hide();
        let productId = $("#product-id").val();
        EcommerceStore.deployed().then(function(i) {
        i.finalizeAuction(parseInt(productId), {from: web3.eth.accounts[0], gas: 4400000}).then(
         function(f) {
         $("#msg").show();
         $("#msg").html("The auction has been finalized and winner declared.");
         console.log(f)
         location.reload();
         }
        ).catch(function(e) {
         console.log(e);
         $("#msg").show();
         $("#msg").html("The auction can not be finalized by the buyer or seller, only a third party aribiter can finalize it");
        })
        });
        event.preventDefault();
      });

      $("#release-funds").click(()=>{
        let productId = new URLSearchParams(window.location.search).get("id");
        EcommerceStore.deployed().then(i=>{
            $("#msg").html("Your transaction has been submitted. Please wait for few seconds for the confirmation").show();
            i.releaseAmountToSeller(productId, {from: web3.eth.accounts[0]}).then(res=>{
                location.reload();
            }).catch(err=>{
                console.log(err);
            });
        });
    });

    $("#refund-funds").click(()=>{
        let productId = new URLSearchParams(window.location.search).get("id");
        EcommerceStore.deployed().then(i=>{
            $("#msg").html("Your transaction has been submitted. Please wait for few seconds for the confirmation").show();
            i.refundAmountToBuyer(productId, {from: web3.eth.accounts[0]}).then(res=>{
                location.reload();
            }).catch(err=>{
                console.log();
            });
        });
        alert("refund funds!");
    });

    }
};

   function renderStore() {
    EcommerceStore.deployed().then(function(i) {
     i.getProduct.call(1).then(function(p) {
      $("#product-list").append(buildProduct(p));
     });
     i.getProduct.call(2).then(function(p) {
      $("#product-list").append(buildProduct(p));
     });
    });
   }

   function buildProduct(product) {
    let node = $("<div/>");
    node.addClass("col-sm-3 text-center col-margin-bottom-1");
    
    node.append("<img src='https://ipfs.io/ipfs/" + product[3] + "' width='150px' />");
    node.append("<div>" + product[1]+ "</div>");
    node.append("<div>" + product[2]+ "</div>");
    node.append("<div>" + product[5]+ "</div>");
    node.append("<div>" + product[6]+ "</div>");
    node.append("<div>Ether " + product[7] + "</div>");
    return node;
   }
   

   function saveImageOnIpfs(reader) {
    return new Promise(function(resolve, reject) {
     const buffer = Buffer.from(reader.result);
     ipfs.add(buffer)
     .then((response) => {
      console.log(response)
      resolve(response[0].hash);
     }).catch((err) => {
      console.error(err)
      reject(err);
     })
    })
   }
   
   function saveTextBlobOnIpfs(blob) {
    return new Promise(function(resolve, reject) {
     const descBuffer = Buffer.from(blob, 'utf-8');
     ipfs.add(descBuffer)
     .then((response) => {
      console.log(response)
      resolve(response[0].hash);
     }).catch((err) => {
      console.error(err)
      reject(err);
     })
    })
   }

   function saveProduct(reader, decodedParams) {
    let imageId, descId;
    saveImageOnIpfs(reader).then(function(id) {
      imageId = id;
      saveTextBlobOnIpfs(decodedParams["product-description"]).then(function(id) {
        descId = id;
         saveProductToBlockchain(decodedParams, imageId, descId);
      })
   })
  }
  
  function saveProductToBlockchain(params, imageId, descId) {
    console.log(params);
    let auctionStartTime = Date.parse(params["product-auction-start"]) / 1000;
    let auctionEndTime = auctionStartTime + parseInt(params["product-auction-end"]) * 24 * 60 * 60
  
    EcommerceStore.deployed().then(function(i) {
      i.addProductToStore(params["product-name"], params["product-category"], imageId, descId, auctionStartTime,
     auctionEndTime, web3.utils.toWei(params["product-price"], 'ether'), parseInt(params["product-condition"]), {from: web3.eth.accounts[0], gas: 440000}).then(function(f) {
     console.log(f);
     $("#msg").show();
     $("#msg").html("Your product was successfully added to your store!");
    })
   });
  }

  function renderProductDetails(productId){
    EcommerceStore.deployed().then(i=>{
        i.getProduct(productId).then(p=>{
            let desc = '';
            ipfs.cat(p[4]).then(file=>{
                desc = file.toString();
                $("#product-desc").append("<div>" + desc + "</div>");
            });
            $("#product-image").append("<img src='http://localhost:9001/ipfs/" + p[3] + "' width='250px' />");
            $("#product-name").html(p[1]);
            $("#product-price").html(displayPrice(p[7]));
            $("#product-id").val(p[0]);
            $("#product-auction-end").html(displayEndTime(p[6]));
            $("#bidding, #revealing, #finalize-auction, #escrow-info").hide();
            let currentTime = getCurrentTime();
            if(parseInt(p[8]) == 1)
                EcommerceStore.deployed().then(i=>{
                    $("#escrow-info").show();
                    i.highestBidderInfo(productId).then(info=>{
                        $("#product-status").html("Auction has ended. Product sold to " + info[0] + " for " + displayPrice(info[2]) +
                        "The money is in the escrow. Two of the three participants (Buyer, Seller and Arbiter) have to " +
                        "either release the funds to seller or refund the money to the buyer");
                    });
                    i.escrowInfo(productId).then(info=>{
                        $("#seller").html('Seller: ' + info[0]);
                        $("#buyer").html('Buyer: ' + info[1]);
                        $("#arbiter").html('Arbiter: ' + info[2]);
                        if(info[3] == true){
                            $("#release-funds").hide();
                            $("#refund-funds").hide();
                            $("#release-count").html("Amount from the escrow has been released");
                        } else{
                            $("#release-count").html(info[4] + " of 3 participants have agreed to release funds to seller");
                            $("#refund-count").html(info[5] + " of 3 participants have agreed to refund the buyer");
                        }
                    });
                });

            else if(parseInt(p[8]) == 2)
                $("#product-status").html("Product not sold");
            else if(currentTime < p[6])
                $("#bidding").show();
            else if( currentTime - (200) < p[6] )
                $("#revealing").show();
            else
                $("#finalize-auction").show();
        });
    });
}
   
   
   function getCurrentTimeInSeconds(){
    return Math.round(new Date() / 1000);
   }
   
   function displayPrice(amt) {
    return 'Ξ' + web3.utils.fromWei(amt, 'ether');
   }
   
   
   function displayEndHours(seconds) {
    let current_time = getCurrentTimeInSeconds()
    let remaining_seconds = seconds - current_time;
   
    if (remaining_seconds <= 0) {
     return "Auction has ended";
    }
   
    let days = Math.trunc(remaining_seconds / (24*60*60));
    remaining_seconds -= days*24*60*60;
    
    let hours = Math.trunc(remaining_seconds / (60*60));
    remaining_seconds -= hours*60*60;
   
    let minutes = Math.trunc(remaining_seconds / 60);
    remaining_seconds -= minutes * 60;
   
    if (days > 0) {
     return "Auction ends in " + days + " days, " + hours + ", hours, " + minutes + " minutes";
    } else if (hours > 0) {
     return "Auction ends in " + hours + " hours, " + minutes + " minutes ";
    } else if (minutes > 0) {
     return "Auction ends in " + minutes + " minutes ";
    } else {
     return "Auction ends in " + remaining_seconds + " seconds";
    }
   }

window.addEventListener('load', function() {
 // Checking if Web3 has been injected by the browser (Mist/MetaMask)
 if (typeof web3 !== 'undefined') {
  console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
  // Use Mist/MetaMask's provider
  window.web3 = new Web3(web3.currentProvider);
 } else {
  console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
  // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
 }

 App.start();
});