// create a d3 viewer object occupying the whole window
const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select("#viewer")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const g = svg.append("g");

const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on("zoom", (event) => {
        g.attr("transform", event.transform);
    });

svg.call(zoom);

// create a hierarchy from the folder data with each object being a node
const root = d3.hierarchy(folderData);

// move everything to the middle of the screen
const initialTransform = d3.zoomIdentity
    .translate(width / 2, height / 2);
svg.call(zoom.transform, initialTransform);

document.title = root.data.name;
root.each(d => {
    d.hidden = (d.depth ** 2) * (d.children ? d.children.length : 0) > 16;
    d.baseRadius = Math.max(60 / (d.depth + 2), 8);
});

let nodes = root.descendants();
let links = root.links();

// create a force simulation to position the nodes
const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(d => 250 / (d.source.depth + 1)).strength(1.5))
    .force("charge", d3.forceManyBody().strength(d => -3000 / (d.depth + 1)))
    .force("x", d3.forceX())
    .force("y", d3.forceY());

// update the graph with the current state of the nodes and links
function updateGraph() {
    const visibleNodes = nodes.filter(d => !d.ancestors().slice(1).some(p => p.hidden));
    const visibleLinks = links.filter(d => visibleNodes.includes(d.source) && visibleNodes.includes(d.target));

    // update the links and nodes
    const link = g.selectAll(".link")
        .data(visibleLinks, d => d.target.id);

    // remove any links that are no longer needed
    link.exit().remove();

    // add new links
    link.enter().append("line")
        .attr("class", "link");

    // update the nodes
    const node = g.selectAll(".node")
        .data(visibleNodes, d => d.id);

    node.exit().remove();

    // add new nodes and set up their appearance and behaviour to make them interactive
    const nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("click", onClickNode);

    // add a circle for the outer part of the node (the colour) and a circle for the inner part (white)
    nodeEnter.append("circle")
        .attr("class", "outer");
    nodeEnter.append("circle")
        .attr("class", "inner")
        .attr("fill", "#fff");
    nodeEnter.append("text")
        .attr("dy", "0.31em")
        .text(d => d.data.name)
        .style("text-anchor", "middle");

    const nodeUpdate = node.merge(nodeEnter);

    // update the appearance of the nodes based on their type and depth (colour and size)
    nodeUpdate.select(".outer")
        .attr("r", d => d.baseRadius)
        .attr("fill", d => getColor(d));

    nodeUpdate.select(".inner")
        .attr("r", d => (d.data.type === 'folder' && !d.hidden) ? d.baseRadius * 0.75 : 0);

    nodeUpdate.select("text")
        .attr("font-size", d => `${Math.max(12, d.baseRadius)}px`)
        .attr("y", d => d.baseRadius * 1.5);

    g.selectAll(".link").lower();

    // update the simulation with the new nodes and links and restart it
    simulation.nodes(visibleNodes);
    simulation.force("link").links(visibleLinks);
    simulation.alpha(1).restart();
}

// function to generate full path for a node
function getFullPath(node) {
    const path = [];
    let current = node;
    while (current) {
        path.unshift(current.data.name);
        current = current.parent;
    }
    path.shift();
    path.unshift(rootFolderName.replace('/', ''));
    const filePath = path.join('/')
    return filePath.replace(/^\Users\/[^/]+/, '~');
}

// function to toggle the visibility of a folder or open a file
function onClickNode(event, d) {
    if (d.data.type === 'folder') {
        d.hidden = !d.hidden;
        updateGraph();
    } else if (d.data.type === 'file') {
        const fullPath = getFullPath(d);
        navigator.clipboard.writeText(fullPath);
    }
}

// update the graph when the simulation ticks
simulation.on("tick", () => {
    g.selectAll(".link")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    g.selectAll(".node")
        .attr("transform", d => `translate(${d.x},${d.y})`);
});

// functions to handle dragging of nodes
function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

function openFile(filePath) {
    const link = document.createElement('a');
    link.href = 'file://' + filePath;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// function to update dimensions
window.addEventListener('resize', () => {
    svg.attr("width", window.innerWidth)
        .attr("height", window.innerHeight);
});

updateGraph();