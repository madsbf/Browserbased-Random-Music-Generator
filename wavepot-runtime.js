/**
 *
 * Wavepot playback engine
 *
 * This code was originally copied from https://github.com/possan/wavepot-runtime.
 * It is modified to be able to receive a function instead of a string.
 *
 * Use: Instantiate a WavepotRuntime object using a Wavepot-like dsp() function.
 *
 * Examples:
 * ---------
 * function dsp(t) { return 0.1 * Math.sin(2 * Math.PI * t * 440);}
 * var rt = new WavepotRuntime(dsp);
 * rt.play();
 *
 * or
 *
 * var rt = new WavepotRuntime();
 * var codeString = 'function dsp(t) { return 0.1 * Math.sin(2 * Math.PI * t * 440);}';
 * rt.compile(codeString);
 *
 */

function WavepotRuntime(dspFunction, context) {
	this.scope = {};
	this.time = 0;
	this.context = context || new AudioContext();
	this.playing = false;
	this.bufferSize = 1024;
	this.scriptnode = this.context.createScriptProcessor(this.bufferSize, 0, 1);

	this._process = function (e) {
		var out = e.outputBuffer.getChannelData(0);
		var f = 0, t = 0, td = 1.0 / this.context.sampleRate;
		if (this.scope && this.scope.dsp && this.playing) {
			t = this.time;
			for (var i = 0; i < out.length; i++) {
				f = this.scope.dsp(t);
				out[i] = f;
				t += td;
			}
			this.time = t;
		} else {
			for (var i = 0; i < out.length; i++) {
				out[i] = f;
			}
		}
	};

	this.feedDspFunction = function (dspFunction) {
		var newscope = new Object();
		var f = function () {
			this.dsp = dspFunction;
		};
		var r = f.call(newscope);
		if (newscope && typeof(newscope.dsp) == 'function') {
			this.scope = newscope;
			return true;
		} else {
			return false;
		}
	};

	this.compile = function(code) {
		try {
			var f = new Function('var sampleRate=' + this.context.sampleRate+ ';\n\n' + code + '\n\nthis.dsp = dsp;');
		} catch(e) {
			console.error('WavepotRuntime: compilation error', e);
		}
		this.feedDspFunction(f);
	};

	this.play = function () {
		// console.log('WavepotRuntime: play');
		this.playing = true;
	};

	this.stop = function () {
		// console.log('WavepotRuntime: stop');
		this.playing = false;
	};

	this.reset = function () {
		// console.log('WavepotRuntime: reset');
		this.time = 0;
	};

	this.scriptnode.onaudioprocess = this._process.bind(this);
	this.scriptnode.connect(this.context.destination);

	// feed dsp function
	this.feedDspFunction(dspFunction);
};
