'use client'

import Color from 'color';

class Turtle {
    constructor(canvas) {
        this._dir = 0;
        this._x = 0;
        this._y = 0;
        this._draw = true;
        this._color = new Color('#000');
        this._lineWidth = 1;
        this._height = canvas.height;
        this._width = canvas.width;
        this._origin = {
            x: 0,
            y: 0,
        };
        this.paths = [
            {
                path: new Path2D(),
                color: this._color,
                lineWidth: this._lineWidth,
            },
        ];
        this.states = [];
        this._ctx = canvas.getContext('2d');
        this._origin = {
            x: 0,
            y: 0,
        };
        this._ctx.translate(0.5 * this._width, 0.5 * this._height);
        this.currentPath.moveTo(0, 0);
    }

    setCurrentPath() {
        this.paths.push({
            path: new Path2D(),
            color: this._color,
            lineWidth: this._lineWidth,
        });
    }

    set size(size) {
        this._ctx.translate(
            (this._origin.x - 0.5) * this._width,
            (this._origin.y - 0.5) * this._height
        );

        this._width = size.width;
        this._height = size.height;

        this._ctx.translate(
            (this._origin.x + 0.5) * this._width,
            (this._origin.y + 0.5) * this._height
        );
    }

    set origin(point) {
        this._ctx.translate(
            (this._origin.x - 0.5) * this._width,
            (this._origin.y - 0.5) * this._height
        );

        this._origin = point;

        this._ctx.translate(
            (this._origin.x + 0.5) * this._width,
            (this._origin.y + 0.5) * this._height
        );
    }

    get origin() {
        return this._origin;
    }

    get current() {
        return this.paths[this.paths.length - 1];
    }

    get currentPath() {
        return this.current.path;
    }

    penup() {
        this._draw = false;
        return this;
    }

    pendown() {
        if (!this._draw) {
            this._draw = true;
            this.setCurrentPath();
        }
        return this;
    }

    moveTo(x, y) {
        this._x = x;
        this._y = y;

        if (!this._draw) {
            this.currentPath.moveTo(this._x, this._y);
        } else {
            this.currentPath.lineTo(this._x, this._y);
        }

        return this;
    }

    jump(x, y) {
        const drawing = this._draw;
        this.penup();
        this._x = x;
        this._y = y;
        if (drawing) {
            this.pendown();
        }
    }

    forward(dist) {
        const x = this._x + dist * Math.cos(this._dir);
        const y = this._y + dist * Math.sin(this._dir);
        return this.moveTo(x, y);
    }

    back(dist) {
        const x = this._x + dist * Math.cos(this._dir - Math.PI);
        const y = dist * Math.sin(this._dir - Math.PI);
        return this.moveTo(x, y);
    }

    left(angle = 90) {
        this._dir -= angle * (Math.PI / 180);
        return this;
    }

    right(angle = 90) {
        this._dir += angle * (Math.PI / 180);
        return this;
    }

    save() {
        this.states.push({
            x: this._x,
            y: this._y,
            dir: this._dir,
            color: this._color.hex(),
            lineWidth: this._lineWidth,
        });
        return this;
    }

    restore() {
        const state = this.states.pop();
        if (state !== undefined) {
            this.setcolor(state.color);
            this.setx(state.x);
            this.sety(state.x);
            this.setheading(state.dir);
            this.setlinewidth(state.lineWidth);
        }
        return this;
    }

    fill() {
        this._ctx.fill(this.currentPath);
        return this;
    }

    stroke() {
        this.clear();
        for (let path of this.paths) {
            this._ctx.strokeStyle = path.color.hex();
            this._ctx.lineWidth = path.lineWidth;
            this._ctx.stroke(path.path);
        }
        return this;
    }

    setcolor(color) {
        this._color = new Color(color);
        this.current.color = new Color(color);
        return this;
    }

    setlinewidth(width) {
        this._lineWidth = width;
        this.current.lineWidth = width;
        return this;
    }

    setx(x) {
        this._x = x;
        return this;
    }

    sety(y) {
        this._y = y;
        return this;
    }

    get heading() {
        return this._dir;
    }

    set heading(angle) {
        this._dir = angle;
    }

    get color() {
        return this._color;
    }

    transformColor(callback) {
        this.setcolor(callback(this._color).hex());
        return this;
    }

    setheading(angle) {
        this._dir = angle;
        return this;
    }

    clearPaths() {
        this.paths = [this.paths[this.paths.length - 1]];
        return this;
    }

    clear(x = 0, y = 0, width = this._width, height = this._height) {
        this._ctx.translate(
            -(this._origin.x + 0.5) * this._width,
            -(this._origin.y + 0.5) * this._height
        );

        this._ctx.clearRect(x, y, width, height);

        this._ctx.translate(
            (this._origin.x + 0.5) * this._width,
            (this._origin.y + 0.5) * this._height
        );

        return this;
    }

    home() {
        this._x = this._width / 2;
        this._y = this._height / 2;
        this._dir = 0;
        return this;
    }

    toradians(angle) {
        return angle * ((Math.PI * 2) / 360);
    }

    circle(radius, extent = 360, steps) {
        if (!extent) {
            extent = 360;
        }
        extent = this.toradians(extent);
        if (!steps) {
            steps = Math.round(Math.abs(radius * extent * 8)) | 0;
            steps = Math.max(steps, 4);
        }
        const cx = this._x + radius * Math.cos(this._dir + Math.PI / 2);
        const cy = this._y + radius * Math.sin(this._dir + Math.PI / 2);
        const a1 = Math.atan2(this._y - cy, this._x - cx);
        const a2 = radius >= 0 ? a1 + extent : a1 - extent;
        for (let i = 0; i < steps; i++) {
            const p = i / (steps - 1);
            const a = a1 + (a2 - a1) * p;
            const x = cx + Math.abs(radius) * Math.cos(a);
            const y = cy + Math.abs(radius) * Math.sin(a);
            this.goto(x, y);
        }
        if (radius >= 0) {
            this._dir += extent;
        } else {
            this._dir -= extent;
        }
        return this;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    set dir(dir) {
        this._dir = dir;
    }

    get dir() {
        return this._dir;
    }

    set lineWidth(lineWidth) {
        this._lineWidth = lineWidth;
    }

    get lineWidth() {
        return this._lineWidth;
    }

    set draw(draw) {
        this._draw = draw;
    }

    get draw() {
        return this._draw;
    }

    set x(x) {
        this._x = x;
    }

    get x() {
        return this._x;
    }

    set y(y) {
        this._y = y;
    }

    get y() {
        return this._y;
    }

    goto(x, y) {
        return this.moveTo(x, y);
    }
    moveto(x, y) {
        return this.moveTo(x, y);
    }
    setpos(x, y) {
        return this.moveTo(x, y);
    }
    setPosition(x, y) {
        return this.moveTo(x, y);
    }
    f(dist) {
        return this.forward(dist);
    }
    fd(dist) {
        return this.forward(dist);
    }
    b(dist) {
        return this.back(dist);
    }
    bk(dist) {
        return this.back(dist);
    }
    backward(dist) {
        return this.back(dist);
    }
    lt(angle) {
        return this.left(angle);
    }
    rt(angle) {
        return this.right(angle);
    }
    pd() {
        return this.pendown();
    }
    down() {
        return this.pendown();
    }
    pu() {
        return this.penup();
    }
    up() {
        return this.penup();
    }
    jmp(x, y) {
        return this.jump(x, y);
    }
    seth(angle) {
        return this.setheading(angle);
    }
}

export default Turtle;
