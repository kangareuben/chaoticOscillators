/*
let canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 100;

let ctx = canvas.getContext("2d");
*/

 function p(x){
	//let tempM0 = sliderM0.value;
	//let tempM1 = sliderM1.value;
	let tempM0 = mapInputToOutputRange(params.chaos,0,100,-1.05,-2);
	let tempM1 = mapInputToOutputRange(params.duality,0,100,-0.96,-0.5);
   return tempM1*x+(tempM0-tempM1)/2*(Math.abs(x+1)-Math.abs(x-1));
}

// let sliderC1 = document.getElementById("SliderC1");
// let sliderC2 = document.getElementById("SliderC2");
// let sliderC3 = document.getElementById("SliderC3");
// let sliderM0 = document.getElementById("SliderM0");
// let sliderM1 = document.getElementById("SliderM1");

let leapCenter, leapHeight, leapWidth, leapDepth;


function f(x,y,z,t)
{ 
	return( mapInputToOutputRange(params.stability,0,100,18,10)*(y-x-p(x)) ); 
}

function g(x,y,z,t){ return( mapInputToOutputRange(params.convergence,0,100,0.5,5.0)*(x-y+z) ); }

function h(x,y,z,t){ return( -1*28*y ); }
 
 
function updateLeapInteractionBox(frame)
{
	leapCenter = frame.interactionBox.center;
	leapDepth = frame.interactionBox.depth;
	leapHeight = frame.interactionBox.height;
	leapWidth = frame.interactionBox.width;
}

/*rungekatta begins here*/
function rungekatta(){
var t=gData[0].t;
var x=gData[0].x;
var y=gData[0].y;
var z=gData[0].z;

var tempt = t;
var tempx = x;
var tempy = y;
var tempz = z;
var k1x = step * f(tempx, tempy, tempz, tempt);
var k1y = step * g(tempx, tempy, tempz, tempt);
var k1z = step * h(tempx, tempy, tempz, tempt);

tempt = t + step/4.0;
tempx = x + k1x/4.0;
tempy = y + k1y/4.0;
tempz = z + k1z/4.0; 
var k2x = step * f(tempx, tempy, tempz, tempt);
var k2y = step * g(tempx, tempy, tempz, tempt);
var k2z = step * h(tempx, tempy, tempz, tempt);

tempt = t + (3.0/8.0)*step;
tempx = x + (3.0/32.0)*k1x + (9.0/32.0)*k2x;
tempy = y + (3.0/32.0)*k1y + (9.0/32.0)*k2y;
tempz = z + (3.0/32.0)*k1z + (9.0/32.0)*k2z;
var k3x = step * f(tempx, tempy, tempz, tempt);
var k3y = step * g(tempx, tempy, tempz, tempt);
var k3z = step * h(tempx, tempy, tempz, tempt);

tempt = t + (12.0/13.0)*step;
tempx = x + (1932.0/2197.0)*k1x - (7200.0/2197.0)*k2x+(7296.0/2197.0)*k3x;
tempy = y + (1932.0/2197.0)*k1y - (7200.0/2197.0)*k2y+(7296.0/2197.0)*k3y;
tempz = z + (1932.0/2197.0)*k1z - (7200.0/2197.0)*k2z+(7296.0/2197.0)*k3z;
var k4x = step * f(tempx, tempy, tempz, tempt);
var k4y = step * g(tempx, tempy, tempz, tempt);
var k4z = step * h(tempx, tempy, tempz, tempt);

tempt = t + step;
tempx = x + (439.0/216.0)*k1x - 8.0*k2x + (3680.0/513.0)*k3x-(845.0/4104.0)*k4x;
tempy = y + (439.0/216.0)*k1y - 8.0*k2y + (3680.0/513.0)*k3y-(845.0/4104.0)*k4y;
tempz = z + (439.0/216.0)*k1z - 8.0*k2z + (3680.0/513.0)*k3z-(845.0/4104.0)*k4z;
var k5x = step * f(tempx, tempy, tempz, tempt);
var k5y = step * g(tempx, tempy, tempz, tempt);
var k5z = step * h(tempx, tempy, tempz, tempt);

tempt = t + step/2.0;
tempx = x - (8.0/27.0)*k1x + 2.0*k2x - (3544.0/2565.0)*k3x+(1859.0/4104.0)*k4x-(11.0/40.0)*k5x;
tempy = y - (8.0/27.0)*k1y + 2.0*k2y - (3544.0/2565.0)*k3y+(1859.0/4104.0)*k4y-(11.0/40.0)*k5y;
tempz = z - (8.0/27.0)*k1z + 2.0*k2z - (3544.0/2565.0)*k3z+(1859.0/4104.0)*k4z-(11.0/40.0)*k5z;
var k6x = step * f(tempx, tempy, tempz, tempt);
var k6y = step * g(tempx, tempy, tempz, tempt);
var k6z = step * h(tempx, tempy, tempz, tempt);

var newpoints=new Array();
//x
newpoints[0]=( x + (16.0/135.0)*k1x + (6656.0/12825.0)*k3x+(28561.0/56430.0)*k4x-(9.0/50.0)*k5x+(2.0/55.0)*k6x);
//y
newpoints[1]=( y + (16.0/135.0)*k1y + (6656.0/12825.0)*k3y+ (28561.0/56430.0)*k4y-(9.0/50.0)*k5y+ (2.0/55.0)*k6y);
//z 
newpoints[2]=( z + (16.0/135.0)*k1z + (6656.0/12825.0)*k3z+ (28561.0/56430.0)*k4z-(9.0/50.0)*k5z+(2.0/55.0)*k6z);
return newpoints;
}
/*rungekatta ends here*/


