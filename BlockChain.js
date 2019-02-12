/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');
const BitcoinMessag = require('bitcoinjs-message'); 
const ValidRequestObj= require('./ValidRequestObj.js');
const BlockObj= require('./BlockObj.js');
const TimeoutRequestsWindowTime = 5*60*1000;

class Blockchain {

    constructor() {
        this.bd = new LevelSandbox.LevelSandbox();
        this.generateGenesisBlock();
        this.mempool = [];
        this.timeoutRequests = [];
        this.mempoolValid=[];
        this.timeoutMemPoolValid=[];
    }

    // Helper method to create a Genesis Block (always with height= 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
    generateGenesisBlock(){
        // Add your code here
        let self= this;
        self.getBlockHeight().then((height)=>{
           if(height=== -1){
            let body = {
                address: "",
                star: {
                      ra: "",
                      dec: "",
                      mag: "",
                      cen: "",
                      story: "Genesis Block"
                      }
              };
               let genesisBlock= new Block.Block(body);
               self.addBlock(genesisBlock).then((block)=>{
                   //console.log(block);
               });
           }
        }).catch((err)=>{console.log(err)});
    }

    // Get block height, it is a helper method that return the height of the blockchain
    getBlockHeight() {
        let self= this;
        return new Promise(function(resolve, reject) {
            self.bd.getBlocksCount().then((count) => {
                resolve(count);
            }).catch((err) => { resolve(-1); });
        });
    }

    // Add new block
    addBlock(block) {
         // block height
        let self= this;
        return new Promise(function(resolve, reject) {
          self.getBlockHeight().then((height)=>{
                block.height=height+1;
                return self.bd.getLevelDBData(height);
          }).then((previousBlockData)=>{
              if(previousBlockData){
                  let previousBlock= JSON.parse(previousBlockData);
                  block.previousBlockHash=previousBlock.hash;
                  block.hash=  SHA256(JSON.stringify(block)).toString();
              }else{
                block.hash=  SHA256(JSON.stringify(block)).toString();
              }
              return self.bd.addLevelDBData(block.height,JSON.stringify(block).toString());
          }).then((result)=>{
            //   console.log(result);
              if(!result){
                  console.log("Error");
                  reject(new TypeError("Error adding block"));
              }
              let parsedObject= JSON.parse(result);
              let blockObj= new BlockObj.BlockObj(parsedObject);
              self.removeValidationRequest(parsedObject.body.address);
              self.removeFromMemPoolValid(parsedObject.body.address);
              //console.log(self.timeoutRequests);
              resolve(blockObj);
          }).catch((err)=>{console.log(err);reject(err)  });
        });
    
    }

    // Get Block By Height
    getBlock(height) {
        let self= this;
        return new Promise(function(resolve, reject) {
            self.bd.getLevelDBData(height).then((blckdb)=>{
                if(blckdb){
                    let blck=JSON.parse(blckdb);
                    let blockObj= new BlockObj.BlockObj(blck);
                    resolve(blockObj);
                }else{
                    resolve(undefined);  
                }
            }).catch((err) => { console.log(err);reject(err) }); 
        });
    }

    	/**
         * getBlockByHash
         * @param {*} byHash 
         */
        getBlockByHashFromDB(byHash){
            let self= this;
            return new Promise(function(resolve, reject) {
                self.bd.getBlocksByHash(byHash).then((blckdb)=>{
                    if(blckdb){
                        let blockObj= new BlockObj.BlockObj(blckdb);
                        resolve(blockObj);
                    }else{
                        resolve(undefined);  
                    }
                }).catch((err) => { console.log(err);reject(err) }); 
            });

        }

        /**
         * getBlockByAddress
         */
        getBlockByAddress(walletAddress){
            let self= this;
            return new Promise(function(resolve, reject) {
                self.bd.getBlocksByWalletAddress(walletAddress).then((blckdb)=>{
                    let result=[];
                    let blockObj=null;
                    if(blckdb){
                        blckdb.forEach((blck)=>{
                            blockObj= new BlockObj.BlockObj(blck);
                            result.push(blockObj);
                        });
                        resolve(result);
                    }else{
                        resolve(undefined);  
                    }
                }).catch((err) => { console.log(err);reject(err) }); 
            });  
        }
		

