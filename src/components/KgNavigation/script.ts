interface MenuItemInterface {
  link: string;
  display: string;
}

const MENU = {};

class Canon {
  angle = 0;
  maxAngle = 90;
  minAngle = 0;
  canvas = document.createElement("canvas");
  ctx = this.canvas.getContext("2d")!;
  width = 50;
  height = 30;
  constructor(ratio: number) {
    this.canvas.width = this.width * ratio;
    this.canvas.height = this.height * ratio;
    this.ctx.scale(ratio, ratio);
    this.render();
  }

  up = () => {
    this.angle += 3;
    if (this.angle > this.maxAngle) this.angle = this.maxAngle;
  };

  down = () => {
    this.angle -= 3;
    if (this.angle < this.minAngle) this.angle = this.minAngle;
  };

  render = () => {
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.rect(0, 0, 10, height);
    ctx.moveTo(10, 2);
    ctx.lineTo(25, 2);
    ctx.quadraticCurveTo(width, 15, 25, height - 2);
    ctx.lineTo(10, height - 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#222222";
    ctx.stroke();
  };
}

class PowerGauge {
  progress = false;
  direction = true; // true is up, false is down;
  power = 0; // 0 ~ 1
  prevTime = 0;
  standardSpeed = 1000;
  speed = 2;
  width = 30;
  height = 200;
  canvas = document.createElement("canvas");
  ctx = this.canvas.getContext("2d")!;

  constructor() {
    const { ctx, width, height } = this;
    this.canvas.width = width;
    this.canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.strokeRect(0.5, 0.5, this.width - 1, this.height - 1);
    this.render();
  }

  start = () => (this.progress = true);
  process = (time: number) => {
    if (this.progress) {
      if (!this.prevTime) {
        this.prevTime = time;
        return;
      }

      this.power +=
        ((time - this.prevTime) / (this.standardSpeed / this.speed)) *
        (this.direction ? 1 : -1);
      this.prevTime = time;

      if (this.power >= 1) {
        this.power = 1;
        this.direction = false;
      }

      if (this.power < 0) {
        this.power = 0;
        this.direction = true;
      }
      this.render();
    }
  };

  render = () => {
    const { width, height, ctx, power } = this;
    ctx.clearRect(0, 0, width, height);
    ctx.strokeRect(0.5, 0.5, this.width - 1, this.height - 1);
    if (this.power) {
      ctx.fillRect(0, height, width, -height * power);
    }
  };

  end = () => {
    this.progress = false;
    this.power = 0;
    this.prevTime = 0;
    this.direction = true;
    this.render();
  };
}

class Navigation {
  canvas = document.getElementById("menuSelector") as HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  ratio = window.devicePixelRatio || 1;
  width: number;
  height: number;
  powerGauge = new PowerGauge();
  canon = new Canon(this.ratio);
  constructor() {
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.round(rect.width * this.ratio) / this.ratio;
    this.height = Math.round(rect.height * this.ratio) / this.ratio;
    this.canvas.width = this.width * this.ratio;
    this.canvas.height = this.height * this.ratio;
    this.ctx = this.canvas.getContext("2d")!;
    this.ctx.scale(this.ratio, this.ratio);

    window.requestAnimationFrame(this.render);

    window.addEventListener("keydown", (e) => {
      if (e.key === " ") {
        this.powerGauge.start();
      }
    });

    window.addEventListener(
      "keypress",
      (e) => {
        if (e.key === "w") {
          this.canon.up();
        }

        if (e.key === "s") {
          this.canon.down();
        }
      },
      false
    );

    window.addEventListener("keyup", (e) => {
      if (e.key === " ") {
        this.powerGauge.end();
      }
    });
  }

  render = (time: number) => {
    const { ctx, powerGauge, canon, width, height } = this;
    ctx.clearRect(0, 0, this.width, this.height);
    powerGauge.process(time);
    ctx.drawImage(
      powerGauge.canvas,
      width - powerGauge.width,
      (height - powerGauge.height) / 2
    );
    ctx.save();
    const canonX = width - powerGauge.width - canon.width - 10;
    const canonY = height - canon.height * 1.5;
    ctx.translate(canonX - canon.width / 2, canonY - canon.height / 2);
    ctx.rotate(canon.angle * (Math.PI / 180));
    ctx.drawImage(
      canon.canvas,
      -canon.width / 2,
      -canon.height / 2,
      canon.width,
      canon.height
    );
    ctx.restore();
    window.requestAnimationFrame(this.render);
  };
}

new Navigation();
