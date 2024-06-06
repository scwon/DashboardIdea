interface MenuItemInterface {
  link: string;
  display: string;
}

const MENU = {};

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

    window.addEventListener("keyup", (e) => {
      if (e.key === " ") {
        this.powerGauge.end();
      }
    });
  }

  render = (time: number) => {
    const { ctx, powerGauge, width, height } = this;
    ctx.clearRect(0, 0, this.width, this.height);
    powerGauge.process(time);
    ctx.drawImage(
      powerGauge.canvas,
      width - powerGauge.width,
      (height - powerGauge.height) / 2
    );
    window.requestAnimationFrame(this.render);
  };
}

new Navigation();
