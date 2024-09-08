#!/bin/bash

# Directory where the script and template are stored
SCRIPT_DIR="$HOME/folder_viewer"

# Copy the template and ignore file to the current directory
cp "$SCRIPT_DIR/folder_viewer_template.html" folder_viewer_main_file.html
cp "$SCRIPT_DIR/folder_viewer_traversal_ignore.txt" folder_viewer_traversal_ignore.txt

# Generate folder structure data
"$SCRIPT_DIR/get_folder_structure.sh" > folder_viewer_data.js

# Open the temporary HTML file in the default browser
open folder_viewer_main_file.html

# Wait for the browser to open, then remove the temporary file
sleep 5
rm folder_viewer_main_file.html folder_viewer_data.js folder_viewer_traversal_ignore.txt
