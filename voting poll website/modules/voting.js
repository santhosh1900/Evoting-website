var mongoose = require("mongoose");
var user   = require("./user");

var votingSchema = new mongoose.Schema({
	name 		: String,
	desc		:  String,
	image		: String,
	imageId     : String,
	created_at  : Object,
	closing_at 	: Object,
	hours		: Number,
	min			: Number,
	sec  		: Number,
	total_contestants : Number,
	voters		:[
						{
							type: mongoose.Schema.Types.ObjectId,
							ref : "user"
						}
	              ],
	contestants : [
				{	
				name  : String,
				votes :[
						{
							type: mongoose.Schema.Types.ObjectId,
							ref : "user"
						}
				]
				}	
	]

});

var voting  = mongoose.model("voting", votingSchema);

module.exports = voting;