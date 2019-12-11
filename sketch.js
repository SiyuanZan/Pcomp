var serial; // variable to hold an instance of the serialport library
var fromSerial = 0; //variable to hold the data
var fromSerial2=0;
//let rate1=1;
//let rate2=1;

let sample;
//let notes=[1,1.125,1.2,1.334,1.5,1.6,1.875,2];
let scale=[0.895,1,1.125,1.2,1.334,1.5,1.6,1.875,2];
let melody=[5,5,4,5,6,4,5,3,1,2,2,3,2,4,5,5,5,5,5,4,5,6,4,5,3,1,2,2,3,2,2,0,0,1,1];
//let notes=[1318.5,1318.5,1174.7,1318.5,1396.9,1318.5,1318.5,1046.5,880,987.77,987.77,1046.5,987.77,1046.5,1174.7,1318.5,1318.5,1318.5,1318.5,1318.5,1174.7,1318.5,1396.9,1318.5,1318.5,1046.5,880,987.77,987.77,1046.5,987.77,987.77,783.99,783.99,880,880];
let BASE=0.4;
let samples=[];
let index=[];
let pindex=[];

function preload(){
	sample=loadSound('piano.mp3'); 
	mySound1 = loadSound('melody.mp3');
  //mySound = loadSound('breathe.mp3');
}

var seed = "openprocessing";
var nums;
var maxLife = 15;
var noiseScale = 200;
var	simulationSpeed = 1.2;
var fadeFrame = 0;

var padding_top = 10;
var padding_side = 210;

var particles = [];
var backgroundColor;
var color_from;
var color_to;
let t=0;
let location1=0;
let location2=0;
let sensorValue=0;

function setup(){

	serial = new p5.SerialPort();
	serial.on('list', printList); // callback function for serialport list event
	serial.on('data', serialEvent); // callback for new data coming in	
	serial.list(); // list the serial ports
	serial.open("/dev/tty.usbmodem144101"); // open a port

	mySound1.play();
	mySound1.loop();

	randomSeed(seed);
	noiseSeed(seed);
	nums = 70;
	
	backgroundColor = color(0, 0, 0);
	
	color_from = color('red');
	color_to = color('orange');
	
	//create a square window for drawing
	createCanvas(windowWidth, windowHeight);
	background(backgroundColor);
	
	noStroke();
	smooth();
	
	//padding_top = (width - inner_square)/2;
	//padding_side = (height - inner_square)/2;
	//console.log('padding_side='+padding_side);
    //var sensorRead=constrain(fromSerial,0,200);
    
    // var sensorValue=map(fromSerial,0,200,0,width);
    // var location=sensorValue;
    

    for(var i = 0; i < nums; i++){
    	var p = new Particle();
    	p.pos.x = location1;
    	p.pos.y = random(padding_side, height-padding_side);
    	particles[i] = p;
    }

    background(color(0));
    fill(color(255));
}

function draw(){

	sensorValue=map(fromSerial-8,0,80,0,1920);
    //location1=sensorValue/2;
    //location2=sensorValue;
    location1=sensorValue;

    //console.log(location1);

    ++fadeFrame;
    if(fadeFrame % 5 == 0){

    	blendMode(DIFFERENCE);
    	fill(1, 1, 1);
    	rect(0,0,width,height);

    	blendMode(LIGHTEST);
    	fill(backgroundColor);
    	rect(0,0,width,height);
    }

    blendMode(BLEND);

    for(var i = 0; i < nums; i++){
		var iterations = map(i,0,nums,10,1);//反复
		var radius = map(i,0,nums,2,5);//半径
		
		particles[i].move(iterations);
		particles[i].checkEdge();
		
		var alpha = 155;
		
		var particle_heading = particles[i].vel.heading()/PI;
		if(particle_heading < 0){
			particle_heading *= -1;
		}
		var particle_color = lerpColor(particles[i].color1, particles[i].color2, particle_heading);
		
		var fade_ratio; 
		fade_ratio = min(particles[i].life * 5 / maxLife, 1);
		fade_ratio = min((maxLife - particles[i].life) * 5 / maxLife, fade_ratio);

		fill(red(particle_color), green(particle_color), blue(particle_color), alpha * fade_ratio);
		particles[i].display(radius);
	} 


	let w = width / melody.length;

	for(let i = 0; i < melody.length; i++){

		index[i]=false;

		if(location1>i*w&&location1<(i+1)*w){
			index[i]=true;
		}


		if(index[i]==true&&index[i]!=pindex[i]){
       //playNote(scale[melody[i]]);
       //console.log('sound');
       //fill(40,100);
       //rect(i*w, 0, w, height);
   }

   pindex[i]=index[i];

   if(location1<0||location1>windowWidth||mouseY<0||mouseY>windowHeight){
   	sample.stop();
   }

}

for(let i=0;i<samples.length;i++){
	let sample=samples[i];
	let volume=sample.amp().value;
	if(volume>=0.8){
		sample.amp(0,5);
	}
	else if(volume<=0){
		sample.stop();
		samples.splice(i,1);
	}
}
}

