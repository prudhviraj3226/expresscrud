const express = require('express');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser')
const Joi = require('joi');
const expressJoi = require('express-joi-validation').createValidator({})

//bring in mongoose dependency that we installed
const mongoose = require('mongoose');

// This is Dummy url no need
//bring in mongo uri from mlab
// const mongoURI =
// 'mongodb://johndoe:Loyaltyislife2@ds217452.mlab.com:17452/mymongodb';

const mongoURI ='mongodb://prudhviadmin:prudhviadmin557@ds133627.mlab.com:33627/userdetails';

//connect mongodb
mongoose.connect(mongoURI, { useNewUrlParser: true });

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

 // define Schema
    var BookSchema = mongoose.Schema({
      name: String,
      price: Number,
      quantity: Number
    });

// Compile model from schema
var SomeModel = mongoose.model('bookdetailscollection', BookSchema );

const app = express();

const querySchema = Joi.object({
  name: Joi.number().required()
})

// To support json object from client side

app.use( bodyParser.json() );  //to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // for URL-encoded bodies
  extended: true
})); 


app.get('/', (req, res) => {
  res.send('Hello Express!')
});

// get all todos
app.get('/api/v1/todos', (req, res) => {
   res.status(200).send({
    success: 'true',
    message: 'todos retrieved successfully'
  })
});

// In url we should send in this way for params http://dentalincompletepentagon.prudhvi021.repl.co/user/prudhviraj

app.get('/user/:id', function(req, res) {
  
  res.send(req.params.id);    
});

// In url we should send in this way for query http://dentalincompletepentagon.prudhvi021.repl.co/user?name=prudhvi&class=senior

app.get('/user', expressJoi.query(querySchema),function(req, res) {
  res.type('application/json');
  // res.send(JSON.stringify(req.query));  
     res.json({
        status: 'success',
        data: req.query
    });  
});

// In post man we have to send in body in this way {"name":"Raj","color":"red"}
app.post('/bookDetailsStorage', function(req, res) {
    var name = req.body.name,
        price = req.body.price;
        quantity= req.body.quantity
        var book1 = new SomeModel({ name: name, price: price, quantity:quantity});

    // save model to database
    book1.save(function (err, book) {
      if (err) return console.error(err);
      console.log(book.name + " saved to bookstore collection.");
res.send(name + "" + price); 
});
     
});


app.get('/displayBookDetails/:name',function(req, res) {
   db.collection("bookdetailscollections").find({name:req.params.name}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    res.json({
        status: 'success',
        data: result
    });  
  });
     
});


app.post('/updateBookDetails',function(req, res) {
   
  db.collection( 'bookdetailscollections' ).update (
    { name : req.body.name },
    { $set : { price:req.body.price } },
    function( err, result ) {
        if ( err ) throw err;
        console.log(result);
    res.json({
        status: 'success',
        data: result
    });
    }
);
     });


app.get('/deleteBookDetails/:name',function(req, res) {
  db.collection('bookdetailscollections').deleteOne({name:req.params.name}, function(err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
    res.json({
        status: 'success',
        data: "Deleted successfully"
    });
  });
     });

 
// Display data based on output of one collection as input for another collection
app.get('/displayBookDetailSync/:name',function(req, res) {
   db.collection("bookdetailscollections").find({name:req.params.name}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);

db.collection("bookdescription").find({book_name:result[0].name}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);

    res.json({
        status: 'success',
        data: result
    });  

});

  });
     
});






// To generate JSON Web Token
app.post('/generateToken/:id', function(req, res) {
    var id = req.params.id
         // create a token
    var token = jwt.sign({ id: id }, "secretID", {
      expiresIn: 86400 // expires in 24 hours
    });
    res.status(200).send({ auth: true, token: token });
    
});

// To check JSON token is valid or not
app.get('/userValidorNot', function(req, res) {
  var token = req.headers['x-access-token'];
   jwt.verify(token, "secretID", function(err, result) {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    
    res.status(200).send(result);
  });   
});

app.listen(3000, () => {
  console.log('server started');
});