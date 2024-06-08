interface MenuItemInterface {
  link: string;
  display: string;
}

const MENU = {};
const g = 9.80665;

class Canon {
  angle = 20;
  maxAngle = 89;
  minAngle = 1;
  canvas = document.createElement("canvas");
  ctx = this.canvas.getContext("2d")!;
  width = 50;
  height = 30;
  inProgress = false;
  direction = 0; // 1 = up , 0 = down;
  prevTime = 0;
  constructor(ratio: number) {
    this.canvas.width = this.width * ratio;
    this.canvas.height = this.height * ratio;
    this.ctx.scale(ratio, ratio);
    this.render();
  }

  startUp = () => {
    this.inProgress = true;
    this.direction = 1;
  };

  startDown = () => {
    this.inProgress = true;
    this.direction = 0;
  };

  endUp = () => {
    if (this.direction === 1) {
      this.inProgress = false;
    }
  };

  endDown = () => {
    if (this.direction === 0) {
      this.inProgress = false;
    }
  };

  private up = (timeDelta: number) => {
    this.angle += timeDelta / 10;
    if (this.angle > this.maxAngle) this.angle = this.maxAngle;
  };

  private down = (timeDelta: number) => {
    this.angle -= timeDelta / 10;
    if (this.angle < this.minAngle) this.angle = this.minAngle;
  };

  process = (time: number) => {
    if (!this.prevTime) {
      this.prevTime = time;
      return;
    }

    const timeDelta = time - this.prevTime;
    if (this.inProgress) {
      if (this.direction) {
        this.up(timeDelta);
      } else {
        this.down(timeDelta);
      }
    }
    this.prevTime = time;
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

class Projectile {
  r = 10;
  width: number;
  height: number;
  color = "#eeeeee";
  canvas = document.createElement("canvas");
  ctx = this.canvas.getContext("2d")!;
  xSpeed: number;
  ySpeed: number;
  g = g / 1000;
  constructor(
    ratio: number,
    public x: number,
    public y: number,
    public v: number,
    public theta: number
  ) {
    this.width = this.r * 2;
    this.height = this.r * 2;
    this.canvas.width = this.width * ratio;
    this.canvas.height = this.height * ratio;
    this.ctx.scale(ratio, ratio);
    this.xSpeed = this.v * Math.cos((Math.PI / 180) * theta);
    this.ySpeed = this.v * Math.sin((Math.PI / 180) * theta);
    this.render();
  }

  render = () => {
    const { ctx, r } = this;
    ctx.beginPath();
    ctx.arc(r, r, r, 0, 2 * Math.PI);
    ctx.fill();
  };

  prevTime = 0;
  process = (time: number) => {
    const { prevTime, xSpeed, ySpeed } = this;
    if (!prevTime) {
      this.prevTime = time;
      return;
    }

    const timeDelta = time - this.prevTime;
    this.x -= xSpeed * timeDelta;
    this.y -= (ySpeed - 0.5 * this.g) * timeDelta;
    this.ySpeed -= this.g;

    this.prevTime = time;
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
  ball?: Projectile;
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
      if (e.key === "w") {
        this.canon.startUp();
      }
      if (e.key === "s") {
        this.canon.startDown();
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.key === " ") {
        const canonX =
          this.width -
          this.powerGauge.width -
          this.canon.width -
          10 -
          this.canon.width / 2;
        const canonY =
          this.height - this.canon.height * 1.5 - this.canon.height / 2;
        this.ball = new Projectile(
          this.ratio,
          canonX,
          canonY,
          this.powerGauge.power,
          this.canon.angle
        );
        this.powerGauge.end();
      }
      if (e.key === "w") {
        this.canon.endUp();
      }
      if (e.key === "s") {
        this.canon.endDown();
      }
    });
  }

  render = (time: number) => {
    const { ctx, powerGauge, canon, width, height } = this;
    ctx.clearRect(0, 0, this.width, this.height);
    powerGauge.process(time);
    canon.process(time);
    if (this.ball) {
      this.ball.process(time);
      ctx.drawImage(
        this.ball.canvas,
        this.ball.x - this.ball.r,
        this.ball.y - this.ball.r,
        this.ball.width,
        this.ball.height
      );
    }
    ctx.drawImage(
      powerGauge.canvas,
      width - powerGauge.width,
      (height - powerGauge.height) / 2
    );
    ctx.save();
    const canonX =
      width - powerGauge.width - canon.width - 10 - canon.width / 2;
    const canonY = height - canon.height * 1.5 - canon.height / 2;
    ctx.translate(canonX, canonY);
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
