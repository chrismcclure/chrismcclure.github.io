var redCircle = '#ffc1cc';
var greenCircle = '#98ff98';
var directReportKey = 'directReports';
var white = 'white';
var black = 'black';
var grey = '#E8E8E8';
var maxIdKey = 'MaxId';
var maxIdFromFileKey = 'MaxIdFromFile';
var selectedItem = null;
var selectedIndex = -1;
var mouseDown = false;
var canvas = document.querySelector('canvas');
var parent = document.getElementById("parent");
canvas.width = parent.offsetWidth;
canvas.height = parent.offsetHeight;
var canvasOffset = canvas.getBoundingClientRect();
var offsetX = canvasOffset.left + window.scrollX;
var offsetY = canvasOffset.top + window.scrollY;
var startX;
var startY;
var csvFilePath = 'files/default.csv';
var issuesFile = 'files/issues.csv';
var nodes;
var issues;
var originalIssues = [];
var issuesOnScreen = [];
var overviewNode;
var buttonColorBlue = '#428BCA';
var buttonColorGreen = '#5CB85C';
var homeViewButton;
var backButton;
var tempNewNodes = [];
var previousNodes = [];
var previousNodesTempHolder = [];
var originalViewNodes = [];

// $(document).ready( function () {
//     $('#myTable').DataTable();
// } );

///Parse the files
Papa.parse(csvFilePath+"?_="+ (new Date).getTime(), {
    header: true,
    download: true,
    dynamicTyping: true,
    complete: function (results) {
        nodes = results.data;
        if (nodes.length > 0) {

            for (i = 0; i < nodes.length; i++) {
                nodes[i].width = 160;
                nodes[i].height = 70;
            }
            SetHomepageDetails();
            tempNewNodes = [];
            tempNewNodes.push(nodes[0]);
            GetChild(nodes[0], 1);
            nodes = tempNewNodes;
            StoreDirectReports();
            SetDefaultLayout();
            loadIssues();
            draw(false);
        }
        originalViewNodes = nodes;
    }
});

function loadIssues() {
    Papa.parse(issuesFile+"?_="+ (new Date).getTime(), {
        header: true,
        download: true,
        dynamicTyping: true,
        complete: function (results) {
            issues = results.data;
            originalIssues = results.data;
            PullFromLocalStorage();
            AddDataToIssuesRecords(issues);
            AddDataToTable(issues);
            AddHighestNumberToLocalStorage();
        }
    });
}

function StoreDirectReports() {
    var directReports = nodes.filter(x => x.parent == 1);
    localStorage.setItem(directReportKey, JSON.stringify(directReports));
};

function PullFromLocalStorage() {
    var maxId = GetCurrentMaxId();
    var maxFileId = GetCurrentMaxFileId();
    if (maxId > maxFileId) {
        for (let index = maxFileId + 1; index < maxId + 1; index++) {
            var issue = JSON.parse(localStorage.getItem(index));
            var issuestoAdd = {};
            issuestoAdd.id = issue.id;
            issuestoAdd.title = issue.title;
            issuestoAdd.owner = issue.owner;
            issuestoAdd.emp = issue.emp;
            issuestoAdd.description = issue.description;
            issuestoAdd.type = issue.type;
            issuestoAdd.visibility = issue.visibility;
            issuestoAdd.leaders = issue.leaders;
            issuestoAdd.open = false;
            issuestoAdd.inputer = issue.inputer;
            issues.push(issuestoAdd);
        }
    }
    else {
        console.log('nothing cool in here :(');
    }
}

var clearButton = document.getElementById('clear-storage');
clearButton.addEventListener('click', function (event) {
    localStorage.clear();
    location.reload();
});


function AddHighestNumberToLocalStorage() {
    var maxId = GetCurrentMaxId();
    var highestNumber = Math.max.apply(Math, issues.map(function (o) { return o.id; }));
    if (maxId === undefined || maxId === 'null' || maxId === 'NaN' || maxId == null) {
        localStorage.setItem(maxIdKey, highestNumber);
    }
    var maxIdFromFile = localStorage.getItem(maxIdFromFileKey);
    if (maxIdFromFile === 'null' || maxIdFromFile == null || maxIdFromFile === undefined) {
        localStorage.setItem(maxIdFromFileKey, highestNumber);
    }
}

