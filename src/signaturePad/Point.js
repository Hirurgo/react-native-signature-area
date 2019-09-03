export const Point = `
  const Point = function (x, y, time) {
    this.x = x;
    this.y = y;
    this.time = time || new Date().getTime();
  };

  Point.prototype.velocityFrom = function (start) {
    if (this.time === start.time) return 1;
    return this.distanceTo(start) / (this.time - start.time);
  };

  Point.prototype.distanceTo = function (start) {
    const difX = this.x - start.x;
    const difY = this.y - start.y;
    return Math.sqrt(difX * difX + difY * difY);
  };
`;