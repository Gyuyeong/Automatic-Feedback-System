from unittest.mock import Mock
import turtle
from turtle import *
turtle.Screen = Mock()
turtle.Turtle = Mock()
screen = turtle.Screen()
turtle.speed("fastest")

for i in range(500):
    fd(100)
    left(91)