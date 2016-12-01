let audioCtx, oscNode, gainNode;
audioInit();

function audioInit()
{
	audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	tuna = new Tuna(audioCtx);
	convolver = new tuna.Convolver({
		highCut: 22050,
		lowCut: 400,
		dryLevel: 1.0,
		wetLevel: 2.5,
		level: 1,
		impulse: "tuna/impulses/Large%20Long%20Echo%20Hall.wav",
		bypass: 0
	});
}

function playSound(frequency, duration, amp=1, attack=0, decay=0, detune=0)
{
	oscNode = audioCtx.createOscillator();
	oscNode.type = 'triangle';
	oscNode.frequency.value = frequency;
	oscNode.detune.value = detune;
	oscNode.frequency.linearRampToValueAtTime(frequency,audioCtx.currentTime+duration);
	oscNode.frequency.linearRampToValueAtTime(110,audioCtx.currentTime+duration*2);
	
	gainNode = audioCtx.createGain();
	gainNode.gain.setValueAtTime(0,audioCtx.currentTime);
	gainNode.gain.linearRampToValueAtTime(amp,audioCtx.currentTime+attack);
	gainNode.gain.linearRampToValueAtTime(amp,audioCtx.currentTime+duration-decay);
	gainNode.gain.linearRampToValueAtTime(amp/5,audioCtx.currentTime+duration);
	
	oscNode.connect(gainNode);
	gainNode.connect(convolver);
	convolver.connect(audioCtx.destination);
	//gainNode.connect(audioCtx.destination);
	
	oscNode.start();
	oscNode.stop(audioCtx.currentTime+duration*20);
}