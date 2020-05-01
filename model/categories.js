
var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://chon:1234@cluster0-zk4v3.mongodb.net/Blog?retryWrites=true&w=majority', {useNewUrlParser: true,useUnifiedTopology: true});
//รูปแบบ schema ของ categories
let CatelogSchema = new mongoose.Schema({
    name: String,
})
let conCatelog = mongoose.model("categories", CatelogSchema);