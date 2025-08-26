var maxConfettis = 150;
var particles = [];
var possibleColors = [
  "#ff73a5",
  "#fdff6a",
  "#7dfffe",
  "#3ffd8c",
  "#a87eff"
];
var canvas = document.getElementById('confetti-canvas');
var context;
var streamingConfetti = false;
var animationTimer = null;

if (canvas) {
    context = canvas.getContext("2d");
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

function ConfettiParticle(x, y) {
  this.x = x || Math.random() * canvas.width;
  this.y = y || Math.random() * canvas.height;
  this.r = (Math.random() * 2) + 1;
  this.d = (Math.random() * maxConfettis) + 10;
  this.color = possibleColors[Math.floor(Math.random() * possibleColors.length)];
  this.tilt = Math.floor(Math.random() * 10) - 10;
  this.tiltAngleIncremental = (Math.random() * 0.07) + .05;
  this.tiltAngle = 0;

  this.draw = function() {
    context.beginPath();
    context.lineWidth = this.r / .7;
    context.strokeStyle = this.color;
    context.moveTo(this.x + this.tilt + (this.r / 4), this.y);
    context.lineTo(this.x + this.tilt, this.y + this.tilt + (this.r / 4));
    return context.stroke();
  }
}

function Draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < maxConfettis; i++) {
    particles[i].draw();
  }
  var remainingFlakes = 0;
  for (var i = 0; i < maxConfettis; i++) {
    var particle = particles[i];
    particle.tiltAngle += particle.tiltAngleIncremental;
    particle.y += (Math.cos(particle.d) + 3 + particle.r / 2) / 2;
    particle.tilt = Math.sin(particle.tiltAngle - (i / 3)) * 15;

    if (particle.y <= canvas.height) remainingFlakes++;

    if (particle.x > canvas.width + 30 || particle.x < -30 || particle.y > canvas.height) {
      if (streamingConfetti && remainingFlakes < maxConfettis) {
        particle.x = Math.random() * canvas.width;
        particle.y = -30;
      } else {
        particle.x = -100; // Effectively remove it
      }
    }
  }

  return remainingFlakes > 0;
}

export function launchConfetti() {
    if(!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    for (var i = 0; i < maxConfettis / 3; i++) {
        particles.push(new ConfettiParticle(Math.random() * canvas.width, -30));
    }
    if (!animationTimer) {
        (function runAnimation() {
            if (Draw()) {
                animationTimer = requestAnimationFrame(runAnimation);
            } else {
                context.clearRect(0, 0, canvas.width, canvas.height);
                animationTimer = null;
                particles = []; // Clear particles after animation
            }
        })();
    }
}

export function startConfetti() {
    if(!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    for (var i = 0; i < maxConfettis; i++) {
        particles.push(new ConfettiParticle());
    }
    streamingConfetti = true;
    if (animationTimer === null) {
        (function runAnimation() {
            Draw();
            animationTimer = requestAnimationFrame(runAnimation);
        })();
    }
}

export function stopConfetti() {
  streamingConfetti = false;
}

export function removeConfetti() {
  stopConfetti();
  particles = [];
}