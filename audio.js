let AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx, oscNode, gainNode;
audioInit();

function audioInit()
{
	audioCtx = new AudioContext();
}

function playSound(frequency, duration, amp=1, attack=0, decay=0, detune=0)
{
	oscNode = audioCtx.createOscillator();
	oscNode.type = 'triangle';
	oscNode.frequency.value = frequency;
	
	gainNode = audioCtx.createGain();
	gainNode.gain.setValueAtTime(0,audioCtx.currentTime);
	gainNode.gain.linearRampToValueAtTime(amp,audioCtx.currentTime+attack);
	gainNode.gain.linearRampToValueAtTime(amp,audioCtx.currentTime+duration-decay);
	gainNode.gain.linearRampToValueAtTime(0,audioCtx.currentTime+duration);
	
	oscNode.connect(gainNode);
	gainNode.connect(audioCtx.destination);
	
	oscNode.start();
	oscNode.stop(audioCtx.currentTime+duration);
}