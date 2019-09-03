export const Bezier = `
  const Bezier = function (startPoint, control1, control2, endPoint) {
    this.startPoint = startPoint;
    this.control1 = control1;
    this.control2 = control2;
    this.endPoint = endPoint;
  };

  Bezier.prototype.length = function () {
    const steps = 10;
    let length = 0;
    let i, t, cx, cy, px, py, xdiff, ydiff;

    for (i = 0; i <= steps; i++) {
      t = i / steps;
      cx = this._point(t, this.startPoint.x, this.control1.x, this.control2.x, this.endPoint.x);
      cy = this._point(t, this.startPoint.y, this.control1.y, this.control2.y, this.endPoint.y);
      if (i > 0) {
        xdiff = cx - px;
        ydiff = cy - py;
        length += Math.sqrt(xdiff * xdiff + ydiff * ydiff);
      }
      px = cx;
      py = cy;
    }
    return length;
  };

  Bezier.prototype._point = function(t, start, c1, c2, end) {
    return start * Math.pow((1.0 - t), 3)
      + 3.0 * c1 * Math.pow((1.0 - t), 2) * t
      + 3.0 * c2 * Math.pow(t, 2) * (1.0 - t)
      + end * Math.pow(t, 3);
  };
`