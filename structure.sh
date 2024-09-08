#!/bin/bash

# get the path of the ignore file and make a blank variable to store the patterns to ignore
IGNORE_FILE="$( dirname "${BASH_SOURCE[0]}" )/ignore.txt"
IGNORE_PATTERNS=""

# if the ignore file exists, read the patterns and store them in the variable
if [ -f "$IGNORE_FILE" ]; then
    IGNORE_PATTERNS=$(grep -v '^#' "$IGNORE_FILE" | sed '/^\s*$/d' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
fi

# function to check if a file should be ignored (0) or included (1)
function ignore_file() {

    # get the name of the file
    local basename=$(basename "$1")
    
    # loop through the patterns from the ignore file
    while IFS= read -r pattern; do

        # exact match - ignore the file
        if [ basename = pattern ]; then
            return 0
        fi
        
        # prefix* - ignore the file
        if [[ "$pattern" == *\* && "$basename" == ${pattern%\*}* ]]; then
            return 0
        fi
        
        # *suffix - ignore the file
        if [[ "$pattern" == \** && "$basename" == *${pattern#\*} ]]; then
            return 0
        fi

    done <<< "$IGNORE_PATTERNS"

    # if no match is found, do not ignore the file
    return 1
}

# function to traverse the directory structure and generate JSON data
function traverse() {

    # get the directory and indentation level
    local dir="$1"
    local indent="$2"
    
    # print the folder name and type
    echo "$indent{"
    echo "$indent    \"name\": \"$(basename "$dir")\","
    echo "$indent    \"type\": \"folder\","
    echo "$indent    \"children\": ["
    
    # loop through the items in the directory
    local first=true
    for item in "$dir"/*; do

        # skip if the item does not exist
        [ -e "$item" ] || continue
        
        # skip if the item should be ignored
        if ignore_file "$item"; then
            continue
        fi
        
        # print a comma if this is not the first item
        if [ "$first" = false ]; then
            echo "$indent        ,"
        fi
        first=false
        
        # if the item is a directory, recursively traverse it
        if [ -d "$item" ]; then
            traverse "$item" "$indent        "
        
        # if the item is a file, print the name and type
        else
            echo "$indent        {"
            echo "$indent            \"name\": \"$(basename "$item")\","
            echo "$indent            \"type\": \"file\""
            echo -n "$indent        }"
        fi
    done
    
    # print the closing brackets
    echo ""
    echo "$indent    ]"
    echo -n "$indent}"
}

# print the root folder name and call the traverse function on the directory to generate the data
echo "const rootFolderName = \"$(pwd)\";"
echo "const folderData ="
traverse "$(pwd)" ""
echo ";"