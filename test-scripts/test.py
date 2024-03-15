from turtle import *
import tkinter as tk
from PIL import ImageGrab

tk.ROUND=tk.BUTT

# width = 500
# height = 500

# screen = Screen()

def draw():
    # screen.setup(width=width, height=height, startx=0, starty=0)
    S = 8
    h = 18 * S
    color("navy")
    width(h)
    fd(25 * S)
    color("white")
    width(4 * S)
    home()
    pu()
    goto(9 * S, -9 * S)
    lt(90)
    pd()
    fd(h)
    color("#d72828")
    width(S + S)
    bk(h)
    pu()
    home()
    pd()
    fd(25 * S)
    ht()

    ontimer(stop, 500)  # stop the recording (1/2 second trailer)

running = True
FRAMES_PER_SECOND = 60

def stop():
    global running

    running = False

def save(counter=[1]):
    # img = ImageGrab.grab(bbox=(0, 0, width, height))
    # img.save("iceland{0:03d}.png".format(counter[0]))
    getcanvas().postscript(file = "iceland{0:03d}.eps".format(counter[0]))
    counter[0] += 1
    if running:
        ontimer(save, int(1000 / FRAMES_PER_SECOND))

save()  # start the recording

ontimer(draw, 500)  # start the program (1/2 second leader)

done()