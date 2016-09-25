let scene, camera, renderer;
let spline, geometry, material, object;
let box,boxgeometry,boxmaterial,boxmesh;
let angle=0;
let cameraRadius=400;
//let particles,sprite;
let textureLoader;

let MouseWheelHandler = function(e) {
	//console.log(e.wheelDelta);
	console.log(e.detail);
	// let delta = Math.max(-1,Math.min(1,(e.wheelDelta||-e.detail)));
	// sliderRad.value=sliderRad.value+parseInt(e.wheelDelta*1/120);
	// updateRad();
	if(e.wheelDelta)
		cameraRadius+=e.wheelDelta/60;
	else
		cameraRadius+=e.detail;
	if(cameraRadius<100)
		cameraRadius=100;
	if(cameraRadius>1000)
		cameraRadius=1000;
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
	scene.fog = new THREE.FogExp2( 0x000000, 1/(2*cameraRadius) );
	camera = new THREE.PerspectiveCamera(90,window.innerWidth/(window.innerHeight - 100),1,1000);
	//camera = new THREE.OrthographicCamera(window.innerWidth/-2,window.innerWidth/2,(window.innerHeight-100)/2,(window.innerHeight-100)/-2,1,1000);
	//camera.position.z = 400;
	
	geometry = new THREE.Geometry();
	material = new THREE.LineBasicMaterial( { color : 0xff0000 , linewidth:100} );
	
	textureLoader = new THREE.TextureLoader();
	sprite = textureLoader.load("./snowflake1.png");

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth,window.innerHeight-100);
	
	document.body.appendChild(renderer.domElement);
}

function drawSpline(pointArray)
{
	camera.position.x = cameraRadius * Math.cos( angle );  
	camera.position.z = cameraRadius * Math.sin( angle );
	angle += 0.001;
	camera.lookAt(new THREE.Vector3(0,0,0));
	for(let i=0;i<scene.children.length;i++)
	{
		scene.children[i].quaternion.copy(camera.quaternion);
		if(scene.children.length - i <= 255){
			scene.children[i].material.color.setHex(CalculateColor(scene.children.length - i));
		}
	}
	
	boxgeometry = new THREE.PlaneGeometry(5,5);
	boxmaterial = new THREE.MeshBasicMaterial({map:sprite,transparent:true,blending:THREE.AdditiveBlending,color:0xff0000});
	boxmesh = new THREE.Mesh(boxgeometry,boxmaterial);
	scene.add(boxmesh);
	boxmesh.position.set(pointArray[pointArray.length-1].x,pointArray[pointArray.length-1].y,pointArray[pointArray.length-1].z);
	
	// if(scene.children.length>0)
	// scene.remove(scene.children[0]);
	//console.log(pointArray.length);
	//requestAnimationFrame(drawSpline);
	//spline = new THREE.CatmullRomCurve3(pointArray);
	//geometry.vertices = pointArray;
	//console.log(geometry.vertices);
	//console.log(spline.getPoints(pointArray.length));
	//console.log(spline.points);
	//console.log(spline.getPoints(spline.points.length));
	//object = new THREE.Line( geometry, material );
	//object.scale.set(100, 100, 100);
	//scene.add(object);
	//console.log(spline.points);
	
	//Create a closed wavey loop
	// box = new THREE.CatmullRomCurve3( [
	// new THREE.Vector3( -10, 0, 10 ),
	// new THREE.Vector3( -5, 5, 5 ),
	// new THREE.Vector3( 0, 0, 0 ),
	// new THREE.Vector3( 5, -5, 5 ),
	// new THREE.Vector3( 10, 0, 10 )
	// ] );

	// boxgeometry = new THREE.Geometry();
	// boxgeometry.vertices = box.getPoints( 50 );

	// boxmaterial = new THREE.LineBasicMaterial( { color : 0xff0000 } );
	// boxmesh = new THREE.Line(boxgeometry,boxmaterial);
	// scene.add(boxmesh);
	
	renderer.render(scene,camera);
}

let CalculateColor = function(timeSinceRed){
	if(timeSinceRed >= 255){
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
