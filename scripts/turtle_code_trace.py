from unittest.mock import Mock
import turtle
from turtle import *
turtle.Screen = Mock()
turtle.Turtle = Mock()
screen = turtle.Screen()
turtle.speed("fastest")

fd(100)
left(90)