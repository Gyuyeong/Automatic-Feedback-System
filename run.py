from turtle import *

turtle = Turtle()

for i in range(200):
    turtle.clear()
    turtle.pendown()
    turtle.color(lambda c: c.rotate(2))
    turtle.setlinewidth(2 + (i % 2))
    turtle.circle(i, 90, 0)
    turtle.penup()