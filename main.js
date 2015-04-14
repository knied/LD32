$(document).ready(function() {
    var canvas = $("#main_webgl_canvas")[0];
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    var gl = undefined;
    try {
        gl = canvas.getContext("experimental-webgl");
    } catch (e) {
	console.error("WebGL is not supported in this browser");
	return;
    }

    var audioContext = undefined;
    try {
	// Fix up for prefixing
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	audioContext = new AudioContext();
    }
    catch(e) {
	console.warn("Web Audio API is not supported in this browser");
    }

    // prevent the context menu from popping up
    $('body').on('contextmenu', '#main_webgl_canvas', function(e){ return false; });
    
    var game = new Game(gl, audioContext);
    window.onresize = function(event) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	game.resize();
    }
    canvas.onmousedown = function(event) {
	game.mouseDown(event.button);
    }
    canvas.onmouseup = function(event) {
	game.mouseUp(event.button);
    }
    canvas.onmousemove = function(event) {
	game.mouseMove(event.clientX, event.clientY);
    }
    canvas.onmousewheel = function(event) {
	game.mouseWheel(event.wheelDelta / 20.0);
	event.preventDefault();
	return false;
    }
    canvas.addEventListener('DOMMouseScroll', function(event) {
	game.mouseWheel(event.detail);
	event.preventDefault();
	return false;
    }, false);
    document.addEventListener("keydown", function(event) {
	game.keyDown(event.keyCode);
    }, false);
    document.addEventListener("keyup", function(event) {
	game.keyUp(event.keyCode);
    }, false);

    var oldTime = 0.0;
    !function mainLoop (newTime) {
	requestAnimationFrame(mainLoop, canvas);

	var dt = (newTime - oldTime) / 1000.0;
	oldTime = newTime;

	game.update(dt);
    }(0.0);
});
