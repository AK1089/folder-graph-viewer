#!/bin/bash

# directory where the script and template are stored
SCRIPT_DIR="$( dirname "${BASH_SOURCE[0]}" )"

# generate folder structure data and save it to a temporary file
"$SCRIPT_DIR/structure.sh" > "$SCRIPT_DIR/folder_data.js"

# open the HTML file in the default browser
open "$SCRIPT_DIR/folder.html"