'use client'

import React, { useRef, useEffect } from 'react';
import JTurtle from './turtle-core';

const defaultDraw = (turtle) => {
    turtle.setcolor('#99df66');
    // return (i) => {
    //     turtle
    //         .clear()
    //         .pendown()
    //         .transformColor((c) => c.rotate(2))
    //         .setlinewidth(2 + (i % 2))
    //         .circle(i, 90, 0)
    //         .penup()
    //         .stroke();
    //     return i < 200;
    // };

    for (let i = 0; i < 200; i++) {
        turtle
            .clear()
            .pendown()
            .transformColor((c) => c.rotate(2))
            .setlinewidth(2 + (i % 2))
            .circle(i, 90, 0)
            .penup()
            .stroke();
    }
};

const Turtle = ({
    width = 400,
    height = 300,
    draw = defaultDraw,
    animated = true,
    pixelated = true,
    autostroke = true,
    style = {},
    ...rest
}) => {
    const rCanvas = useRef(null);
    const rTurtle = useRef(null);

    useEffect(() => {
        if (rTurtle.current) {
            const canvas = rCanvas.current;

            if (canvas) {
                rTurtle.current.size = {
                    width: canvas.width,
                    height: canvas.height,
                };
            }
        }
    }, [height, width]);

    useEffect(() => {
        const canvas = rCanvas.current;

        let stop = false;
        if (canvas) {
            canvas.height = canvas.offsetHeight;
            canvas.width = canvas.offsetWidth;

            const turtle = (rTurtle.current = new JTurtle(canvas));
            const walk = draw(turtle, turtle.height, turtle.width);

            if (walk) {
                const walkLoop = (i) => {
                    if (i > 100000) {
                        console.log('Bailed');
                        return;
                    }

                    const stillWalking = walk(i);

                    if (stillWalking && !stop) {
                        if (animated) {
                            requestAnimationFrame(() => {
                                walkLoop(i + 1);
                            });
                        } else {
                            walkLoop(i + 1);
                        }
                    } else {
                        console.log('done');
                    }
                };

                walkLoop(0);
            } else {
            }
        }

        return () => {
            stop = true;
        };
    }, [height, width, draw, animated]);

    return (
        <div
            {...rest}
            style={{
                imageRendering: pixelated ? 'pixelated' : 'auto',
                ...style,
                position: 'relative',
                height,
                width,
            }}
        >
            <canvas
                ref={rCanvas}
                height={height}
                width={width}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height,
                    width,
                }}
            />
        </div>
    );
};

export default Turtle;
