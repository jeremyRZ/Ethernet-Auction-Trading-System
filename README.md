# Ethernet-Auction-Trading-System

# Introduction

## Tools used

* IPFS 	    version: 0.9.1
* GIT 	    version 2.32.0
* Ganache version 2.5.4
* Solidity    version 0.5.16
* Truffle     version 5.4.1 (core: 5.4.1)
* Node 	    version 14.17.3
* Web3.js   version 1.4.0

## Main function

- List products: Merchants can display items for display.
- Putting files into IFPS: Implement a function to upload images and product descriptions (large text) to IPFS.
- Browse products: We will implement a function to filter and browse products based on catalog, auction time, etc.
- Auction: Conduct an auction event and after the auction time is over, the highest bidder gets the item.
- Escrow Contract: Once the bidding is over and there is a winner for the item, only an escrow contract will be created between the buyer, seller and an arbitrary third party.
- 2/3 signatures: Add fraud protection by implementing 2/3 multiple signatures, i.e. two out of three participants agree to release funds to the seller or return funds to the buyer.

## System Architecture
![System Architecture Page](https://raw.githubusercontent.com/jeremyRZ/Ethernet-Auction-Trading-System/main/screenshot/System%20Architecture.png)

## Step

1. `npm install -g truffle` if it is not installed already.
2. `./ipfs add iphone.png` Upload a file to IPFS, maybe the hash value of the file.
3. `truffle compile --all` to compile contracts.
4. `npm install -g ganache-cli` Either using the GUI or the command line
5. `truffle migrate` Migrate smart contracts and deploy them on the blockchain
6. `truffle exec seed.js` Adding products to the Blockchain, where the corresponding hash value of the js file needs to be replaced from the first step.
7. `npm run dev` Open web service

## Some screenshots

- Index page： displaying existing products.
![Index Page](https://raw.githubusercontent.com/jeremyRZ/Ethernet-Auction-Trading-System/main/screenshot/indexpage.png)


- Upload product page： upload products and set up auction information through visual page operations
![Index Page](https://raw.githubusercontent.com/jeremyRZ/Ethernet-Auction-Trading-System/main/screenshot/productdetail.png)


- Product Detail page： show details of products.
![Detail Page](https://raw.githubusercontent.com/jeremyRZ/Ethernet-Auction-Trading-System/main/screenshot/product.png)


- Ganache page： Display blockchain information.
![Index Page](https://raw.githubusercontent.com/jeremyRZ/Ethernet-Auction-Trading-System/main/screenshot/gan.png)
