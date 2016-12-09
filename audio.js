// Bleep and bloop variables
let audioCtx, oscNode, gainNode;

// Frequency modulation variables
let carr, mod, gain, gain2;
let carrierFrequency, modulationIndex, modulationGain, ratio, modulationFrequency;

// Audio initialization
audioInit();

function audioInit()
{
	// Bleeps and bloops
	/* ---------------------------------------------------------------------------------------------------------------------------------------------- */
	
	// Initialize audio context and external libraries
	audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	tuna = new Tuna(audioCtx);
	
	// Create convolver (reverb)
	convolver = new tuna.Convolver({
		highCut: 22050,
		lowCut: 400,
		dryLevel: 1.0,
		wetLevel: 2.5,
		level: 1,
		impulse: "tuna/impulses/Large%20Long%20Echo%20Hall.wav",
		bypass: 0
	});
	/* ---------------------------------------------------------------------------------------------------------------------------------------------- */
	
	// FM stuff
	/* ---------------------------------------------------------------------------------------------------------------------------------------------- */
	// Initialize FM variables
	carrierFrequency = 200;
	modulationIndex = 10;
	ratio = 0.2;
	
	// Create carrier oscillator
	carr = audioCtx.createOscillator();
	carr.type = 'triangle';
	carr.frequency.value = carrierFrequency;
	carr.start();
	
	// Create modulation oscillator
	mod = audioCtx.createOscillator();
	mod.disconnect();
	mod.frequency.value = 0.25;
	mod.start();
	
	// Create gain nodes
	gain = audioCtx.createGain();
	gain2 = audioCtx.createGain();
	
	// Connect nodes
	mod.connect(gain);
	gain.connect(carr.frequency);
	carr.connect(gain2);
	gain2.connect(convolver);
	convolver.connect(audioCtx.destination);
	
	// Set initial volume
	gain2.gain.value = 0.2;
	/* ---------------------------------------------------------------------------------------------------------------------------------------------- */
}

// Play a bleep or bloop
function playSound(frequency, duration, amp = 1, attack = 0, decay = 0, detune = 0)
{
	// Create new oscillator and initialize it from parameters
	oscNode = audioCtx.createOscillator();
	oscNode.type = 'triangle';
	oscNode.frequency.value = frequency;
	oscNode.detune.value = detune;
	oscNode.frequency.linearRampToValueAtTime(frequency, audioCtx.currentTime + duration);
	oscNode.frequency.linearRampToValueAtTime(110, audioCtx.currentTime + duration * 2);
	
	// Create gain node and initialize it from parameters
	gainNode = audioCtx.createGain();
	gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
	gainNode.gain.linearRampToValueAtTime(amp, audioCtx.currentTime + attack);
	gainNode.gain.linearRampToValueAtTime(amp, audioCtx.currentTime + duration - decay);
	
	// Fade to low drone
	gainNode.gain.linearRampToValueAtTime(amp / 5, audioCtx.currentTime + duration);
	
	// Connect nodes (including reverb)
	oscNode.connect(gainNode);
	gainNode.connect(convolver);
	convolver.connect(audioCtx.destination);
	
	// Play oscillator for specified duration
	oscNode.start();
	oscNode.stop(audioCtx.currentTime + duration * 20);
}

// Update the frequency modulation background audio
function updateFM(cameraDistance, xPos, yPos, bgVol)
{
	//carr.frequency.value = boxmesh.position.y;
	modulationIndex = cameraDistance / 100;
	//modulationGain = carrierFrequency * modulationIndex;
	modulationGain =  cameraDistance / 10;
	//modulationFrequency = carrierFrequency * ratio;
	modulationFrequency = 2 / Math.abs(xPos / yPos);
	mod.frequency.value = modulationFrequency;
	gain.gain.value = modulationGain;
	gain2.gain.value = 5 * (bgVol) / (cameraDistance);
}