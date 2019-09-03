import { Bezier } from './Bezier';
import { Point } from './Point';

export const signaturePad = `
  ${Bezier}
  ${Point}
  const SignaturePad = function(canvas, options) {
    options = options || {};
    this.velocityFilterWeight = options.velocityFilterWeight || 0.7;
    this.minDotWidth = options.minDotWidth || 0.5;
    this.maxDotWidth = options.maxDotWidth || 2.5;
    this.dotSize = (this.minDotWidth + this.maxDotWidth) / 2;
    this.penColor = options.penColor || "black";
    this.backgroundColor = options.backgroundColor || "transparent";
    this.onEnd = options.onEnd || function() {};
    this.onBegin = options.onBegin || function() {};  
    this.onSubmit = options.onSubmit || function() {};
    this.pointWasOutOfCanvas = false;

    canvas.width = options.width || 300;
    canvas.height = options.height || 100;
  
    this._canvas = canvas;
    this._ctx = canvas.getContext("2d");
    this._padding = 10 * this.dotSize;
    this._isEmpty = true;
    this._minX = Infinity;
    this._minY = Infinity;
    this._maxX = -Infinity;
    this._maxY = -Infinity;

    this._handleMouseEvents();
    this._handleTouchEvents();
    this.clear();
  };

  SignaturePad.prototype.clear = function() {
    this._ctx.fillStyle = this.backgroundColor;
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    this._reset();
    this._minX = Infinity;
    this._minY = Infinity;
    this._maxX = -Infinity;
    this._maxY = -Infinity;
  };

  SignaturePad.prototype.submit = function(width, height) {
    this.onSubmit(
      this._isEmpty
        ? null
        : this.getDataUrl(width, height)
    );
  };

  SignaturePad.prototype.getDataUrl = function(width, height) {
    const imgWidth = this._maxX - this._minX;
    const imgHeight = this._maxY - this._minY;
    const bufferCanvas = document.createElement('canvas');
    const bufferCtx = bufferCanvas.getContext('2d');
    bufferCanvas.width = width || imgWidth;
    bufferCanvas.height = height || imgHeight;
    const fitSize = this._fitImageSize(imgWidth, imgHeight, bufferCanvas.width, bufferCanvas.height);
    const newImgWidth = fitSize.newImgWidth;
    const newImgHeight = fitSize.newImgHeight;
    const imgPosX = fitSize.imgPosX;
    const imgPosY = fitSize.imgPosY;
    bufferCtx.fillStyle = this.backgroundColor;
    bufferCtx.fillRect(0, 0,  bufferCanvas.width, bufferCanvas.height);
    bufferCtx.drawImage(this._canvas, this._minX, this._minY, imgWidth, imgHeight, imgPosX, imgPosY, newImgWidth, newImgHeight);
    return bufferCanvas.toDataURL();
  };

  SignaturePad.prototype.fromDataURL = function(dataUrl, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    const self = this;
    const image = new Image();
    this._reset();
    image.src = dataUrl;
    image.onload = function() {
      self._ctx.drawImage(image, sx || 0, sy || 0, sWidth || self._canvas.width, sHeight || self._canvas.height, dx, dy, dWidth, dHeight);
      self._isEmpty = false;
    };
  };

  SignaturePad.prototype.resizeCanvas = function(width, height) {
    if (this._canvas.width === width && this._canvas.height === height) return;
    if (this._isEmpty) {
      this._canvas.width = width;
      this._canvas.height = height;
      this.clear();
    } else {
      const imgWidth = this._maxX - this._minX;
      const imgHeight = this._maxY - this._minY;
      const fitSize = this._fitImageSize(imgWidth, imgHeight, width, height);
      const newImgWidth = fitSize.newImgWidth;
      const newImgHeight = fitSize.newImgHeight;
      const imgPosX = fitSize.imgPosX;
      const imgPosY = fitSize.imgPosY;
      const dataUrl = this.getDataUrl();
      this._canvas.width = width;
      this._canvas.height = height;
      this.clear();
      this.fromDataURL(dataUrl, 0, 0, imgWidth, imgHeight, imgPosX, imgPosY, newImgWidth, newImgHeight);
      this._minX = imgPosX;
      this._minY = imgPosY;
      this._maxX = imgPosX + newImgWidth;
      this._maxY = imgPosY + newImgHeight;
    }
  };

  SignaturePad.prototype._fitImageSize = function(imgWidth, imgHeight, areaWidth, areaHeight) {
    let newImgWidth = imgWidth > areaWidth ? areaWidth : imgWidth;
    let newImgHeight = newImgWidth * imgHeight / imgWidth;
    newImgHeight = newImgHeight > areaHeight ? areaHeight : newImgHeight;
    newImgWidth = newImgHeight * imgWidth / imgHeight;

    const imgPosX = areaWidth > newImgWidth ? (areaWidth - newImgWidth) / 2 : 0;
    const imgPosY = areaHeight > newImgHeight ? (areaHeight - newImgHeight) / 2 : 0;

    return {
      newImgWidth: newImgWidth,
      newImgHeight: newImgHeight,
      imgPosX: imgPosX,
      imgPosY: imgPosY
    };
  };

  SignaturePad.prototype._strokeUpdate = function(event) {
    const point = this._createPoint(event);
    this._addPoint(point);
  };

  SignaturePad.prototype._strokeBegin = function(event) {
    this._reset();
    this._strokeUpdate(event);
    this.onBegin(event);
  };

  SignaturePad.prototype._strokeDraw = function(point) {
    this._ctx.beginPath();
    this._drawPoint(point.x, point.y, this.dotSize);
    this._ctx.closePath();
    this._ctx.fill();
  };

  SignaturePad.prototype._strokeEnd = function(event) {
    const canDrawCurve = this.points.length > 2;
    const point = this.points[0];

    if (!canDrawCurve && point) {
      this._strokeDraw(point);
    }

    this.onEnd(event);
  };

  SignaturePad.prototype._handleMouseEvents = function() {
    let self = this;
    this._mouseButtonDown = false;

    this._canvas.addEventListener("mousedown", function(event) {
      if (event.which === 1) {
        self._mouseButtonDown = true;
        self._strokeBegin(event);
      }
    });

    this._canvas.addEventListener("mousemove", function(event) {
      if (self._mouseButtonDown) {
        self._strokeUpdate(event);
      }
    });

    document.addEventListener("mouseup", function(event) {
      if (event.which === 1 && self._mouseButtonDown) {
        self._mouseButtonDown = false;
        self._strokeEnd(event);
      }
    });
  };

  SignaturePad.prototype._handleTouchEvents = function() {
    const self = this;

    this._canvas.style.msTouchAction = 'none';

    this._canvas.addEventListener("touchstart", function(event) {
      let touch = event.changedTouches[0];
      self._strokeBegin(touch);
    });

    this._canvas.addEventListener("touchmove", function(event) {
      event.preventDefault();

      let touch = event.changedTouches[0];
      let rect = self._canvas.getBoundingClientRect();
      let x = touch.clientX - rect.left;
      let y = touch.clientY - rect.top;

      let pointOutOfCanvas = (x < 0 || y < 0 || x > rect.width || y > rect.height);
      if (pointOutOfCanvas) {
        if (!self.pointWasOutOfCanvas) {
          self.onEnd();
        }
        self.pointWasOutOfCanvas = true;
      } else {
        self.pointWasOutOfCanvas = false;
        self._strokeUpdate(touch);
      }
    });

    document.addEventListener("touchend", function(event) {
      let wasCanvasTouched = event.target === self._canvas;
      if (wasCanvasTouched) {
        self._strokeEnd(event);
      }
    });
  };

  SignaturePad.prototype._reset = function() {
    this.points = [];
    this._lastVelocity = 0;
    this._lastWidth = this.dotSize;
    this._isEmpty = true;
    this._ctx.fillStyle = this.penColor;
  };

  SignaturePad.prototype._createPoint = function(event) {
    const rect = this._canvas.getBoundingClientRect();
    const point = new Point(event.clientX - rect.left, event.clientY - rect.top);
    if(this.translateMouseCoordinates) this.translateMouseCoordinates(point);
    return point;
  };

  SignaturePad.prototype._addPoint = function(point) {
    const points = this.points;
    let c2, c3, tmp;

    points.push(point);

    if (points.length > 2) {
      if (points.length === 3) points.unshift(points[0]);

      tmp = this._calculateCurveControlPoints(points[0], points[1], points[2]);
      c2 = tmp.c2;
      tmp = this._calculateCurveControlPoints(points[1], points[2], points[3]);
      c3 = tmp.c1;
      const curve = new Bezier(points[1], c2, c3, points[2]);
      this._addCurve(curve);

      points.shift();
    }
  };

  SignaturePad.prototype._calculateCurveControlPoints = function(s1, s2, s3) {
    const dx1 = s1.x - s2.x;
    const dy1 = s1.y - s2.y;
    const dx2 = s2.x - s3.x;
    const dy2 = s2.y - s3.y;
    const l1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const l2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    const k = l2 / (l1 + l2);

    const m1 = {
      x: (s1.x + s2.x) / 2,
      y: (s1.y + s2.y) / 2
    };

    const m2 = {
      x: (s2.x + s3.x) / 2,
      y: (s2.y + s3.y) / 2
    };

    const cm = {
      x: m2.x + (m1.x - m2.x) * k,
      y: m2.y + (m1.y - m2.y) * k
    };

    const tx = s2.x - cm.x;
    const ty = s2.y - cm.y;

    return {
      c1: new Point(m1.x + tx, m1.y + ty),
      c2: new Point(m2.x + tx, m2.y + ty)
    };
  };
  
  SignaturePad.prototype._updateDrawAreaSize = function(x, y, size) {
    const realMinX = x - size - this._padding;
    const realMinY = y - size - this._padding;
    const realMaxX = x + size + this._padding;
    const realMaxY = y + size + this._padding;

    if (this._minX > realMinX) this._minX = realMinX;
    if (this._minY > realMinY) this._minY = realMinY;
    if (this._maxX < realMaxX) this._maxX = realMaxX;
    if (this._maxY < realMaxY) this._maxY = realMaxY;

    if (realMinX < 0) this._minX = 0;
    if (realMinY < 0) this._minY = 0;
    if (realMaxX > this._canvas.width) this._maxX = this._canvas.width;
    if (realMaxY > this._canvas.height) this._maxY = this._canvas.height;
  };

  SignaturePad.prototype._addCurve = function(curve) {
    let velocity = curve.endPoint.velocityFrom(curve.startPoint);
    velocity = this.velocityFilterWeight * velocity + (1 - this.velocityFilterWeight) * this._lastVelocity;
    const newWidth = this._strokeWidth(velocity);
    this._drawCurve(curve, this._lastWidth, newWidth);
    this._lastVelocity = velocity;
    this._lastWidth = newWidth;
  };

  SignaturePad.prototype._drawPoint = function(x, y, size) {
    this._updateDrawAreaSize(x, y, size);
    this._ctx.moveTo(x, y);
    this._ctx.arc(x, y, size, 0, 2 * Math.PI, false);
    this._isEmpty = false;
  };

  SignaturePad.prototype._drawCurve = function(curve, startWidth, endWidth) {
    let drawSteps, width, i, t, tt, ttt, u, uu, uuu, x, y;

    drawSteps = Math.floor(curve.length());
    this._ctx.beginPath();
    for (i = 0; i < drawSteps; i++) {
      t = i / drawSteps;
      tt = t * t;
      ttt = tt * t;
      u = 1 - t;
      uu = u * u;
      uuu = uu * u;

      x = uuu * curve.startPoint.x;
      x += 3 * uu * t * curve.control1.x;
      x += 3 * u * tt * curve.control2.x;
      x += ttt * curve.endPoint.x;

      y = uuu * curve.startPoint.y;
      y += 3 * uu * t * curve.control1.y;
      y += 3 * u * tt * curve.control2.y;
      y += ttt * curve.endPoint.y;

      width = startWidth + ttt * (endWidth - startWidth);
      this._drawPoint(x, y, width);
    }
    this._ctx.closePath();
    this._ctx.fill();
  };

  SignaturePad.prototype._strokeWidth = function(velocity) {
    return Math.max(this.maxDotWidth / (velocity + 1), this.minDotWidth);
  };
`;
