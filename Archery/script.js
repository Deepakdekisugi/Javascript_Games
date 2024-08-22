var svg = document.querySelector("svg");
var cursor = svg.createSVGPoint();
var arrows = document.querySelector(".arrows");
var randomAngle = 0;

// center of target
var target = {
	x: 900,
	y: 249.5
};

// target intersection line segment
var lineSegment = {
	x1: 875,
	y1: 280,
	x2: 925,
	y2: 220
};

// bow rotation point
var pivot = {
	x: 100,
	y: 250
};
aim({
	clientX: 320,
	clientY: 300
});



// set up start drag event
window.addEventListener("mousedown", draw);

function draw(e) {
	// pull back arrow
	randomAngle = (Math.random() * Math.PI * 0.03) - 0.015;
	TweenMax.to(".arrow-angle use", 0.3, {
		opacity: 1
	});
	window.addEventListener("mousemove", aim);
	window.addEventListener("mouseup", loose);
	aim(e);
}



function aim(e) {
	// get mouse position in relation to svg position and scale
	var point = getMouseSVG(e);
	point.x = Math.min(point.x, pivot.x - 7);
	point.y = Math.max(point.y, pivot.y + 7);
	var dx = point.x - pivot.x;
	var dy = point.y - pivot.y;
	// Make it more difficult by adding random angle each time
	var angle = Math.atan2(dy, dx) + randomAngle;
	var bowAngle = angle - Math.PI;
	var distance = Math.min(Math.sqrt((dx * dx) + (dy * dy)), 50);
	var scale = Math.min(Math.max(distance / 30, 1), 2);
	TweenMax.to("#bow", 0.3, {
		scaleX: scale,
		rotation: bowAngle + "rad",
		transformOrigin: "right center"
	});
	var arrowX = Math.min(pivot.x - ((1 / scale) * distance), 88);
	TweenMax.to(".arrow-angle", 0.3, {
		rotation: bowAngle + "rad",
		svgOrigin: "100 250"
	});
	TweenMax.to(".arrow-angle use", 0.3, {
		x: -distance
	});
	TweenMax.to("#bow polyline", 0.3, {
		attr: {
			points: "88,200 " + Math.min(pivot.x - ((1 / scale) * distance), 88) + ",250 88,300"
		}
	});

	var radius = distance * 9;
	var offset = {
		x: (Math.cos(bowAngle) * radius),
		y: (Math.sin(bowAngle) * radius)
	};
	var arcWidth = offset.x * 3;

	TweenMax.to("#arc", 0.3, {
		attr: {
			d: "M100,250c" + offset.x + "," + offset.y + "," + (arcWidth - offset.x) + "," + (offset.y + 50) + "," + arcWidth + ",50"
		},
			autoAlpha: distance/60
	});

}