function GetCurrentMaxId() {
    var maxId = localStorage.getItem(maxIdKey);
    if (maxId === 'null' || maxId === null || maxId === 'NaN') {
        return maxId;
    }
    return parseInt(maxId);
}

function GetCurrentMaxFileId() {
    var maxId = localStorage.getItem(maxIdFromFileKey);
    if (maxId === 'null' || maxId === null) {
        return maxId;
    }
    return parseInt(maxId);
}

function AddIssueToLocalStorage(issue) {
    var currentId = JSON.stringify(localStorage.getItem(issues.id));
    if (currentId !== 'null') {
        
    }
    else {
        localStorage.setItem(issue.id, JSON.stringify(issue))
    }
}

function AddDataToTable(issues) {
    issuesOnScreen = [];
    for (let i = 0; i < issues.length; i++) {
        AddDataToRowToTable(issues[i]);
        AddIssueToLocalStorage(issues[i]);
    }
    $('#myTable').DataTable();
    //Update the date range
    var dates = issuesOnScreen.sort((a, b) => b.dateObject - a.dateObject);
    var outPut = "No issues";
    if (dates.length > 0) {
        outPut = FormatDate(dates[dates.length - 1].dateObject) + " to " + FormatDate(dates[0].dateObject);
    }
    var dateRangeElem = document.getElementById('date-range');
    dateRangeElem.innerHTML = outPut;
}

function UpdateTableTitle(node) {
    var titleSpan = document.getElementById('title-name');
    titleSpan.innerText = node.Name;
    //Need some way to get all the children then make sure they are included in the issues
}

function AddDataToRowToTable(issue) {
    var issueOwner = nodes.filter(x => x.Id == issue.owner);
    if (issueOwner.length == 0) {
        return;
    }
    //This array is cleared and updated in AddDateToTable  method
    issuesOnScreen.push(issue);
    var owner = issueOwner[0].Name;
    var tBodyElem = document.getElementById("table-data");
    //If you want to add more. Make it an Array!
    var row = document.createElement("tr");
    var cell1 = document.createElement("td");
    var cell2 = document.createElement("td");
    var cell3 = document.createElement("td");
    var cell4 = document.createElement("td");
    var cell5 = document.createElement("td");
    var textnode1 = document.createTextNode(owner);
    var textnode2 = document.createTextNode(issue.title);
    var textnode3 = document.createTextNode(issue.date);
    var textnode4;
    if(issue.status === null || issue.status === undefined){
         textnode4 = document.createTextNode("Resolved");
    } 
    else{
        textnode4= document.createTextNode(issue.status);
    }
     
    var buttonHtml = '';
        console.log(issue);
    if (issue.open) {
        buttonHtml = '<a href="issue.html?Id=' + issue.id + '" class="btn btn-primary">Open Issue</a>';
    }
    else {
        buttonHtml = '<a class="btn btn-primary disabled">Open Issue</a>';
    }
    var textnode5 = buttonHtml;
    cell1.appendChild(textnode1);
    cell2.appendChild(textnode2);
    cell3.appendChild(textnode3);
    cell4.appendChild(textnode4);
    cell5.innerHTML = textnode5;
    row.appendChild(cell1);
    row.appendChild(cell2);
    row.appendChild(cell3);
    row.appendChild(cell4);
    row.appendChild(cell5);
    tBodyElem.appendChild(row);
}

function AddDataToIssuesRecords(issues) {
    var startingCount = 30;
    for (let i = 0; i < issues.length; i++) {

        var alterDate = startingCount + i;
        if (i > 7) {
            startingCount = startingCount - i;
        }
        var today = new Date();
        today.setDate(today.getDate() + alterDate);
        var date = FormatDate(today);
        issues[i].date = date;
        issues[i].dateObject = today;
    }
}

function FormatDate(date) {
    return date.getMonth() + '-' + date.getDate() + '-' + date.getFullYear().toString().substr(-2);      
}

//Button clicks
var fullTableButton = document.getElementById('open-issue');
fullTableButton.addEventListener('click', function (event) {
    window.open("issuessList.html?mainNode=" + overviewNode.Id, "_top");
});