        // Get all BlockChain Data
        getBlockChain(){
            let self= this;
            let chain=[];
            return new Promise(function(resolve,reject){
                self.bd.getAllBlocks().then((blocks)=>{
                    for(let i=0;i<blocks.length;i++){
                        let block= JSON.parse(blocks[i].value);
                        chain.push(block);
                    }
                    resolve(chain.sort((a,b)=>{return a.height-b.height}));
                }).catch((err)=>{reject(err)});
            });
        }

    // Validate if Block is being tampered by Block Height
    validateBlock(height) {
        let self= this;
        return new Promise(function(resolve, reject) {

            self.getBlock(height).then((block)=>{
                const blockHash= block.hash;
                block.hash="";
                const validBlockHash=SHA256(JSON.stringify(block)).toString();
                if(validBlockHash===blockHash){
                    resolve(true);
                }else{
                    resolve(false);
                }
            }).catch((err)=>{
                reject(err);
            });

      });

    }

    // Validate Blockchain
    validateChain() {
        let self= this;
        let errorLog=[];
        return new Promise((resolve,reject)=>{
            self.getBlockChain().then((chain)=>{
                let promises=[];
                let chainIndex=0;

                chain.forEach(block=>{
                   promises.push(self.validateBlock(chainIndex));
                   if(chainIndex >0){
                       let previousBlockHash= block.previousBlockHash;
                       let blockHash= chain[chainIndex-1].hash;
                       if(blockHash!=previousBlockHash){
                           errorLog.push(`Error -Block Height :${chainIndex}- Previous Hash Doesn't Match ${previousBlockHash}-${blockHash}`);
                       }
                   }
                   chainIndex++;
                });

                Promise.all(promises).then((results)=>{
                    chainIndex=0;
                    results.forEach(valid=>{
                        if(!valid){
                            errorLog.push(`Error- BlockHeight :${chain[chainIndex].height}- Has been Tampered`);
                        }
                        chainIndex++;
                            
                    });
                    resolve(errorLog);
                }).catch((err)=>{console.log(err); reject(err)});
            }).catch((err)=>{console.log(err);reject(err)});
        });

    }



     /**
      * AddRequestValidation Method
      * @param requestObject 
      */
     addRequestValidation(requestObject){
         let self= this;
         return new Promise((resolve, reject) => {
                self.searchRequestByWalletAddress(requestObject.walletAddress).then((result) => {
                    if(result) {
                        let timeElapse = (new Date().getTime().toString().slice(0,-3)) - result.requestTimeStamp;
                        let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
                        result.validationWindow=timeLeft;
                        resolve(result);
                    } else {
                        self.mempool.push(requestObject);
                        self.timeoutRequests[requestObject.walletAddress] = setTimeout(function(){ self.removeValidationRequest(requestObject.walletAddress) }, TimeoutRequestsWindowTime );
                        resolve(requestObject);
                    }
                }).catch((error) => { console.log("Error at addRequestValidation"); reject(error) })
         });

     }

     /**
      * searchRequestByWalletAddress
      * @param address 
      */
      searchRequestByWalletAddress(walletAddress){
        let self= this;
        return new Promise((resolve, reject) => {
            self.mempool.forEach((obj)=>{
                if(obj.walletAddress===walletAddress){
                     resolve(obj);
                }
            });
            resolve(false);
        });
         
      }

           /**
      * searchRequestByWalletAddress
      * @param address 
      */
     searchRequstFromMemPoolValid(walletAddress){
        let self= this;
        return new Promise((resolve, reject) => {
            self.mempoolValid.forEach((obj)=>{
                if(obj.status.address===walletAddress){
                     resolve(obj);
                }
            });
            resolve(false);
        });
         
      }

      /**
       * removeValidationRequest
       * @param {*} address 
       */
        removeValidationRequest(walletAddress){
            let self= this;
            this.mempool.splice(this.mempool.findIndex(obj => obj.walletAddress === walletAddress), 1);
            this.timeoutRequests[walletAddress]=null;
        }


