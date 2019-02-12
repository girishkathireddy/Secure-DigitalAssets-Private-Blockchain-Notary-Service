/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/
const hex2ascii = require('hex2ascii');
class BlockObj {
	constructor(data){
		this.hash = data.hash;
		this.height = data.height;
		this.body =  {
					address: data.body.address,
					star: {
						ra: data.body.star.ra,
						dec: data.body.star.dec,
						mag: data.body.star.mag,
						cen: data.body.star.cen,
                        story: data.body.star.story,
                        storyDecoded:hex2ascii(data.body.star.story)					
                    	}
	  	}
		this.time = data.time;
		this.previousBlockHash = data.previousBlockHash;
	}
}

module.exports.BlockObj = BlockObj;