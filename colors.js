// mapping of colours to groups of file extensions
const defaultColorForExtensions = {
    '#fea82f': '$DIRECTORY',
    '#000000': 'txt log $NO_EXTENSION',
    '#2e603f': 'csv xls xlsx ods numbers ppt pptx odp key doc docx pdf rtf odt tex md',
    '#efa9ba': 'jpg jpeg png gif bmp tiff svg psd ai eps raw webp',
    '#cc76a1': 'mp3 wav ogg flac aac m4a wma mp4 avi mov wmv flv mkv webm',
    '#03dd5e': 'exe dll so app bin iso dmg zip rar 7z tar gz bz2',
    '#1edaff': 'py js html css java c cpp cs php rb go rs swift kt ts scala pl lua sh bat ps1 sql r m vb asm f f90 dart msc nms jsx tsx vue less scss sass htaccess wasm db sqlite mdb accdb odb git svn ini cfg conf properties env xml json yaml yml',
    '#b59270': 'obj fbx blend stl dae 3ds dwg dxf unity unitypackage blend ma mb max uasset upk ttf otf woff woff2 eot',
    '#5448c8': '$OTHER'
};

let colorForExtensions = JSON.parse(localStorage.getItem('colorKey')) || defaultColorForExtensions;

// function to reverse the mapping
function createExtensionColorMap(colorForExtensions) {
    const extensionColorMap = {};
    for (const [color, extensions] of Object.entries(colorForExtensions)) {
        extensions.split(' ').forEach(ext => {
            extensionColorMap[ext] = color;
        });
    }
    return extensionColorMap;
}

let extensionColorMap = createExtensionColorMap(colorForExtensions);

// function to create modal content
function createModalContent() {

    // clear existing content
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = '<p>Change the colours of file extensions here. You can also use $DIRECTORY, $NO_EXTENSION, and $OTHER to control the behaviour of the colour selector.</p>';

    // create a row for each color
    Object.entries(colorForExtensions).forEach(([color, extensions]) => {
        const row = document.createElement('div');
        row.className = 'row';

        // create a prefilled text field for the extensions
        const textField = document.createElement('input');
        textField.type = 'text';
        textField.value = extensions;
        textField.style.marginRight = '10px';

        // create a prefilled color input for the color
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = color;

        // add the elements to the row
        row.appendChild(textField);
        row.appendChild(colorInput);
        modalContent.appendChild(row);
    });

    // create a save button
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save & Close';

    // save the new colors and close the modal when the button is clicked
    saveButton.onclick = function () {
        const newColorForExtensions = {};

        // update colorForExtensions based on the new values in the modal
        modalContent.querySelectorAll('.row').forEach(row => {
            const textField = row.querySelector('input[type="text"]');
            const colorInput = row.querySelector('input[type="color"]');
            if (textField && colorInput) {
                newColorForExtensions[colorInput.value] = textField.value;
            }
        });

        colorForExtensions = {...newColorForExtensions};

        // update the extensionColorMap and save the new color key to local storage
        extensionColorMap = createExtensionColorMap(colorForExtensions);
        localStorage.setItem('colorKey', JSON.stringify(colorForExtensions));

        // hide the modal and update the graph with the new colors
        document.getElementById('modal').style.display = 'none';
        updateGraph();
    };

    // create a save button
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset to Default';

    // reset the colors to the default values when the button is clicked
    resetButton.onclick = function () {
        colorForExtensions = {...defaultColorForExtensions};
        extensionColorMap = createExtensionColorMap(colorForExtensions);
        localStorage.removeItem('colorKey');
        updateGraph();
        createModalContent();
    };

    modalContent.appendChild(saveButton);
    modalContent.appendChild(resetButton);
}

// create the initial modal content
createModalContent();

// close the modal when clicking outside of it
window.onclick = function (event) {
    if (event.target === document.getElementById('modal')) {
        document.getElementById('modal').style.display = 'none';
    }
};

// get the colour of a node based on its data
function getColor(d) {
    if (d.data.type === 'folder') return extensionColorMap['$DIRECTORY'];

    // get the name and the location of the last . (immediately before the file extension)
    const name = d.data.name;
    const lastDotIndex = name.lastIndexOf('.');

    // if there is no extension, return pure black
    if (lastDotIndex === -1) return extensionColorMap['$NO_EXTENSION'];

    // return the file's colour, or the default color if its extension is not found
    const extension = name.slice(lastDotIndex + 1).toLowerCase();
    return extensionColorMap[extension] || extensionColorMap['$OTHER'];
}