        /**
         * removeFromMemPoolValid
         * @param {*} walletAddress 
         */
        removeFromMemPoolValid(walletAddress){
            let self= this;
            this.mempoolValid.splice(this.mempoolValid.findIndex(obj => obj.status.address === walletAddress), 1);
            this.timeoutMemPoolValid[walletAddress]=null;
        }

        /**
         * validateRequestByWallet
         * @param {*} reqObject 
         */
        validateRequestByWallet(reqObject){
            let self= this;
            let objectTemp;
            return new Promise((resolve, reject) => {
                self.verifyAddress(reqObject.address).then((result)=>{
                        if(result){
                                objectTemp=result;
                                return self.bitcoinMessageVerify(result,reqObject); 
                        }
                        reject("Object may have expired. Please request again.");
                  
                }).then((valid)=>{
                    if(!valid){
                        reject("Authentication Failed.");
                    } else{
                        return self.searchRequstFromMemPoolValid(objectTemp.walletAddress);    
                    }

                }).then((mempoolvalid)=>{
                    
                    if(!mempoolvalid){
                        let timeElapse = (new Date().getTime().toString().slice(0,-3)) - objectTemp.requestTimeStamp;
                        let timeLeft = (TimeoutRequestsWindowTime/1000)*6 - timeElapse;
                        let validReqObj = new ValidRequestObj.ValidRequestObj(true,objectTemp.walletAddress,objectTemp.requestTimeStamp,objectTemp.message,timeLeft,true);
                        self.mempoolValid.push(validReqObj);
                        self.timeoutMemPoolValid[objectTemp.walletAddress] = setTimeout(function(){ self.removeFromMemPoolValid(objectTemp.walletAddress) }, TimeoutRequestsWindowTime*6 );
                        resolve(validReqObj);
                    }else{
                        let timeElapse = (new Date().getTime().toString().slice(0,-3)) - mempoolvalid.status.requestTimeStamp;
                        let timeLeft = (TimeoutRequestsWindowTime/1000)*6 - timeElapse;
                        mempoolvalid.status.validationWindow=timeLeft;
                        resolve(mempoolvalid);
                    }

                })
                .catch((err)=>{
                    console.log(`Error`);
                    reject(err);
                })
            });

        }

        /**
         * verifyTimeLeft
         * @param {*} walletAddress 
         */
        verifyAddress(walletAddress){
            let self= this;
            return new Promise((resolve, reject) => {
                self.searchRequestByWalletAddress(walletAddress).then((obj)=>{
                    if(obj){
                        let timeElapse = (new Date().getTime().toString().slice(0,-3)) - obj.requestTimeStamp;
                        let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
                        if(timeLeft==0) resolve(0);
                        resolve(obj);
                    }else{
                        resolve(0);
                    }
                }).catch((err)=>{
                    console.log(`Error at verifyTimeLeft `);
                    reject(err)
                });        
            });
        }

        /**
         * bitcoinMessageVerify
         * @param {*} obj 
         * @param {*} reqObject 
         */
        bitcoinMessageVerify(obj,reqObject){
            let self= this;
            return new Promise((resolve, reject) => {
              let isValid = BitcoinMessag.verify(obj.message, reqObject.address, reqObject.signature);  
               resolve(isValid); 
           });
        }  
      
        /**
         * verifyAddressRequest
         * @param {*} walletAddress 
         */
        verifyAddressRequest(walletAddress){
            let self= this;
            return new Promise((resolve, reject) => {
                console.log(self.mempoolValid);
             let exist= self.mempoolValid.findIndex(obj => obj.status.address == walletAddress);
            // console.log(exist);
             if(exist >=0 && (self.mempoolValid[exist].registerStar==true) &&  (self.mempoolValid[exist].status.messageSignature==true) ) {
                resolve(true);   

             }else{
                resolve(false); 
             }
                
             });
        }


    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    _modifyBlock(height, block) {
        let self = this;
        return new Promise( (resolve, reject) => {
            self.bd.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
                resolve(blockModified);
            }).catch((err) => { console.log(err); reject(err)});
        });
    }
   
}

module.exports.Blockchain = Blockchain;
