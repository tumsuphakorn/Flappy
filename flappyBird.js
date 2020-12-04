
// SELECT CANVAS
const cvs = document.getElementById("canvas");
const ctx = cvs.getContext("2d");

//GAME VARS AND CONSTS
let frames = 0;

//LOAD SPRITE IMAGE
const sprite = new Image();
sprite.src = "img/sprite.png";

//GAME STATE
const state = {
  current: 0,
  start: 0,
  game: 1,
  over: 2
}

//CONTROL THE GAME
cvs.addEventListener("click", function(e) {
  switch (state.current) {
    case state.start: {
      state.current = state.game;
      break;
    }
    case state.game: {
      bird.flap();
      break;
    }
    case state.over: {
      let rect = cvs.getBoundingClientRect();
      let userClickX = e.clientX - rect.left;
      let userClickY = e.clientY - rect.top;
      if (userClickX >= 120 && userClickX <= 203 && userClickY >= 263 && userClickY <= 292) {
        state.current = state.start;
      }
      break;
    }
  }
});

//OBJECT BACKGROUND
const bg = {
  sX: 0,
  sY: 0,
  w: 275,
  h: 226,
  x: 0,
  y: cvs.height - 226,
  draw: function() {
    ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
    ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
  }
}

//OBJECT FOREGROUND
const fg = {
  sX: 276,
  sY: 0,
  w: 224,
  h: 112,
  x: 0,
  y: cvs.height - 112,
  dx: 2,
  update: function() {
    if (state.current == state.game) {
      this.x = (this.x - this.dx) % 128;
    } else {
      this.x = 0;
    }
  },
  draw: function() {
    ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
    ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
  }
}

//OBJECT BIRD
const bird = {
  animation: [{
      sX: 276,
      sY: 112
    },
    {
      sX: 276,
      sY: 139
    },
    {
      sX: 276,
      sY: 164
    },
    {
      sX: 276,
      sY: 139
    }
  ],
  x: 50,
  y: 150,
  w: 34,
  h: 26,

  frame: 0,
  rotation: 0,

  period: 10,

  speed: 0,
  gravity: 0.25,
  jump: 4.5,

  draw: function() {
    let bird = this.animation[this.frame];
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, -this.w / 2, -this.h / 2, this.w, this.h);
    ctx.restore();
  },

  update: function() {
    this.period = (state.current == state.game) ? 5 : 10;
    this.frame += (frames % this.period == 0) ? 1 : 0;
    if (this.frame == 4) {
      this.frame = 0;
    }
    // MOTION
    if (state.current == state.start) {
      this.y = 150;
      this.speed = 0;
      this.rotation = 0 * Math.PI / 180;
    } else {
      this.speed += this.gravity;
      this.y += this.speed;
      if (this.y + this.h / 2 >= cvs.height - fg.h) {
        this.y = cvs.height - fg.h - this.h / 2;
        if (state.current == state.game) {
          state.current = state.over;
        }
      }
      if (this.speed >= this.jump) {
        this.rotation = 90 * Math.PI / 180;
        this.frame = 1;
      } else if (this.speed >= 0 && this.speed < this.jump) {
        this.rotation = 0;
      } else {
        this.rotation = -25 * Math.PI / 180;
      }
    }

  },

  flap: function() {
    this.speed = -this.jump;
  }

}

//OBJECT PIPES
const pipes = {
  top: {
    sX: 553,
    sY: 0
  },
  bottom: {
    sX: 502,
    sY: 0
  },
  w: 53,
  h: 400,
  gap: 150,
  dx: 2,
  x: cvs.width,
  y: -200 * (Math.random() + 1),

  draw: function() {
    let topYPos = this.y;
    let bottomYPos = this.y + this.h + this.gap;

    ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, this.x, topYPos, this.w, this.h);
    ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, this.x, bottomYPos, this.w, this.h);
  },
  update: function() {
    if (state.current == state.start) {
      this.x = cvs.width;
      frames = 0;
    }
    if (state.current != state.game) return;
    if (frames % 200 == 0 || this.x + this.w == 0) {
      this.y = -200 * (Math.random() + 1);
      this.x = cvs.width;
    }
    this.x = this.x - this.dx;

    //COLLIDE DETECTION
    if (bird.x + 12 > this.x && bird.y - 12 < this.y + this.h && bird.x - 12 < this.x + this.w) state.current = state.over;
    if (bird.x + 12 > this.x && bird.y + 12 > this.y + this.h + this.gap && bird.x - 12 < this.x + this.w) state.current = state.over;
  }
}

//OBJECT GET READY MESSAGE
const readyMessage = {
  sX: 0,
  sY: 228,
  w: 173,
  h: 152,
  x: cvs.width / 2 - 173 / 2,
  y: 80,
  draw: function() {
    if (state.current == state.start) {
      ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
    }
  }
}

//OBJECT GAME OVER MESSAGE
const gameOverMessage = {
  sX: 175,
  sY: 228,
  w: 225,
  h: 202,
  x: cvs.width / 2 - 225 / 2,
  y: 90,
  draw: function() {
    if (state.current == state.over) {
      ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
    }
  }
}

//FUNCTION DRAW
function draw() {
  ctx.fillStyle = "#70c5ce";
  ctx.fillRect(0, 0, cvs.width, cvs.height);
  bg.draw();
  pipes.draw();
  fg.draw();
  bird.draw();
  readyMessage.draw();
  gameOverMessage.draw();
}

//FUNCTION UPDATE
function update() {
  bird.update();
  fg.update();
  pipes.update();
}

//FUNCTION LOOP
function loop() {
  update();
  draw();
  frames++;
  requestAnimationFrame(loop);
}


loop();