//setting up the click for canvas. 
//Might have double declarations in here
var c = canvas.getContext('2d');
var elem = document.getElementById('myCanvas'),
    elemLeft = elem.offsetLeft,
    elemTop = elem.offsetTop,
    context = elem.getContext('2d');


//MEthods for reseting or deciding what nodes to display
function SetHomepageDetails(node) {
    if (node === undefined || node === null) {
        //Might be able to get rid of this
        //TODO test without 
        var lowestParent = Math.min.apply(Math, nodes.map(function (o) { return o.parent; }))
        overviewNode = nodes.find(o => o.parent === lowestParent);
    }
    else {
        overviewNode = node;
    }
    UpdateTableTitle(overviewNode)
}

function UpdateTableRows() {
    var tempIssuesHolder = [];
    var tBodyElem = document.getElementById("table-data");
    tBodyElem.innerHTML = '';
    for (let index = 0; index < nodes.length; index++) {
        var issuesPerUser = originalIssues.filter(x => x.owner == nodes[index].Id);
        if (issuesPerUser.length > 0) {
            for (let i = 0; i < issuesPerUser.length; i++) {
                tempIssuesHolder.push(issuesPerUser[i]);
            }
        }
    }
    issue = tempIssuesHolder;
    AddDataToTable(issues);
}

function UpdateNodesOnZoom(doubleClickedNode) {
    tempNewNodes = [];
    previousNodes = nodes;
    SetHomepageDetails(doubleClickedNode);
    GetChild(doubleClickedNode, 1);
    nodes = [];
    nodes = tempNewNodes;
    SetDefaultLayout();
    UpdateTableRows();
    draw(false);
}
//Recursion
function GetChild(element, level) {
    element.level = level;
    tempNewNodes.push(element);
    level++;
    var children = nodes.filter(x => x.parent == element.Id);
    if (children.length === 0) {
        return;
    }
    for (let i = 0; i < children.length; i++) {

        GetChild(children[i], level);
    }
}


function SetDefaultLayout() {
    for (let i = 0; i < nodes.length; i++) {
        //Right now this will work, but if it gets big figure this out
        if (nodes[i].level === 1) {
            nodes[i].top = 30;
            nodes[i].left = canvas.width / 3.7;
        }

        if (nodes[i].level === 2) {
            nodes[i].top = 140;
        }

        if (nodes[i].level === 3) {
            nodes[i].top = 300;
        }

        if (nodes[i].level === 4) {
            nodes[i].top = 425;
        }
    }
    //Honestly this kind of sucks, but works for the prototype
    for (let i = 1; i < 5; i++) {
        var levelNodes = nodes.filter(x => x.level == i);
        if (levelNodes.length == 2 && ((levelNodes[0].parent != levelNodes[1].parent) || i == 2)) {
            AdjustWidth(levelNodes[0].Id, canvas.width / 18)
            AdjustWidth(levelNodes[1].Id, canvas.width / 2)
        }
    }
}

function AdjustWidth(Id, left) {
    for (let index = 0; index < nodes.length; index++) {
        if (nodes[index].Id == Id) {
            nodes[index].left = left;
        }
    }
}

//specfiics for a elemtns and returns boolean
function textHittest(x, y, node) {
    return (y > node.top && y < node.top + node.height && x > node.left && x < node.left + node.width);
}


///Mouse Type Events
elem.addEventListener('dblclick', function (event) {
    x = parseInt(event.clientX - offsetX);
    y = parseInt(event.clientY - offsetY);
    var looking = true;
    nodes.forEach(function (element) {
        if (y > element.top && y < element.top + element.height && x > element.left && x < element.left + element.width && looking) {
            looking = false;
            UpdateNodesOnZoom(element);
        }
    });
}, false);

window.addEventListener('resize', function (event) {
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
    SetDefaultLayout();
    draw(true);
});

//Mouse is down do this tuff
elem.addEventListener('mousedown', function (event) {
    mouseDown = true;
    handleMouseDown(event);
});

// elem.addEventListener('touchstart', function (event) {
//     mouseDown = true;
//     handleMouseDown(event);
// });

