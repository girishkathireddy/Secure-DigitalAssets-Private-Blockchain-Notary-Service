const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./Block.js');
const BlockChain = require('./BlockChain.js');
const RequestObject= require('./RequestObj.js');

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} app 
     */
    constructor(app) {
        this.app = app;
        this.myBlockChain = new BlockChain.Blockchain();
      //  this.initializeMockData();
        this.getBlockByIndex();
        this.postNewBlock();
        this.postRequestValidation();
        this.validate();
        this.getBlockByHash();
        this.getBlockByAddress();
    }

    
    

    /**
     * GET Endpoint to retrieve a block by index, url: "/block/:index"
     */
    getBlockByIndex() {
      let self= this;
        self.app.get("/block/:index", (req, res,next) => {
                let index= req.params.index;
                self.myBlockChain.getBlock(index).then((blck)=>{ 
                    if(self.isEmpty(blck)){
                      next("Error: Block height out of bounds"); 
                    } else{
                      res.send(blck);
                    }
                }).catch((err)=>{
                    next(err); 
                });
          
        });
    }

    /**
     * POST Endpoint to add a new Block, url: "/block"
     */
    postNewBlock() {
        let self=this;
        this.app.post("/block", (req, res,next) => {
            let reqbody= req.body;
            if(self.isEmpty(reqbody.address) ||self.isEmpty(reqbody.star) ){
                next("Please check the data");
            } else{
                self.myBlockChain.verifyAddressRequest(reqbody.address).then((isValid)=>{
                    if(isValid){
                        let storyObj= reqbody.star.story;
                       console.log(reqbody.star.ra);
                        let block = new BlockClass.Block(reqbody);
                        return self.myBlockChain.addBlock(block);
                    }else{
                        next("Validation Failed.");
                    }

                }).then((result)=>{
                           res.send(result);
                }).catch((err)=>{
                    next(err);
                });

           }
        });
    }


    /**
     * 
     * Post end point url: "/requestValidation 
     * 
     * */
    postRequestValidation() {
        let self=this;
        this.app.post("/requestValidation", (req, res,next) => {
            let reqbody= req.body;
            if(self.isEmpty(reqbody.address)){
                next("Please add the JSON content");
            } else{
                let requestObject = new RequestObject.RequestObj(reqbody.address);
                self.myBlockChain.addRequestValidation(requestObject).then((result)=>{
                    res.format ({
                        'application/json': function() {
                           res.send(result);
                        },
                     });
                }).catch((err)=>{
                    next(err);
                });
           }
        });
    }


    /**
     * 
     * Post end point url: "/requestValidation 
     * 
     * */
    validate() {
        let self=this;
        this.app.post("/message-signature/validate", (req, res,next) => {
            let reqbody= req.body;
            if(self.isEmpty(reqbody.address) || self.isEmpty(reqbody.signature)){
                next("Please check the Json Object");
            } else{
                self.myBlockChain.validateRequestByWallet(reqbody).then((result)=>{
                    res.format ({
                        'application/json': function() {
                           res.send(result);
                        },
                     });
                }).catch((err)=>{
                    next(err);
                });
           }
        });
    }


    /**
     * GET Endpoint to retrieve a block by Hash, url: "/block/:hash"
     */
    getBlockByHash() {
        let self= this;
          self.app.get("/stars/hash/:hash", (req, res,next) => {
                  let hash= req.params.hash;
                  self.myBlockChain.getBlockByHashFromDB(hash).then((blck)=>{ 
                      if(self.isEmpty(blck)){
                        next("Error: Block Not Available"); 
                      } else{
                        res.send(blck);
                      }
                  }).catch((err)=>{
                      next(err); 
                  });
            
          });
      }

    /**
     * GET Endpoint to retrieve a block by Address, url: "/block/:hash"
     */
    getBlockByAddress() {
        let self= this;
          self.app.get("/stars/address/:address", (req, res,next) => {
                  let address= req.params.address;
                  self.myBlockChain.getBlockByAddress(address).then((blck)=>{ 
                      if(self.isEmpty(blck)){
                        next("Error: Block Not Available"); 
                      } else{
                        res.send(blck);
                      }
                  }).catch((err)=>{
                      next(err); 
                  });
            
          });
      }

    // /**
    //  * Help method to inizialized Mock dataset, adds 10 test blocks to the blocks array
    //  */
    // initializeMockData() {
    //     (function theLoop (i) {
    //         setTimeout(function () {
    //             let blockTest = new BlockClass.Block("Test Block - " + (i + 1));
    //             // Be careful this only will work if your method 'addBlock' in the Blockchain.js file return a Promise
    //             self.myBlockChain.addBlock(blockTest).then((result) => {
    //                 console.log(result);
    //                 i++;
    //                 if (i < 10) theLoop(i);
    //             });
    //         }, 10000);
    //     })(0);
    // }

    
    /**
     * Helper Method to check variable
     * @param {*} obj 
     */    
    isEmpty(obj) {
        return !obj || Object.keys(obj).length === 0;
    }


}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app);}