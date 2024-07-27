from unittest.mock import Mock
import turtle
from turtle import *
turtle.Screen = Mock()
turtle.Turtle = Mock()
screen = turtle.Screen()

fd(100)
left(90)