function grapher(gData){
pointarray=new Array();
var depth=100;
var newpoints=rungekatta();
var ecks=newpoints[0];

var wai=newpoints[1];

var see=newpoints[2];

var tee=gData[0].t+step;

 
pointarray[0]={x:ecks,y:wai,z:see,t:tee};
pointarray[1]=gData[0];
return pointarray;
}

gData=new Array();
gData[0]={x:0.7,y:0,z:0,t:0};//x:0.7,y:0,z:0
var c1=15.6;//15.6
var c2=1;//1
var c3=28;//28
var m0=-1.143;//-1.143
var m1=-0.714;//0.714
var step =0.012;//0.012

let drawChua = function(){
	setInterval(chuaStep, 10);
}

let chuaStep = function(/*frame*/){
	gData = grapher(gData);
	splinePoints.push(new THREE.Vector3(100*gData[0].x,100*gData[0].y,100*gData[0].z));
	update();
	//handleLeapInput(frame);
}

let handleLeapInput = function(frame) {
	updateLeapInteractionBox(frame);
	//gestures to zoom
	if(frame.gestures.length > 0)
	{
		for(let g=0; g < frame.gestures.length; g++)
		{
			let gesture = frame.gestures[g];
			if(gesture.type == "swipe")
			{
				console.log(gesture.speed);
				if(Math.abs(gesture.direction[0])>Math.abs(gesture.direction[1]))
				{
					if(gesture.direction[0] > 0)
					{
						//rightswipe
						dollyspeed+=0.002*gesture.speed/50;
						break;
					}
					else
					{
						dollyspeed-=0.002*gesture.speed/50;
						break;
						//leftswipe
					}
				}
				else
				{
					if(gesture.direction[1] > 0)
					{
						params.chaos+=3;
						params.chaos = Clamp(params.chaos,0,100);
						break;
					}
					else
					{
						params.chaos-=3;
						params.chaos = Clamp(params.chaos,0,100);
						break;
					}
				}
			}
		}
	}
}

let mapInputToOutputRange = function(input, inputMin, inputMax, outputMin, outputMax)
{
	let output = outputMin + (input-inputMin) * (outputMax - outputMin)/(inputMax - inputMin);
	return output;
}

let update = function() {
	drawSpline(splinePoints);
}

let splinePoints = new Array();
drawChua();
Leap.loop({enableGestures: true},handleLeapInput);