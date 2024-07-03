from unittest.mock import Mock
import turtle
from turtle import *
turtle.Screen = Mock()
turtle.Turtle = Mock()
screen = turtle.Screen()

def run():
    fd(100)
    left(90)

for i in range(4):
    run()