function playNote(note){
  //let osc=new p5.Oscillator();
  
  let f=note;
  sample.rate(BASE*f);
  //console.log(BASE*f);
  //sample.play();
  sample.amp(0);
  sample.amp(1,0.5);
  samples.push(sample);
  //console.log(samples.length);
  reverb = new p5.Reverb();
  sample.disconnect(); // so we'll only hear reverb...

  // connect soundFile to reverb, process w/
  // 3 second reverbTime, decayRate of 2%
  reverb.process(sample, 3, 2);
  sample.play();
}



// 视觉产生部分

function Particle(){
	this.vel = createVector(0, 0);
	this.pos = createVector(random(0, width),random(30, height-padding_side));
	this.life = random(0, maxLife);
	this.flip = int(random(0,2)) * 2 - 1;
	this.color1 = this.color2 = color(112,86,87);//fading color
	// 设置颜色生成的随机比率
	if(int(random(3)) == 1){
		
		this.color1 = color_from;
		this.color2 = color_to;
	}
	
// 
this.move = function(iterations){
	if((this.life -= 0.01666) < 0)
		this.respawnTop();
	while(iterations > 0){

			var transition = map(this.pos.y, padding_side, height-padding_side, 0, height);//change from0,1 to 0,height
			var angle = noise(this.pos.x/noiseScale, this.pos.y/noiseScale)*transition*PI;//给线条增加随机感

			

			this.vel.x = cos(angle)/5;
			this.vel.y = sin(angle)/4;

			this.vel.mult(simulationSpeed);
			this.pos.add(this.vel);
			--iterations;
		}
	}

 // 限制粒子产生的区域
	this.checkEdge = function(){
		if(this.pos.x > width
			|| this.pos.x <0
			|| this.pos.y > height-padding_side
			|| this.pos.y < padding_side){
			this.respawnTop();
	}
}


}
// 定义particle的产生位置，横坐标对应mouseX，纵坐标在（padding_side, height-padding_side）之间产生

this.respawnTop = function() {
	this.pos.x = location1;
	this.pos.y = random(padding_side, height-padding_side);
	this.life = maxLife;
          //console.log(this.pos.x);

      }

      this.display = function(r){
      	ellipse(this.pos.x, this.pos.y, r, r);
           //console.log(this.pos.x);
       }
   }

//for Auduino

function printList(portList) {
	for (var i = 0; i < portList.length; i++) {
		print(i + " " + portList[i]);
	}
}

function serialEvent(){

	var stringFromSerial = serial.readLine();
	if (stringFromSerial.length>0){
		var trimmedString = trim(stringFromSerial);
		var myArray = split(trimmedString, ",")
		fromSerial = Number(myArray[0]);
		fromSerial2 = Number(myArray[1]); 
	}

	if(fromSerial2>0){
		mySound=mySound1;
		var Volume=map(fromSerial2,0,250,0,4);
	}
	else{
		mySound=mySound1;
		var Volume=map(-1*fromSerial2,0,250,0,4);
	}

	mySound.setVolume(Volume);
	console.log(fromSerial,fromSerial2,Volume);
}

// function mouseClicked() {
//   mySound.play();
//   mySound.loop();
// 设置全屏模式
function mousePressed(){
	let fs=fullscreen();
	fullscreen(!fs);

}

