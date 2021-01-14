//Βιβλιοθήκες
var express = require('express');
var app = express();

var http = require('http').createServer(app);
var io = require('socket.io')(http);

var sockets1 = [];
var sockets2 = [];
		
				
app.use(express.static('./'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});


//Ανοίγει listener στο port 3000
http.listen(3000, function(){	
	console.log('listening on *: 3000');	
});


//User connected trigger
io.on('connection', function(socket){
		
	console.log('A user connected');
	
	//User disconnected trigger
	socket.on('disconnect', function(){
		console.log('A user disconnected');
	});
		
		
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
	
	//Ανταλλαγή ονομάτων και πόντων, αν ο παίκτης δεν υπάρχει δημιουργείται
	socket.on('setName', function(msg){
					
		for(var i = 0; i < sockets1.length; i++){
			
			if(sockets1[i] == socket.id){	
				io.to(sockets2[i]).emit('setName', msg);
				return;
			}
				
		}
					
		for(var i = 0; i < sockets2.length; i++){
						
			if(sockets2[i] == socket.id){
				io.to(sockets1[i]).emit('setName', msg);
				return;
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