# Pandas IntelliSense for VS Code

## Overview
The Pandas IntelliSense extension enhances the Python development experience in VS Code by providing auto-completion for column names when working with Pandas DataFrames. When a user types df[" or df[', the extension will suggest column names based on the DataFrame assignments detected in the code.

## Features
* Automatically detects Pandas DataFrame assignments from pd.read_csv, pd.read_excel, etc.
* Extracts column names and provides IntelliSense suggestions when accessing DataFrame columns.
* Updates suggestions dynamically when running the Update DataFrame Columns command.

## Usage
1. Updating DataFrame Columns: Run the command Pandas IntelliSense: Update DataFrame Columns from the Command Palette (Ctrl+Shift+P).
2. Using IntelliSense: Start typing df[" or df[' and column name suggestions will appear. Press Tab or Enter to insert the selected column name.