elem.addEventListener('mousemove', function (event) {
    if (mouseDown) {
        handleMouseMove(event);
    }
});

// elem.addEventListener('touchmove', function (event) {
//     if (mouseDown) {
//         handleMouseMove(event);
//     }
// });

elem.addEventListener('mouseup', function (event) {
    mouseDown = false;
    event.preventDefault();
    selectedItem = null;
    selectedIndex = -1;
});

// elem.addEventListener('touchend', function (event) {
//     mouseDown = false;
//     event.preventDefault();
//     selectedItem = null;
//     selectedIndex = -1;
// });

elem.addEventListener('mouseout', function (event) {
    mouseDown = false;
    event.preventDefault();
    selectedItem = null;
    selectedIndex = -1;
});

// the last mousemove event and move the selected text
// by that distance
function handleMouseMove(e) {
    if (selectedItem === null) {
        console.log('oh no, its null');
        return;
    }
    e.preventDefault();
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);

    // Put your mousemove stuff here
    var dx = mouseX - startX;
    var dy = mouseY - startY;
    startX = mouseX;
    startY = mouseY;
    var rectangle = selectedItem
    rectangle.left += dx;
    rectangle.top += dy;
    nodes[selectedIndex] = rectangle;
    draw(false);
}

//When the most is pushed down, figure out if it hit element
function handleMouseDown(e) {
    e.preventDefault();
    startX = parseInt(e.clientX - offsetX);
    startY = parseInt(e.clientY - offsetY);
    // Put your mousedown stuff here  
    for (i = 0; i < nodes.length; i++) {
        if (textHittest(startX, startY, nodes[i])) {
            selectedItem = nodes[i];
            selectedIndex = i;
            return
        }
    }
}


var previousButton = document.getElementById('previous-view');
previousButton.addEventListener('click', function (event){
    
    previousNodesTempHolder = nodes;
    nodes = previousNodes;
    previousNodes = previousNodesTempHolder;
    SetHomepageDetails();
    tempNewNodes = [];
    GetChild(nodes[0], 1);
    nodes = tempNewNodes;
    SetDefaultLayout();
    UpdateTableRows();
    draw(false);
});


var homeButton = document.getElementById('home-view');

homeButton.addEventListener('click',function(event){
    nodes = originalViewNodes
    SetHomepageDetails();
    tempNewNodes = [];
    GetChild(nodes[0], 1);
    nodes = tempNewNodes;
    SetDefaultLayout();
    UpdateTableRows();
    draw(false);
});

