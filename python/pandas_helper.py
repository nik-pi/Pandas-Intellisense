# import sys
# import json
# import ast
# import pandas as pd

# def extract_dataframe_columns(code):
#     dataframes = {}

#     try:
#         tree = ast.parse(code)

#         for node in ast.walk(tree):
#             if isinstance(node, ast.Assign) and isinstance(node.value, ast.Call):
#                 if isinstance(node.value.func, ast.Attribute) and isinstance(node.value.func.value, ast.Name):
#                     if node.value.func.attr == "DataFrame":
#                         var_name = node.targets[0].id  # Extract variable name
#                         columns = []

#                         # Try to extract columns from the constructor if available
#                         if node.value.args and isinstance(node.value.args[0], ast.Dict):
#                             keys = node.value.args[0].keys
#                             columns = [key.s for key in keys if isinstance(key, ast.Str)]
                        
#                         dataframes[var_name] = columns

#         return dataframes if dataframes else {"error": "No DataFrames found"}

#     except Exception as e:
#         return {"error": str(e)}

import pandas as pd
import sys
import json
def find_assignments(code: str) -> list:
    lines = []
    for line in code.splitlines():
        if 'pd.read' in line:
            lines.append(line)

    return lines

def get_columns(code: str):
    cols = {}
    lines = find_assignments(code)
    for line in lines:
        key, assignment = line.split('=')
        key = key.strip()
        if 'nrows' not in assignment:
            assignment = assignment.replace(')', ', nrows=5)')
        columns = list(eval(assignment).columns)
        cols[key] = columns
    return json.dumps(cols)


if __name__ == "__main__":
    code = sys.stdin.read()  # Read from stdin instead of argv
    result = get_columns(code)
    print(result)
