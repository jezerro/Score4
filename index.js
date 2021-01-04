//Βιβλιοθήκες
var express = require('express');
var app = express();

var http = require('http').createServer(app);
var io = require('socket.io')(http);

var mysql = require('mysql');
var mongo = require('mongodb');

//Στοιχεία βάσης
var con = mysql.createConnection({host: "localhost", user: "root", password: "", database: "ttt"});
		
var sockets1 = [];
var sockets2 = [];
		

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://mongo:mongo123@pithia.jepfn.gcp.mongodb.net/Pithia?retryWrites=true&w=majority";
		
		
app.use(express.static('./'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});


//Ανοίγει listener στο port 3000 και συνδέεται στη βάση
http.listen(3000, function(){	
	console.log('listening on *: 3000');	
});


//User connected trigger
io.on('connection', function(socket){
	
	console.log('A user connected');
		
	//Οι αντίπαλοι μπαίνουν σε δύο πίνακες. Κάθε δεύτερο παίκτη ξεκινάει match
	if(sockets1.length <= sockets2.length){
		sockets1.push(socket.id);
	}else{
		sockets2.push(socket.id);
	}
  
	//Ορίζει το χρωμα του κάθε παίκτη
	if(sockets1.length == sockets2.length){
		io.to(sockets1[sockets1.length-1]).emit('setColor', 'red');
		io.to(sockets2[sockets2.length-1]).emit('setColor', 'green');		
	}
	
	//User disconnected trigger
	socket.on('disconnect', function(){
		console.log('A user disconnected');
	});
	
	//Ανταλλαγή ονομάτων και πόντων, αν ο παίκτης δεν υπάρχει δημιουργείται
	socket.on('setName', function(msg){
				
		var result1;
				
		MongoClient.connect(url, function(err, db) {
			
		  if (err) throw err;
		  var dbo = db.db("Pithia");
		  var query = { playerName: msg };
		  
		  dbo.collection("Score4").find(query).toArray(function(err, result) {
			if (err) throw err;
			result1 = result;			
			db.close();
		  });
		  
		});			
						
		if(result1 === undefined || result1.length == 0){
			console.log(1);
			MongoClient.connect(url, function(err, db) {
	  
				if (err) throw err;
				var dbo = db.db("Pithia");
				var myobj = {playerName: msg, playerScore: 0};
					
				dbo.collection("Score4").insertOne(myobj, function(err, res) {
					if (err) throw err;
					console.log("1 document inserted");
					db.close();
				});
			  
			});
				
			var score = 0;					
					
			for(var i = 0; i < sockets1.length; i++){
			
				if(sockets1[i] == socket.id){	
					io.to(sockets2[i]).emit('setName', msg + '-' + score);
					return;
				}
				
			}
					
			for(var i = 0; i < sockets2.length; i++){
						
				if(sockets2[i] == socket.id){
					io.to(sockets1[i]).emit('setName', msg + '-' + score);
					return;
				}
						
			}
				
		}else{				
			console.log(2);
			var score = result1[0].playerScore;				
				
			for(var i = 0; i < sockets1.length; i++){
			
				if(sockets1[i] == socket.id){	
					io.to(sockets2[i]).emit('setName', msg + '-' + score);
					return;
				}
				
			}
					
			for(var i = 0; i < sockets2.length; i++){
						
				if(sockets2[i] == socket.id){
					io.to(sockets1[i]).emit('setName', msg + '-' + score);
					return;
				}
						
			}
				
		}	
			
		
	});
  
	//Κίνηση μεταξύ παικτών
	socket.on('move', function(msg){	
		
		for(var i = 0; i < sockets1.length; i++){
			
			if(sockets1[i] == socket.id){
				io.to(sockets2[i]).emit('move', msg);
				return;
			}
			
		}
		
		for(var i = 0; i < sockets2.length; i++){
			
			if(sockets2[i] == socket.id){
				io.to(sockets1[i]).emit('move', msg);
				return;
			}
			
		}
		
	});
	
	//Νίκη. Το event στελνεται από τον χαμένο
	socket.on('victory', function(msg){	
	
		MongoClient.connect(url, function(err, db) {
			
		  if (err) throw err;
		  var dbo = db.db("Pithia");
		  var myquery = {playerName: msg};
		  var newvalues = {$inc:{playerScore: 1}};
		  
		  dbo.collection("Score4").updateOne(myquery, newvalues, function(err, res) {
			if (err) throw err;
			console.log("1 document updated");
			db.close();
		  });
		  
		});	
	
	});
		
	//Εκκαθάρηση board αν ο αντίπαλος αποσυνδεθεί
	socket.on('clean', function(){	
		
		for(var i = 0; i < sockets1.length; i++){
			
			if(sockets1[i] == socket.id){
				io.to(sockets2[i]).emit('opponentLeft');
				sockets1.splice(i, 1);
				sockets2.splice(i, 1);
				return;
			}
			
		}
		
		for(var i = 0; i < sockets2.length; i++){
			
			if(sockets2[i] == socket.id){
				io.to(sockets1[i]).emit('opponentLeft');
				sockets2.splice(i, 1);
				sockets1.splice(i, 1);
				return;
			}
			
		}		
		
	});
		
});