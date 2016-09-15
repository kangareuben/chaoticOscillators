let scene, camera, renderer;
let spline, geometry, material, object;
let box,boxgeometry,boxmaterial,boxmesh;


init();

function init()
{
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(90,window.innerWidth/(window.innerHeight - 100),1,1000);
	camera.position.z = 100;
	
	geometry = new THREE.Geometry();
	material = new THREE.LineBasicMaterial( { color : 0xff0000 , linewidth:100} );

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth,window.innerHeight-100);
	
	document.body.appendChild(renderer.domElement);
}

function drawSpline(pointArray)
{
	//console.log(pointArray);
	requestAnimationFrame(drawSpline);
	spline = new THREE.CatmullRomCurve3(pointArray);
	geometry.vertices = spline.getPoints(50);
	console.log(spline.getPoints(50));
	//console.log(spline.points);
	//console.log(spline.getPoints(spline.points.length));
	object = new THREE.Line( geometry, material );
	//object.scale.set(100, 100, 100);
	scene.add(object);
	//console.log(spline.points);
	/*boxgeometry = new THREE.BoxGeometry(20,20,20);
	boxmaterial = new THREE.MeshBasicMaterial({color:0xff0000,wireframe:true});
	boxmesh = new THREE.Mesh(boxgeometry,boxmaterial);
	scene.add(boxmesh);*/
	
	renderer.render(scene,camera);
}
