## Folder Graph Viewer

a tool for Mac which displays your folders as a connected hierarchical graph


### Usage

to clone the repository, run this:
```
git clone https://github.com/AK1089/folder-graph-viewer
```

to make an alias, add this in your shell config file:
```
alias folder='PATH/TO/folder-graph-viewer/view.sh'
```

to change the files which you see, use `ignore.txt`.


### Example

```
ak1089.github.io % folder
```
opens this viewer up in my browser:

<img width="1065" alt="image" src="https://github.com/user-attachments/assets/523cddf3-6dd8-481b-b8f0-3a00595ce458">

some folders (orange) will start out closed in a sensible way to avoid clutter - you can open and close folders by clicking on them.

alternatively, pressing `O` will open _everything_ up, like this:

<img width="1106" alt="image" src="https://github.com/user-attachments/assets/139303fe-ae6b-4c8b-86af-b14417679288">

if you want to control the colour palette, press `C`.

<img width="1144" alt="image" src="https://github.com/user-attachments/assets/e87caf89-f0a0-41d6-a703-511548f59ed6">

your preferences save to local storage for next time you use the tool.

note that running this on very large folders might take some time (takes around 20s to load when running on *all* my non-system files).
