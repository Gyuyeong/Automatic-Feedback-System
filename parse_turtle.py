import ast
import json

filename = "./run.py"

try:
    with open(filename, 'r') as source:
        node = ast.parse(source.read())
except:  # error in python source code
    print("Error in Python file")
    with open("parsed_python_file.json", 'w') as f:
        json.dump([{"status": 0}])
    quit()

json_items = []
json_items.append({"status": 1})

for line in node.body:
    json_dict = {}
    if isinstance(line, ast.Import):  # later
        continue
    elif isinstance(line, ast.ImportFrom):
        module = line.module
        # json_dict["module"] = module
    elif isinstance(line, ast.Expr):  # Expression
        value = line.value

        if isinstance(value, ast.Call):  # Turtle is usually function call
            function_name = value.func.id
            args = []
            # need to add kwargs for later
            for arg in value.args:
                args.append(arg.value)

            meta_dict = {}
            meta_dict["type"] = "function"
            meta_dict["args"] = args

            json_dict[function_name] = meta_dict

    elif isinstance(line, ast.For):  # later
        continue

    json_items.append(json_dict)

with open("parsed_python_file.json", 'w') as f:
    json.dump(json_items, f)