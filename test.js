var ManagedView = require('threejs-managed-view');
var loadAndRunScripts = require('loadandrunscripts');
var PointerTrap = require('./');

loadAndRunScripts(
	[
		'bower_components/three.js/three.js'
	],
	function() {

		var containerDiv = document.createElement('div');
		containerDiv.id = 'threejsContainer';
		document.getElementsByTagName('body')[0].appendChild(containerDiv);
		console.log(containerDiv);
		containerDiv.style.position = 'absolute';
		containerDiv.style.left = '25%';
		containerDiv.style.top = '25%';
		containerDiv.style.width = '50%';
		containerDiv.style.height = '50%';
		var view = new ManagedView.View({
			useRafPolyfill: false,
			canvasContainer: containerDiv
		});
		var scene = view.scene;
		var camera = view.camera;

		var sphereGeometry = new THREE.SphereGeometry(.5);
		var size = 100;
		var sizeHalf = size * .5;
		var bounds = new THREE.Box3(
			new THREE.Vector3(-sizeHalf, -sizeHalf, -sizeHalf),
			new THREE.Vector3(sizeHalf, sizeHalf, sizeHalf)
		)
		var random = new THREE.Vector3();
		var boundSize = bounds.size();
		for (var i = 0; i < 1000; i++) {
			var ball = new THREE.Mesh(sphereGeometry);
			scene.add(ball);
			random.set(
				Math.random(),
				Math.random(),
				Math.random()
			);
			ball.position.copy(bounds.min).add(random.multiply(boundSize));
		};

		var rotationSpeed = .001;
		var pointerTrap = new PointerTrap(containerDiv);
		pointerTrap.on('data', function(pos) {
			camera.rotateY(pos.x * -rotationSpeed);
			camera.rotateX(pos.y * -rotationSpeed);
		})


	}
)