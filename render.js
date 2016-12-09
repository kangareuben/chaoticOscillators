// Scene variables
let scene, camera, renderer, light, textureLoader;

// Camera variables
let angle, dollyspeed;
let cameraRadius = 400;

// Geometry variables
let geometry, material, mesh, sprite;

// Fade and wipeout variables
let timeToStartFade = 1536;
let wipeoutLength = 35;
let wipeoutFrame = 36;
let emissiveColor = "0x0a0a0a";

// Periodic effects variables
let counter = 0;
let soundDensity = 13;

// GUI variables (dat.gui)
let gui, params;

// Event handlers
let MouseWheelHandler = function(e)
{
	if(e.wheelDelta)
	{
		cameraRadius += e.wheelDelta / 60;
	}
	else
	{
		cameraRadius += e.detail;
	}
}

// Event listeners
document.body.addEventListener("mousewheel", MouseWheelHandler, false);
document.body.addEventListener("DOMMouseScroll", MouseWheelHandler, false);

// Initialization
init();

function init()
{
	// Initialize three.js scene
	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0x000000, 1 / (2 * cameraRadius));
	camera = new THREE.PerspectiveCamera(90,window.innerWidth/window.innerHeight,1,1000);		
	textureLoader = new THREE.TextureLoader();
	sprite = textureLoader.load("./snowflake1.png");
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth,window.innerHeight);
	
	// Add ambient light
	light = new THREE.AmbientLight(0xff70ff);
	scene.add(light);
	
	// Initialize camera variables
	angle = 0;
	dollyspeed = 0.002;
	
	//Initialize GUI
	/* ---------------------------------------------------------------------------------------------------------------------------------------------- */
	gui = new dat.GUI({
		height: 4 * 32 - 1
	});
	
	params = {
		chaos: 10,
		convergence: 11,
		duality: 53,
		stability: 30,
		foregroundVol: 100,
		backgroundVol: 20
	};
	
	gui.add(params, "chaos").min(0).max(100).step(1).listen();
	gui.add(params, "convergence").min(0).max(100).step(1);
	gui.add(params, "duality").min(0).max(100).step(1);
	gui.add(params, "stability").min(0).max(100).step(1);
	gui.add(params, "foregroundVol").min(0).max(100).step(1);
	gui.add(params, "backgroundVol").min(0).max(100).step(1);
	/* ---------------------------------------------------------------------------------------------------------------------------------------------- */
	
	document.body.appendChild(renderer.domElement);
}

// Wipes out snowflakes periodically in a cool pattern
function wipeout()
{	
	//Change every nth snowflake to black
	for(let i = 1; i < scene.children.length; i++)
	{
		if(i % wipeoutLength == 0)
		{
			scene.children[i].material.emissive = emissiveColor;
		}
	}
	
	wipeoutFrame++;
	
	// When wipeout end is reached, delete blacked-out snowflakes from scene
	if(wipeoutFrame > wipeoutLength)
	{
		for(let i = 1; i < scene.children.length; i++)
		{
			if(scene.children[i].material.emissive == emissiveColor)
			{
				scene.remove(scene.children[i]);
			}
		}
	}
}

// Bring the camera dolly speed back to the initial value if it's been changed by a Leap input
function normalizeDollySpeed()
{
	if(dollyspeed > 0.04)
	{
		dollyspeed = 0.04;
	}
	if(dollyspeed > 0.002)
	{
		dollyspeed -= 0.00004;
	}
	if(dollyspeed < (-0.04))
	{
		dollyspeed = (-0.04);
	}
	if(dollyspeed < (0.002))
	{
		dollyspeed += 0.00004;
	}
}

