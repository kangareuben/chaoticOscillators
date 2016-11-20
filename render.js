let scene, camera, renderer;
let light, geometry, material, object,sprite,bumpmap;
let box,boxgeometry,boxmaterial,boxmesh;
let angle,dollyspeed;
let cameraRadius=400;
let textureLoader, composer;
let timeToStartFade = 1536;

let wipeoutLength = 35;
let wipeoutFrame = 36;
let c = "0x0a0a0a";

let counter=0;
let soundDensity=13;
let carr, mod, gain, gain2;
let carrierFrequency, modulationIndex, modulationGain, ratio, modulationFrequency;

let gui, params;

let MouseWheelHandler = function(e) {
	if(e.wheelDelta)
		cameraRadius+=e.wheelDelta/60;
	else
		cameraRadius+=e.detail;
}

let Clamp = function(valueToClamp, lowerLimit, upperLimit) {
	return Math.min(Math.max(valueToClamp, lowerLimit),upperLimit);
}

document.body.addEventListener("mousewheel",MouseWheelHandler,false);
document.body.addEventListener("DOMMouseScroll",MouseWheelHandler,false);

init();

function addHexColor(c1, c2) {
  var hexStr = (parseInt(c1, 16) + parseInt(c2, 16)).toString(16);
  while (hexStr.length < 6) { hexStr = '0' + hexStr; } // Zero pad.
  return hexStr;
}

function init()
{
	scene = new THREE.Scene();
	//scene.fog = new THREE.FogExp2( 0x000000, 1/(2*cameraRadius) );
	camera = new THREE.PerspectiveCamera(90,window.innerWidth/window.innerHeight,1,1000);
	//camera = new THREE.OrthographicCamera(window.innerWidth/-2,window.innerWidth/2,(window.innerHeight-100)/2,(window.innerHeight-100)/-2,1,1000);
	
	geometry = new THREE.Geometry();
	material = new THREE.LineBasicMaterial( { color : 0xff0000 , linewidth:100} );
	
	textureLoader = new THREE.TextureLoader();
	sprite = textureLoader.load("./snowflake1.png");
	//bumpmap = textureLoader.load("./bump.jpg");

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth,window.innerHeight);
	/*
	composer = new THREE.EffectComposer( renderer );
	composer.addPass( new THREE.RenderPass( scene, camera ) );
	
	postProcessing();*/
	
	angle=0;
	dollyspeed=0.002;
	
	light = new THREE.AmbientLight(0xff70ff);
	scene.add(light);
	
	document.body.appendChild(renderer.domElement);
	
	carrierFrequency = 200;
	modulationIndex = 10;
	ratio = 0.2;
	
	carr = audioCtx.createOscillator();
	carr.type = 'triangle';
	carr.frequency.value = carrierFrequency;
	carr.start();
	
	mod = audioCtx.createOscillator();
	mod.disconnect();
	mod.frequency.value = 0.25;
	mod.start();
	
	gain = audioCtx.createGain();
	gain2 = audioCtx.createGain();
	mod.connect(gain);
	gain.connect(carr.frequency);
	carr.connect(gain2);
	gain2.connect(convolver);
	convolver.connect(audioCtx.destination);
	
	gain2.gain.value = 0.2;
	
	gui = new dat.GUI({
		height: 4 * 32 - 1
	});
	
	params = {
		chaos: 10,
		decay: 11,
		duality: 53,
		stability: 30
	};
	
	gui.add(params, "chaos").min(0).max(100).step(1).listen();
	gui.add(params, "decay").min(0).max(100).step(1).listen();
	gui.add(params, "duality").min(0).max(100).step(1).listen();
	gui.add(params, "stability").min(0).max(100).step(1).listen();
}

function postProcessing()
{
	let dotScreenEffect = new THREE.ShaderPass( THREE.LuminosityShader );
	//dotScreenEffect.uniforms[ 'scale' ].value = 4;
	//composer.addPass(new THREE.BloomPass(3,25,5,256));
	dotScreenEffect.renderToScreen = true;
	composer.addPass( dotScreenEffect );
}

function wipeout()
{	
	for(let i = 1; i < scene.children.length; i++)
	{
		if(i%wipeoutLength==0)
		{
			scene.children[i].material.emissive = c;
		}
	}
	
	wipeoutFrame++;
	
	if(wipeoutFrame > wipeoutLength)
	{
		for(let i = 1; i < scene.children.length; i++)
		{
			if(scene.children[i].material.emissive == c)
			{
				scene.remove(scene.children[i]);
			}
		}
		}
}

