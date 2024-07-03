import ast
import graphviz
import os
import base64
import sys


class GraphHint:
    def __init__(self, file_path:str, file_name:str):
        self.file_path = file_path
        self.file_name = file_name
        self.exclude_list = ['Import', 'ImportFrom', 'Load', 'Store']
    

    def __gen_graph(self):
        self.visited_nodes = set()
        self.visited_edges = set()
        graph = graphviz.Digraph()
        graph.attr('node')
        return graph

    def __get_graph(self, filepath):
        with open(filepath + '.svg', 'rb') as imageFile:
            graph64 = base64.b64encode(imageFile.read()).decode()
        return graph64
    

    def gen_asg(self, tree, ast_name, ast_path):
        graph = self.__gen_graph()
        # self.visualize(graph, self.tree)
        self.ast2graph(tree, graph)
        graph.render(filename=ast_path, format='svg', cleanup=True)
        return self.__get_graph(ast_path)

    def ast2graph(self, tree, graph):
        stack = [(None, tree)]  # A stack to keep track of nodes and their parent IDs

        while stack:
            parent_id, current_node = stack.pop()

            # Generate a unique ID for the current node based on its memory address
            current_id = id(current_node)

            # Add the current node to the graph
            graph.node(str(current_id), label=str(current_node.__class__.__name__))

            # Add an edge between the parent node and the current node
            if parent_id is not None:
                graph.edge(str(parent_id), str(current_id))
            
            # Add if node has Name
            add_current_id = str(current_id)+'_1'
            if isinstance(current_node, ast.Name):
                graph.node(str(current_id), label=f"{current_node.__class__.__name__}:\n{current_node.id}")
            elif isinstance(current_node, ast.arg):
                graph.node(str(current_id), label=f"{current_node.arg}")
            elif isinstance(current_node, ast.Constant):
                graph.node(str(current_id), label=f"{current_node.__class__.__name__}:\n{current_node.value}")
            elif isinstance(current_node, ast.Call):
                try: 
                    label = current_node.func.id
                except:
                    label = current_node.func.attr
                graph.node(str(current_id), label=f"{current_node.__class__.__name__}:\n{label}")
            elif isinstance(current_node, ast.FunctionDef):
                graph.node(str(current_id), label=f"{current_node.__class__.__name__}:\n{current_node.name}")
            elif isinstance(current_node, ast.ClassDef):
                graph.node(add_current_id, label=current_node.name)
                graph.edge(str(current_id), add_current_id)
            # elif isinstance(current_node, (ast.FunctionDef, ast.ClassDef)):
            #     graph.node(add_current_id, label=current_node.name)
            #     graph.edge(str(current_id), add_current_id)
            elif isinstance(current_node, (ast.UnaryOp, ast.BinOp, ast.AugAssign)):
                graph.node(str(current_id), label=f"{current_node.__class__.__name__}\n{current_node.op.__class__.__name__}")
            elif isinstance(current_node, (ast.Compare)):
                graph.node(str(current_id), label=f"{current_node.__class__.__name__}\n{current_node.ops.__class__.__name__}")

            # Add child nodes to the stack
            for child_node in ast.iter_child_nodes(current_node):
                if child_node.__class__.__name__ in self.exclude_list:
                    continue
                elif child_node.__class__.__name__ == "Expr":
                    for grandchild_node in ast.iter_child_nodes(child_node):
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
                elif isinstance(current_node, (ast.BinOp, ast.AugAssign)):
                    if not isinstance(child_node, (ast.Add, ast.Sub, ast.Mult, ast.Div, ast.FloorDiv, ast.Mod, ast.Pow, ast.LShift, ast.RShift, ast.BitOr, ast.BitAnd, ast.BitXor, ast.MatMult)):
                        stack.append((current_id, child_node))
                elif isinstance(current_node, (ast.Compare)):
                    if not isinstance(child_node, (ast.Eq, ast.NotEq, ast.Lt, ast.LtE, ast.Gt, ast.GtE, ast.Is, ast.IsNot, ast.In, ast.NotIn)):
                        stack.append((current_id, child_node))
                elif isinstance(current_node, ast.UnaryOp):
                    if not isinstance(child_node, (ast.UAdd, ast.USub, ast.Not, ast.Invert)):
                        stack.append((current_id, child_node))
                else:
                    stack.append((current_id, child_node))
                # stack.append((current_id, child_node))
        return graph

    
    def visualize(self, graph, node, parent=None, skip=False):
        nodename, fillcolor = self.set_nodename_fillcolor(node)
        
        if not skip and isinstance(node, (ast.FunctionDef, ast.ClassDef)):
            subgraph = graphviz.Digraph(name=f'cluster_{id(node)}')
            subgraph.attr(label=str(node.name), style='rounded')
            self.visualize(subgraph, node, parent, skip=True)
            graph.subgraph(subgraph)
        
        node_id = str(id(node))
        if node_id not in self.visited_nodes:
            graph.node(node_id, nodename, style='filled', fillcolor=fillcolor)
            self.visited_nodes.add(node_id)

        if parent is not None:
            edge = (str(id(parent)), node_id)
            if edge not in self.visited_edges:
                graph.edge(*edge)
                self.visited_edges.add(edge)

        for child in ast.iter_child_nodes(node):
            if isinstance(child, ast.AST):
                self.visualize(graph, child, node)
            elif isinstance(child, list):
                for gradn_child in child:
                    if isinstance(gradn_child, ast.AST):
                        self.visualize(graph, gradn_child, node)
    
    def set_nodename_fillcolor(self, node):
        nodename = str(type(node).__name__)
        fillcolor = 'white'
        if isinstance(node, ast.Name):
            nodename = str(node.id)
            fillcolor = 'lightgreen'
        elif isinstance(node, ast.arg):
            nodename = str(node.arg)
            fillcolor = 'lightgreen'
        elif isinstance(node, ast.Eq):
            nodename = '=='
        elif isinstance(node, ast.NotEq):
            nodename = '!='
        elif isinstance(node, ast.Lt):
            nodename = '<'
        elif isinstance(node, ast.LtE):
            nodename = '<='
        elif isinstance(node, ast.Gt):
            nodename = '>'
        elif isinstance(node, ast.GtE):
            nodename = '>='
        elif isinstance(node, ast.Call):
            try: nn = node.func.id
            except: nn = node.func.attr
            nodename = str(nn)
            fillcolor = 'lightblue'
        elif isinstance(node, ast.Constant):
            nodename = str(node.value)
            fillcolor = 'yellow'
        elif isinstance(node, (ast.FunctionDef, ast.ClassDef)):
            fillcolor = 'lightblue'
        return nodename, fillcolor
    

    def run(self, code):
        tree = ast.parse(code)
        self.visited_nodes = set()
        self.visited_edges = set()

        ast_name = self.file_name + '_ast_1'
        ast_path = os.path.join(self.file_path, ast_name)

        ast_base64 = self.gen_asg(tree, ast_name, ast_path)

        return {
            'tabs': '코드구조',
            'values': [
                {
                    'filter' : '추상 구문 트리 그래프',
                    'details' : ast_base64
                },
            ]
        }


if __name__ == "__main__":
    g = GraphHint(file_path="./public", file_name="code")
    code = sys.stdin.read()
    result = g.run(code=code)