// Main draw function
// Called once per frame
function draw(pointArray)
{
	// Dolly the camera around a central point
	camera.position.x = cameraRadius * Math.cos(angle);  
	camera.position.z = cameraRadius * Math.sin(angle);
	angle += dollyspeed;
	camera.lookAt(new THREE.Vector3(0,0,0));
	normalizeDollySpeed();
	
	// Clamp the camera radius
	cameraRadius = Clamp(cameraRadius, 100, 1000);
	
	// Delete oldest snowflake if the limit has been reached
	DeleteOldestChild();
	
	// Rotate snowflake planes to face the camera and fade their color to white
	for(let i=1;i<scene.children.length;i++)
	{
		scene.children[i].quaternion.copy(camera.quaternion);
		
		if(scene.children.length - i <= (timeToStartFade + 256))
		{
			scene.children[i].material.color.setHex(CalculateColor(scene.children.length - i));
		}
	}
	
	// Randomly trigger wipeout (or not) once a minimum number of snowflakes is present
	if(wipeoutFrame > wipeoutLength)
	{
		if(scene.children.length > timeToStartFade + 254)
		{
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
	}
	
	// Create snowflake and add it to scene
	geometry = new THREE.PlaneGeometry(5, 5);
	material = new THREE.MeshPhongMaterial({map:sprite,transparent:true,blending:THREE.AdditiveBlending,color:0xff0000,specular:0xffffff,shininess:10000,emissive:0x101010});
	mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);
	
	// Set position based on Chua calculations
	mesh.position.set(pointArray[pointArray.length-1].x,pointArray[pointArray.length-1].y,pointArray[pointArray.length-1].z);
	
	// Update frequency modulation sound (background)
	updateFM(camera.position.distanceTo(mesh.position), mesh.position.x, mesh.position.y, params.backgroundVol);
	
	// Play bleeps and bloops at interval (sound density)
	if(counter % soundDensity == 0)
	{
		playSound(Math.sqrt(Math.pow(mesh.position.x, 2) + Math.pow(mesh.position.y, 2) + Math.pow(mesh.position.z, 2)),
				  0.02,
				  (params.foregroundVol / 100),
				  0.001,
				  0.009,
				  750 - Math.random() * 1000);
	}
	
	// Increment snowflake counter
	counter++;
	
	// Modify sound density based on snowflake counter
	if((counter % 190 == 0 ) && (soundDensity > 5))
	{
		soundDensity--;
	}
	
	// Render the scene
	renderer.render(scene,camera);
}

// Only delete oldest child if a limit of snowflakes has been reached
function DeleteOldestChild()
{
	if(scene.children.length > timeToStartFade + 256){
		scene.remove(scene.children[1]);
	}
}

// Helper functions
/* ---------------------------------------------------------------------------------------------------------------------------------------------- */
// Calculate the display color of a snowflake based on its age and fade time
let CalculateColor = function(timeSinceRed)
{
	if(timeSinceRed >= (timeToStartFade + 256))
	{
		return rgbToHex(0, 0, 0);
	}
	else if(timeSinceRed >= timeToStartFade)
	{
		return rgbToHex((timeToStartFade + 255) - timeSinceRed, (timeToStartFade + 255) - timeSinceRed, (timeToStartFade + 255) - timeSinceRed);
	}
	else if(timeSinceRed >= 255)
	{
		return rgbToHex(255, 255, 255);
	}
	else{
		return rgbToHex(255, timeSinceRed, timeSinceRed);
	}
}

// Simple RGB-hex string conversion
let rgbToHex = function(r, g, b)
{
	return "0x" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// Simple decimal-hex conversion
let componentToHex = function(c)
{
	let hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

// Add two colors in hex
function addHexColor(c1, c2)
{
  var hexStr = (parseInt(c1, 16) + parseInt(c2, 16)).toString(16);
  while (hexStr.length < 6) { hexStr = '0' + hexStr; } // Zero pad.
  return hexStr;
}

// Clamp a value between two limits
let Clamp = function(valueToClamp, lowerLimit, upperLimit)
{
	return Math.min(Math.max(valueToClamp, lowerLimit),upperLimit);
}
/* ---------------------------------------------------------------------------------------------------------------------------------------------- */