///The DRAWING METHOD!!!
function draw(setLeft) {
    if (nodes == null || nodes === undefined) {
        console.log('Not loaded yet');
        return;
    }

    //Clear everything
    c.clearRect(0, 0, canvas.width, canvas.height);

    //Set the organizational name
    // c.font = "30px Calibri";
    // c.fillStyle = black;
    // var viewName = overviewNode.Name + " Organization View"
    // c.fillText(viewName, canvas.width / 3.2, 25)

    //Set the legend on the top left
    c.font = "16px Calibri";
    //Green Circle
    c.arc(15, (canvas.height - 20), 12, 0, Math.PI * 2, false);
    c.strokeStyle = black;
    c.fillStyle = greenCircle;
    c.fill();
    c.stroke();
    c.beginPath();

    //Red Circle
    c.arc(160, (canvas.height - 20), 12, 0, Math.PI * 2, false);
    c.strokeStyle = black;
    c.fillStyle = redCircle;
    c.fill();
    c.stroke();
    c.beginPath();
    c.fillStyle = black;
    c.fillText("Resolved Issues", 35, (canvas.height - 15))
    c.fillText("Unresolved Issues", 180, (canvas.height - 15))
    c.beginPath();

    //Create objects for the buttons
    // homeViewButton = {
    //     left: 30,
    //     top: 80,
    //     width: 100,
    //     height: 30
    // };
    // backButton = {
    //     left: 30,
    //     top: 120,
    //     width: 100,
    //     height: 30
    // };

    //TODO figure out how to make buttons betters
    //Create Buttons
    // c.strokeStyle = black;
    // c.strokeRect(homeViewButton.left, homeViewButton.top, homeViewButton.width, homeViewButton.height);
    // c.rect(homeViewButton.left, homeViewButton.top, homeViewButton.width, homeViewButton.height);
    // c.fillStyle = buttonColorBlue;
    // c.fill();
    // c.beginPath();
    // c.fillStyle = white;
    // c.fillText("Home View", homeViewButton.left + 15, homeViewButton.top + 19)
    // c.beginPath();
    //Create Buttons
    // c.strokeStyle = black;
    // c.strokeRect(backButton.left, backButton.top, backButton.width, backButton.height);
    // c.rect(backButton.left, backButton.top, backButton.width, backButton.height);
    // c.fillStyle = buttonColorGreen;
    // c.fill();
    // c.fillStyle = white;
    // c.fillText("Previous", backButton.left + 15, backButton.top + 19)
    // c.beginPath();

    //make centers for the rectangle
    for (i = 0; i < nodes.length; i++) {
        if (nodes[i].left === undefined || setLeft) {
            nodes[i].left = (canvas.width / nodes[i].LeftDivid)
        }

        var center = { x: (nodes[i].left + (nodes[i].width / 2)), y: (nodes[i].top + (nodes[i].height / 2)) }
        nodes[i].x = center.x;
        nodes[i].y = center.y;
    }

    //Draw the underlying connecting lines
    for (i = 0; i < nodes.length; i++) {
        if (nodes[i].parent === 0 || i === 0) {
            continue;
        }
        c.moveTo(nodes[i].x, nodes[i].y);
        var parent = nodes.find(o => o.Id === nodes[i].parent);
        c.lineTo(parent.x, parent.y);
        c.strokeStyle = 'black';
        c.stroke();
    }


    //Draw the rectangles and circles
    for (i = 0; i < nodes.length; i++) {
        var tempRectangle = nodes[i];
        //Draw the outside rectangle
        c.beginPath();
        c.strokeStyle = black;
        c.strokeRect(tempRectangle.left, tempRectangle.top, tempRectangle.width, tempRectangle.height);
        c.rect(tempRectangle.left, tempRectangle.top, tempRectangle.width, tempRectangle.height);
        c.fillStyle = grey;
        c.fill();
        //Commented this out and it looks good, not sure why
        //c.fillStyle = black;
        //c.stroke();

        //Draw the red circle  otherwise known as issues
        //c.moveTo(tempRectangle.x -40, tempRectangle.y + 10);
        c.beginPath();
        c.arc(tempRectangle.x - 65, tempRectangle.y + 15, 12, 0, Math.PI * 2, false);
        c.strokeStyle = black;
        c.fillStyle = redCircle;
        c.fill();
        c.stroke();
        c.beginPath();
        c.fillStyle = black;
        var issuesText = new String(tempRectangle.issues);
        var issueResolvedY = tempRectangle.y + 20;
        if (issuesText.length == 2) {
            c.fillText(tempRectangle.issues, tempRectangle.x - 74, issueResolvedY)
        }
        if (issuesText.length == 1) {
            c.fillText(tempRectangle.issues, tempRectangle.x - 69, issueResolvedY)
        }
        c.beginPath();

        //Draw the green circle otherwise known as resolved
        //c.moveTo(tempRectangle.x -10, tempRectangle.y + 10);
        c.beginPath();
        c.arc(tempRectangle.x - 37, tempRectangle.y + 15, 12, 0, Math.PI * 2, false);
        c.strokeStyle = black;
        c.fillStyle = greenCircle;
        c.fill();
        c.stroke();
        c.beginPath();

        //Draw the number
        c.fillStyle = black;
        var resolvedText = new String(tempRectangle.resolved);
        if (resolvedText.length == 2) {
            c.fillText(tempRectangle.resolved, tempRectangle.x - 45, issueResolvedY)
        }
        if (resolvedText.length == 1) {
            c.fillText(tempRectangle.resolved, tempRectangle.x - 40, issueResolvedY)
        }
        c.beginPath();
        c.fillStyle = 'black';
        c.fillText(nodes[i].Name, nodes[i].x - 75, nodes[i].y - 22);
        c.fillText(nodes[i].Title, nodes[i].x - 75, nodes[i].y - 5);
        c.beginPath();
    }
}