function normalizeDollySpeed()
{
	if(dollyspeed > 0.04)
		dollyspeed = 0.04;
	if(dollyspeed > 0.002)
		dollyspeed -= 0.00004;
	if(dollyspeed < (-0.04))
		dollyspeed = (-0.04);
	if(dollyspeed < (0.002))
		dollyspeed += 0.00004;
}

function drawSpline(pointArray)
{
	camera.position.x = cameraRadius * Math.cos( angle );  
	camera.position.z = cameraRadius * Math.sin( angle );
	cameraRadius = Clamp(cameraRadius,100,1000);
	normalizeDollySpeed();
	angle += dollyspeed;
	camera.lookAt(new THREE.Vector3(0,0,0));
	DeleteOldestChild();
	for(let i=1;i<scene.children.length;i++)
	{
		scene.children[i].quaternion.copy(camera.quaternion);
		if(scene.children.length - i <= (timeToStartFade + 256)){
			scene.children[i].material.color.setHex(CalculateColor(scene.children.length - i));
			//console.log(c);
		}
	}
	
	if(wipeoutFrame > wipeoutLength)
	{
		if(scene.children.length > timeToStartFade + 254)
		{
			//console.log(0.00001 * scene.children.length);
			if(Math.random() < 0.00001 * scene.children.length)
			{
				wipeoutFrame = 0;
				wipeout();
			}
		}
	}
	else
	{
		wipeout();
		if(wipeoutFrame == wipeoutLength)
		{
			//soundDensity=5;
		}
	}
	
	boxgeometry = new THREE.PlaneGeometry(5,5);
	boxmaterial = new THREE.MeshPhongMaterial({map:sprite,transparent:true,blending:THREE.AdditiveBlending,color:0xff0000,specular:0xffffff,shininess:10000,emissive:0x101010});
	boxmesh = new THREE.Mesh(boxgeometry,boxmaterial);
	//light = new THREE.PointLight(0xff00ff,1000000,1000000);
	//scene.add(light);
	scene.add(boxmesh);
	boxmesh.position.set(pointArray[pointArray.length-1].x,pointArray[pointArray.length-1].y,pointArray[pointArray.length-1].z);
	//light.position.set(pointArray[pointArray.length-1].x,pointArray[pointArray.length-1].y,pointArray[pointArray.length-1].z);
	
	//carr.frequency.value = boxmesh.position.y;
	modulationIndex = camera.position.distanceTo(boxmesh.position)/100;
	//modulationGain = carrierFrequency * modulationIndex;
	modulationGain =  camera.position.distanceTo(boxmesh.position)/10;
	//modulationFrequency = carrierFrequency * ratio;
	modulationFrequency = 2 / Math.abs(boxmesh.position.x / boxmesh.position.y);
	mod.frequency.value = modulationFrequency;
	gain.gain.value = modulationGain;
	gain2.gain.value = 100 / (camera.position.distanceTo(boxmesh.position));
	
	//carr.frequency.value += mod.frequency.value * modulationGain;
	
	//osc.frequency.value = boxmesh.position.y*((mod.frequency.value * boxmesh.position.x)/(camera.position.distanceTo(boxmesh.position)))*100;
	//console.log(osc.frequency.value);
	//gain.gain.value = (camera.position.distanceTo(boxmesh.position)) * 0.0005;
	
	
	//playaudio
	if(counter%soundDensity==0)
	{
		playSound(Math.sqrt(Math.pow(boxmesh.position.x,2)+Math.pow(boxmesh.position.y,2)+Math.pow(boxmesh.position.z,2)),0.02,1,0.001,0.009,750 - Math.random()*1000);
	}
	counter++;
	if((counter%190==0)&&(soundDensity>5))
	{
		soundDensity--;
	}
	//console.log(soundDensity);
	renderer.render(scene,camera);
}

function DeleteOldestChild(){
	if(scene.children.length > timeToStartFade + 256){
		scene.remove(scene.children[1]);
		//console.log(scene.children.length);
	}
}

let CalculateColor = function(timeSinceRed){
	if(timeSinceRed >= (timeToStartFade + 256)){
		return rgbToHex(0, 0, 0);
	}
	else if(timeSinceRed >= timeToStartFade){
		return rgbToHex((timeToStartFade + 255) - timeSinceRed, (timeToStartFade + 255) - timeSinceRed, (timeToStartFade + 255) - timeSinceRed);
	}
	else if(timeSinceRed >= 255){
		return rgbToHex(255, 255, 255);
	}
	else{
		return rgbToHex(255, timeSinceRed, timeSinceRed);
	}
}

let rgbToHex = function(r, g, b){
	return "0x" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

let componentToHex = function(c){
	let hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}
