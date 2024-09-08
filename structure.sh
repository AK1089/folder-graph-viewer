#!/bin/bash

IGNORE_FILE="ignore.txt"
IGNORE_PATTERNS=""

function load_ignore_patterns() {
    if [ -f "$IGNORE_FILE" ]; then
        IGNORE_PATTERNS=$(grep -v '^#' "$IGNORE_FILE" | sed '/^\s*$/d' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    fi
}

function should_ignore() {
    local path="$1"
    local basename=$(basename "$path")
    
    while IFS= read -r pattern; do
        # Exact match
        if [ "$basename" = "$pattern" ]; then
            return 0
        fi
        
        # Prefix*
        if [[ "$pattern" == *\* && "$basename" == ${pattern%\*}* ]]; then
            return 0
        fi
        
        # *Suffix
        if [[ "$pattern" == \** && "$basename" == *${pattern#\*} ]]; then
            return 0
        fi
    done <<< "$IGNORE_PATTERNS"
    
    return 1
}

function traverse() {
    local dir="$1"
    local indent="$2"
    
    echo "$indent{"
    echo "$indent    \"name\": \"$(basename "$dir")\","
    echo "$indent    \"type\": \"folder\","
    echo "$indent    \"children\": ["
    
    local first=true
    for item in "$dir"/*; do
        [ -e "$item" ] || continue  # Check if item exists
        
        if should_ignore "$item"; then
            continue
        fi
        
        if [ "$first" = false ]; then
            echo "$indent        ,"
        fi
        first=false
        
        if [ -d "$item" ]; then
            traverse "$item" "$indent        "
        else
            echo "$indent        {"
            echo "$indent            \"name\": \"$(basename "$item")\","
            echo "$indent            \"type\": \"file\""
            echo -n "$indent        }"
        fi
    done
    
    echo ""
    echo "$indent    ]"
    echo -n "$indent}"
}

load_ignore_patterns
echo "const rootFolderName = \"$(pwd)\";"
echo "const folderData ="
traverse "$(pwd)" ""
echo ";"