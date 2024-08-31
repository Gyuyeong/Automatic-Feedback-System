import ast
import base64
import graphviz

code = """
from unittest.mock import Mock
import turtle
from turtle import *
turtle.Screen = Mock()
turtle.Turtle = Mock()
screen = turtle.Screen()
turtle.speed("fastest")

for i in range(500):
    fd(i)
    left(5)
    left(15)
"""

tree = ast.parse(code.strip())
visited_nodes = set()
visited_edges = set()

graph = graphviz.Digraph()
graph.attr('node')

stack = [(None, tree)]

exclude_names = ['Import', 'ImportFrom', 'Load', 'Store']

while stack:
    parent_id, current_node = stack.pop()
    try:
        lineno = current_node.lineno
        print(lineno, current_node.__class__.__name__)
    except:
        pass
    current_id = id(current_node)
    graph.node(str(current_id), label=str(current_node.__class__.__name__))
    if parent_id is not None:
        graph.edge(str(parent_id), str(current_id), style='bold', color='black')
    add_current_id = str(current_id) + '_1'
    if isinstance(current_node, ast.Name):
        graph.node(str(current_id), label=f"{current_node.__class__.__name__}:\n{current_node.id}", color='red', style='filled')
    elif isinstance(current_node, ast.arg):
        graph.node(str(current_id), label=f"{current_node.arg}", color='brown', style='filled')
    elif isinstance(current_node, ast.Constant):
        graph.node(str(current_id), label=f"{current_node.__class__.__name__}:\n{current_node.value}", color='blue', style='filled')
    elif isinstance(current_node, ast.Call):
        try: 
            label = current_node.func.id
        except:
            label = current_node.func.attr
        graph.node(str(current_id), label=f"{current_node.__class__.__name__}:\n{label}", color='orange', style='filled')
    elif isinstance(current_node, ast.FunctionDef):
        graph.node(str(current_id), label=f"{current_node.__class__.__name__}:\n{current_node.name}", color='green', style='filled')
    elif isinstance(current_node, ast.ClassDef):
        graph.node(add_current_id, label=current_node.name)
        graph.edge(str(current_id), add_current_id)
    elif isinstance(current_node, (ast.BinOp, ast.AugAssign, ast.UnaryOp)):
        graph.node(str(current_id), label=f"{current_node.__class__.__name__}\n{current_node.op.__class__.__name__}", color='lightgreen', style='filled')
    elif isinstance(current_node, ast.Compare):
        graph.node(str(current_id), label=f"{current_node.__class__.__name__}\n{current_node.ops.__class__.__name__}", color='lightgreen', style='filled')
    # elif isinstance(current_node, ast.Tuple):
    #     elts = [elt for elt in current_node.elts]
    #     graph.node(str(current_id), labee=f"{current_node.__class__.__name__}\n{elts}")
    
    # add child nodes to stack
    for child_node in ast.iter_child_nodes(current_node):
        if child_node.__class__.__name__ in exclude_names:
            continue
        elif child_node.__class__.__name__ == "Expr":
            for grandchild_node in ast.iter_child_nodes(child_node):
                if isinstance(grandchild_node, ast.Call):  # ignore speed
                    try:
                        label = grandchild_node.func.id
                    except:
                        label = grandchild_node.func.attr
                    if label == "speed":
                        continue
                stack.append((current_id, grandchild_node))
        elif child_node.__class__.__name__ == "Name":
            if isinstance(current_node, ast.Call):
                try:
                    label = current_node.func.id
                    if label != child_node.id:
                        stack.append((current_id, child_node))
                except:
                    stack.append((current_id, child_node))
            else:
                stack.append((current_id, child_node))
        elif isinstance(child_node, ast.Assign):  # ignore Mock
            for grand_child_node in ast.iter_child_nodes(child_node):
                if isinstance(grand_child_node, ast.Call):
                    try: 
                        label = grand_child_node.func.id
                    except:
                        label = grand_child_node.func.attr
                    if label == "Mock":
                        continue
        elif isinstance(current_node, ast.UnaryOp):
            if not isinstance(child_node, (ast.UAdd, ast.USub, ast.Not, ast.Invert)):
                stack.append((current_id, child_node))
        elif isinstance(current_node, (ast.BinOp, ast.AugAssign)):
            if not isinstance(child_node, (ast.Add, ast.Sub, ast.Mult, ast.Div, ast.FloorDiv, ast.Mod, ast.Pow, ast.LShift, ast.RShift, ast.BitOr, ast.BitAnd, ast.BitXor, ast.MatMult)):
                stack.append((current_id, child_node))
        elif isinstance(current_node, (ast.Compare)):
            if not isinstance(child_node, (ast.Eq, ast.NotEq, ast.Lt, ast.LtE, ast.Gt, ast.GtE, ast.Is, ast.IsNot, ast.In, ast.NotIn)):
                stack.append((current_id, child_node))
        # elif isinstance(current_node, ast.Tuple):
        #     continue      
        else:
            stack.append((current_id, child_node))

graph.render(filename="./public/demo", format="png", cleanup=True)
with open("./public/demo" + '.png', 'rb') as imageFile:
    graph64 = base64.b64encode(imageFile.read()).decode()