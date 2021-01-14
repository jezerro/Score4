var socket = io();
var indexes = [];
var myMoves = [];
var opponentMoves = [];
var timeOut;
var name1set, name2set;
var opponentName;
var myColor, opponentColor;
var canMove = false;


//Ανταλλαγή ονομάτων/πόντων
socket.on('setName', function(msg){		
			
	name2set = true;
	opponentName = msg;
	
	document.getElementById('title').innerHTML = 'You are playing against ' + opponentName;

	if(name1set && name2set && myColor == 'red'){
		canMove = true;
		timeOut = setTimeout(closeWindow, 20000);	
		document.getElementById('title').innerHTML = 'You are playing against ' + opponentName + '. You play first.';			
	}
		
});
		
	
//Χρώματα
socket.on('setColor', function(msg){
		
	document.getElementById('nameBtn').disabled = false;	
	document.getElementById('title').innerHTML = 'Opponent found. Enter name.';
	
	if(msg == 'red'){					
		myColor = 'red';
		opponentColor = 'green';				
	}else{				
		myColor = 'green';
		opponentColor = 'red';			
	}
			
});

		
//Κίνηση αντιπάλου
socket.on('move', function(msg){
						
	document.getElementById(msg).style.backgroundColor = opponentColor;
	indexes.push(msg);
	opponentMoves.push(msg);
	
	canMove = true;	
	timeOut = setTimeout(closeWindow, 20000);
	
	if(checkWin() == 'lose'){			
		clearTimeout(timeOut);
		canMove = false;
		document.getElementById('title').innerHTML = 'You lost';
	}
			
});
		
		
//Ο αντίπαλος εγκατέλειψε
socket.on('opponentLeft', function(){		
	canMove = false;
	document.getElementById('title').innerHTML = opponentName + ' left. Refresh the window to play again.';	
});
			
		
function setName(){
			
	if(document.getElementById('title').innerHTML.includes('against') && opponentName == document.getElementById('name').value){			
		document.getElementById('name').value += ' <- Name Taken';	
	}else{				
			
		if(document.getElementById('name').value != ""){
						
			name1set = true;
			socket.emit('setName', document.getElementById('name').value);
			
			if(name1set && name2set && myColor == 'red'){
				canMove = true;
				timeOut = setTimeout(closeWindow, 20000);
				document.getElementById('title').innerHTML = 'You are playing against ' + opponentName + '. You play first.';						
			}
			
			var element = document.getElementById('name');
			element.parentNode.removeChild(element);
			
			element = document.getElementById('nameBtn');
			element.parentNode.removeChild(element);
			
			element = document.getElementById('pn');
			element.parentNode.removeChild(element);
		
		}
			
	}
			
}
		
		
function sendMove(id) {
		
	if(!canMove || indexes.includes(id)) return;

	var flag = false;

	if(id.slice(0, 1) < 5){

		var start = id.slice(0, 1);
		start++;
		
		for(var i = start; i <= 5; i++){
			if(!indexes.includes(i.toString()+id.slice(1, 2))){
				flag = true;
			}
		}
	
	}

	if(!flag){

		indexes.push(id);
		myMoves.push(id);
		document.getElementById(id).style.backgroundColor = myColor;
		canMove = false;
		socket.emit('move', id);
		clearTimeout(timeOut);

		if (checkWin() == 'win') {
			canMove = false;
			document.getElementById('title').innerHTML = 'You won';
		}
	
	}

}


//Έλεγχος νίκης/ήττας
function checkWin() {

	var sum = 0;

	for(var i = 0; i <= 5; i++){
		
		for(var j = 0; j <= 6; j++){
			
			if(myMoves.includes(i.toString()+j.toString())){				
				sum++;				
			}else{
				sum = 0;
			}	

			if(sum >= 4){
				return 'win';
			}
			
		}
		
	}
	
	var sum = 0;

	for(var i = 0; i <= 6; i++){
		
		for(var j = 0; j <= 5; j++){
			
			if(myMoves.includes(j.toString()+i.toString())){				
				sum++;				
			}else{
				sum = 0;
			}	

			if(sum >= 4){
				return 'win';
			}
			
		}
		
	}
	
	var sum = 0;

	for(var i = 0; i <= 5; i++){
		
		for(var j = 0; j <= 6; j++){
			
			if(opponentMoves.includes(i.toString()+j.toString())){				
				sum++;				
			}else{
				sum = 0;
			}	

			if(sum >= 4){
				return 'lose';
			}
			
		}
		
	}
	
	var sum = 0;

	for(var i = 0; i <= 6; i++){
		
		for(var j = 0; j <= 5; j++){
			
			if(opponentMoves.includes(j.toString()+i.toString())){				
				sum++;				
			}else{
				sum = 0;
			}	

			if(sum >= 4){
				return 'lose';
			}
			
		}
		
	}

}


function closeWindow() {
    canMove = false;
    document.getElementById('title').innerHTML = 'Timeout. Refresh.';
    closing();
}