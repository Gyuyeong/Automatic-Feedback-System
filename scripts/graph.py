import ast
import graphviz
import os
import base64
import sys
import json

global_dict = {}


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
    

    def gen_asg(self, tree, ast_path, line_number):
        graph = self.__gen_graph()
        self.ast2graph(tree, graph, line_number)
        graph.render(filename=ast_path, format='svg', cleanup=True)
        return self.__get_graph(ast_path)

    def ast2graph(self, tree, graph, line_number):
        stack = [(None, tree)]  # A stack to keep track of nodes and their parent IDs

        while stack:
            parent_id, current_node = stack.pop()

            current_line_number = getattr(current_node, 'lineno', -1)

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
                if current_line_number == line_number:
                    graph.node(str(current_id), label=f"{current_node.id}", color='orange', style='filled')
                else:
                    graph.node(str(current_id), label=f"{current_node.id}")
            elif isinstance(current_node, ast.arg):
                if current_line_number == line_number:
                    graph.node(str(current_id), label=f"{current_node.arg}", color='orange', style='filled')
                else:
                    graph.node(str(current_id), label=f"{current_node.arg}")
            elif isinstance(current_node, ast.Constant):
                if current_line_number == line_number:
                    graph.node(str(current_id), label=f"{current_node.value}", color='orange', style='filled')
                else:
                    graph.node(str(current_id), label=f"{current_node.value}")
            elif isinstance(current_node, ast.List):
                elements = current_node.elts
                elements = [elt.value for elt in elements]
                if current_line_number == line_number:
                    graph.node(str(current_id), label=f"{elements}", color='orange', style='filled')
                else:
                    graph.node(str(current_id), label=f"{elements}")
            elif isinstance(current_node, ast.Call):
                try: 
                    label = current_node.func.id
                except:
                    label = current_node.func.attr
                if current_line_number == line_number:
                    graph.node(str(current_id), label=f"{label}", color='orange', style='filled')
                else:
                    graph.node(str(current_id), label=f"{label}")
            elif isinstance(current_node, ast.FunctionDef):
                if current_line_number == line_number:
                    graph.node(str(current_id), label=f"{current_node.__class__.__name__}:\n{current_node.name}", color='orange', style='filled')
                else:
                    graph.node(str(current_id), label=f"{current_node.__class__.__name__}:\n{current_node.name}")
            # not done implementing with class definition
            elif isinstance(current_node, ast.ClassDef):
                graph.node(add_current_id, label=current_node.name)
                graph.edge(str(current_id), add_current_id)
            elif isinstance(current_node, (ast.UnaryOp, ast.BinOp, ast.AugAssign)):
                if current_line_number == line_number:
                    graph.node(str(current_id), label=f"{current_node.__class__.__name__}\n{current_node.op.__class__.__name__}", color='orange', style='filled')
                else:
                    graph.node(str(current_id), label=f"{current_node.__class__.__name__}\n{current_node.op.__class__.__name__}")
            elif isinstance(current_node, (ast.Compare)):
                if current_line_number == line_number:
                    graph.node(str(current_id), label=f"{current_node.__class__.__name__}\n{current_node.ops.__class__.__name__}", color='orange', style='filled')
                else:
                    graph.node(str(current_id), label=f"{current_node.__class__.__name__}\n{current_node.ops.__class__.__name__}")

            # Add child nodes to the stack
            if not isinstance(current_node, ast.List):
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
    

    def run(self, tree, idx, line_number):
        self.visited_nodes = set()
        self.visited_edges = set()

        if line_number not in global_dict:  # first time processing
            ast_name = self.file_name + '_ast_' + str(idx + 1)
            ast_path = os.path.join(self.file_path, ast_name)

            _ = self.gen_asg(tree, ast_path, line_number)

            # if line_number not in global_dict:
            global_dict[line_number] = ast_name + ".svg"

        return True


if __name__ == "__main__":
    g = GraphHint(file_path="./public", file_name="code")
    input_data = sys.stdin.read()
    data = json.loads(input_data)
    code = data.get('code', '')
    executed_line_numbers = data.get('executedSequence', [])

    tree = ast.parse(code)  # parse code to AST
    for idx, line_number in enumerate(executed_line_numbers[6:]):
        result = g.run(tree=tree, idx=idx, line_number=int(line_number) - 5)

    # subtract 5 to get the original line number
    for i in range(len(executed_line_numbers)):
        executed_line_numbers[i] = int(executed_line_numbers[i]) - 5

    result_packet = dict()
    result_packet['executed_line_numbers'] = executed_line_numbers[6:]
    result_packet['line_number_and_image_mappings'] = global_dict

    print(json.dumps(result_packet))