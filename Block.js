/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
	constructor(data){
		this.hash = "";
		this.height = 0;
		this.body =  {
					address: data.address,
					star: {
						ra: data.star.ra,
						dec: data.star.dec,
						mag: data.star.mag,
						cen: data.star.cen,
						story: Buffer(data.star.story).toString('hex')
						}
	  	}
		this.time = new Date().getTime().toString().slice(0,-3);
		this.previousBlockHash = "";
	}
}

module.exports.Block = Block;