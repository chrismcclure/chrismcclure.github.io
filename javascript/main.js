var redCircle = '#ffc1cc';
var greenCircle = '#98ff98';
var directReportKey = 'directReports';
var white = 'white';
var black = 'black';
var grey = '#E8E8E8';
var graphAreaUnselecteColor = '#DCDCDC';
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
var itemsFile = 'files/items.csv';
var itemsTypesFile = 'files/itemType.csv';
var nodes;
var items;
var originalitems = [];
var itemsOnScreen = [];
var overviewNode;
var buttonColorBlue = '#428BCA';
var buttonColorGreen = '#5CB85C';
var homeViewButton;
var backButton;
var tempNewNodes = [];
var previousNodes = [];
var previousNodesTempHolder = [];
var originalViewNodes = [];
var images = [];
var levelB = false;
var levelBTempNodes = [];
var levelC = false;
var levelCTempNodes = [];
var levelD = false;
var LevelDItems = [];
var itemTypes = [];
var showOnlyFeaturedLeader;
var itemsPerPerson = [];
var TempItemsPerPerson = [];
//Manage the state of the graphs
var policyElement;
var policyClicked = false;
var issuesElement;
var issuesClicked = false;
var resolvedElement;
var resolvedClicked = false;
var unresolvedElement;
var unresolvedClicked = false;
var praiseElement;
var praiseClicked = false;
var leaderElement;
var leaderClicked = false;
var associateElement;
var associateClicked = false;
var viewFullTable = false;
var topForLegend = 465;


///Parse the files
Papa.parse(csvFilePath + "?_=" + (new Date).getTime(), {
    header: true,
    download: true,
    dynamicTyping: true,
    complete: function (results) {
        nodes = results.data;
        if (nodes.length > 0) {

            for (i = 0; i < nodes.length; i++) {
                nodes[i].width = 175;
                nodes[i].height = 70;
            }
            SetUserLevel();
            if (!levelD) {
                SetHomepageDetails();
                tempNewNodes = [];
                //tempNewNodes.push(nodes[0]);
                GetChild(nodes[0], 1);
                nodes = tempNewNodes;
                StoreDirectReports();
                SetDefaultLayout();
            }
            else{
                console.log('leveld ');
            }
            Papa.parse(itemsTypesFile + "?_=" + (new Date).getTime(), {
                header: true,
                download: true,
                dynamicTyping: true,
                complete: function (results) {
                    itemTypes = results.data;
                    loaditems();
                }
            });
        }
        originalViewNodes = nodes;
    }
});

function loaditems() {
    Papa.parse(itemsFile + "?_=" + (new Date).getTime(), {
        header: true,
        download: true,
        dynamicTyping: true,
        complete: function (results) {
            items = results.data;
            originalitems = results.data;
                
            if(levelD){
                console.log('level d 2');
                FilterToLevelD();
                LoadProgressBars();
            }else{
                PullFromLocalStorage();  
                AddDataToitemsRecords(items);
                items = items.sort((a, b) => a.owner - b.owner);
                AddDataToTable(items);
                UpdateTableRows();        
                AddHighestNumberToLocalStorage();
                UpdateItemCountPerPerson();   
                if (levelB){
                    FilterToLevelB();
                }  
                else if( levelC){
                    FilterToLevelC();
                }  
                else{
                    draw(false);
                }
                LoadProgressBars()   
            }

           
        }
    });
}

function UpdateItemCountPerPerson(){
    for (let index = 0; index < itemsPerPerson.length; index++) {
        var user = itemsPerPerson[index];
        var personItems = items.filter( x => x.owner === user.Id);
        itemsPerPerson[index].Total = personItems.length;
        itemsPerPerson[index].Resolved = personItems.filter(x => x.status === 'Resolved').length;
        itemsPerPerson[index].Unresolved = itemsPerPerson[index].Total - itemsPerPerson[index].Resolved;      
        TempItemsPerPerson[index] = {
            Id: user.Id,
            Total: personItems.length,
            Resolved : personItems.filter(x => x.status === 'Resolved').length,
            Unresolved : itemsPerPerson[index].Total - itemsPerPerson[index].Resolved
        }
    }
 
    for (let i = 0; i < itemsPerPerson.length; i++) {
        var localItem = itemsPerPerson[i];
        UpdateParent(localItem, i);         
    }
}

function UpdateParent(localItem, index){
    var children = itemsPerPerson.filter(x => x.ParentId === localItem.Id);  

    if(children === null || children === undefined || children.length === 0){
        return;
    }  
    else{      
        var childResolved = 0;
        var childUnresolved = 0;

        for (let i = 0; i < children.length; i++) {
           childResolved += children[i].Resolved;
           childUnresolved += children[i].Unresolved;            
        }
                   
        itemsPerPerson[index].Total = TempItemsPerPerson[index].Total +  childResolved + childUnresolved; 
        itemsPerPerson[index].Resolved =   TempItemsPerPerson[index].Resolved +  childResolved; 
        itemsPerPerson[index].Unresolved = TempItemsPerPerson[index].Unresolved  +  childUnresolved; 

        var parentIndex = itemsPerPerson.findIndex(obj => obj.Id === localItem.ParentId);
        if(parentIndex === undefined || parentIndex == null || itemsPerPerson[parentIndex] === undefined){
            return;
        }

        UpdateParent(itemsPerPerson[parentIndex], parentIndex);
    }
}

function SetUserLevel(){
    var url = window.location.search;
    var query = url.split('=');
    var level = (query[query.length -1]);
    if(level === 'B'){
        levelB = true;
    }
    if(level === 'C'){
        console.log('level c');
        levelC = true;
    }
    if(level === 'D'){
        levelD = true;
    }
}

function FilterToLevelB() {
    levelB = true;
    levelBTempNodes = nodes;
    console.log('load the page for mark');
    var markNode = nodes.find(o => o.Id === 5);
    nodes = [];
    FilterGetChild(markNode, 1);
    SetHomepageDetails();
    tempNewNodes = [];
    GetChild(nodes[0], 1);
    nodes = tempNewNodes;
    originalViewNodes = tempNewNodes;
    SetDefaultLayout();
    UpdateTableRows();
    draw(false);
}

function FilterToLevelC(){    

    levelC = true;
    levelCTempNodes = nodes;  
    viewFullTable = false;
    ToggleFullTable();     
    console.log('load the page for laurie');
    var laurieNode = nodes.find(o => o.Id === 6);
    nodes = [];
    FilterGetChild(laurieNode, 1);
    HideButton();
    SetHomepageDetails();
    //SetDefaultLayout();
    UpdateTableRows();
   // draw(false);    
}

function FilterToLevelD(){    
    levelD = true;
    viewFullTable = false;
    console.log('here is the part');
          
    console.log('load the page for mark');
    var jimNode = {
        id : 100,
        Name : 'Jim Wiggum',
        itemOwner :' Laurie Gumble',       
    }; 
    nodes = [];
    nodes.push(jimNode);   
    HideButton();
    SetHomepageDetails(jimNode);
  
    UpdateItemsForLevelD(jimNode);
    ToggleFullTable();
    //draw(false);    
}

function UpdateItemsForLevelD(node){ 
    for (let index = 0; index < items.length; index++) {       
        if(items[index].emp === node.Name){
            itemsOnScreen.push(items[index]);
            LevelDItems.push(items[index])         
        }        
    }
    items = [];
    items = LevelDItems;
    AddDataToitemsRecords(items);
}

function HideButton(){
    var buttonHolder = document.getElementById('buttons-toggle');   
    buttonHolder.style.display = 'none';
}

function FilterGetChild(element, level) {
    var holder = levelBTempNodes; 
    element.level = level;
    nodes.push(element);
    level++;
    var children = holder.filter(x => x.parent == element.Id);
    if (children.length === 0) {
        console.log('there are no childred');
        return;
    }
    for (let i = 0; i < children.length; i++) {       

        FilterGetChild(children[i], level);
    }
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
            var item = JSON.parse(localStorage.getItem(index));
            var itemstoAdd = {};
            itemstoAdd.id = item.id;
            itemstoAdd.title = item.title;
            itemstoAdd.owner = item.owner;
            itemstoAdd.emp = item.emp;
            itemstoAdd.description = item.description;
            itemstoAdd.type = item.type;
            itemstoAdd.visibility = item.visibility;
            itemstoAdd.leaders = item.leaders;
            itemstoAdd.open = false;
            itemstoAdd.inputer = item.inputer;
            items.push(itemstoAdd);
        }
    }
    else {
       //don't do anything
    }
}

var clearButton = document.getElementById('clear-storage');
clearButton.addEventListener('click', function (event) {
    localStorage.clear();
    location.reload();
});


var selectedLeader = document.getElementById('mine-only');
selectedLeader.checked = false;
showOnlyFeaturedLeader = false;
selectedLeader.addEventListener('change', (event) => {
    if (event.target.checked) {
        showOnlyFeaturedLeader = true;   
    } else {  
        showOnlyFeaturedLeader = false;
    }
    UpdateTableRows();
    LoadProgressBars();
  })

function AddHighestNumberToLocalStorage() {
    var maxId = GetCurrentMaxId();
    var highestNumber = Math.max.apply(Math, items.map(function (o) { return o.id; }));
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

function AdditemToLocalStorage(item) {
    var currentId = JSON.stringify(localStorage.getItem(items.id));
    if (currentId !== 'null') {

    }
    else {
        localStorage.setItem(item.id, JSON.stringify(item))
    }
}

function AddDataToTable(items) {
    itemsOnScreen = [];
    // var mainHolderDiv = document.getElementById("panel-holder-div");
    // mainHolderDiv.innerHTML = '';   
    var tBodyElem = document.getElementById("table-data");
    tBodyElem.innerHTML = '';
    $('#myTable').dataTable().fnClearTable();  
    items = items.sort((a, b) => a.owner - b.owner)
    UpdateTableHeaders();
    for (let i = 0; i < items.length; i++) {
        AddDataToRowToTable(items[i]);
        //AdditemToLocalStorage(items[i]);
        //AddDataToMobilePanel(items[i]);
    }       
    $('#myTable').DataTable();
    //Update the date range
    var dates = itemsOnScreen.sort((a, b) => b.dateObject - a.dateObject);
    var outPut = "No items";
    if (dates.length > 0) {
        outPut = FormatDate(dates[dates.length - 1].dateObject) + " to " + FormatDate(dates[0].dateObject);
    }
    var dateStartRangeElem = document.getElementById('start-date');
    dateStartRangeElem.value = FormatDatePicker(dates[dates.length - 1].dateObject);

    var dateEndRangeElem = document.getElementById('end-date');
    dateEndRangeElem.value = FormatDatePicker(dates[0].dateObject);
}

function UpdateTableTitle(node) {
    var titleSpan = document.getElementById('title-name');

    if (node === null || node === undefined) {
        node = overviewNode;
    }
    titleSpan.innerText = node.Name;
    //Need some way to get all the children then make sure they are included in the items
}

function AddDataToMobilePanel(item) {
    var itemOwner = nodes.filter(x => x.Id == item.owner);
    if (itemOwner.length == 0) {
        return;
    }
    var mainHolderDiv = document.getElementById("panel-holder-div");
    var mainPanelDiv = document.createElement("div");
    mainPanelDiv.classList.add("panel");
    mainPanelDiv.classList.add("panel-default");
    var panelHeaderDiv = document.createElement("div");
    panelHeaderDiv.classList.add("panel-heading");
    panelHeaderDiv.classList.add("text-center");
    var panelHeaderText = document.createElement("h3");
    panelHeaderText.classList.add("zero-top-margin");
    panelHeaderText.setAttribute("id", "panel-title");
    panelHeaderText.innerText = item.title;
    panelHeaderDiv.appendChild(panelHeaderText);
    mainPanelDiv.appendChild(panelHeaderDiv);
    //put the rest here
    var panelBodyDiv = document.createElement("div");
    panelBodyDiv.classList.add("panel-body");
    panelBodyDiv.appendChild(CreatePanelHolderDiv("Owner:", itemOwner[0].Name));
    panelBodyDiv.appendChild(CreatePanelHolderDiv("Date:", item.date));

    var statusToUse;
    if (item.status === null || item.status === undefined) {
        statusToUse = "Resolved"
    }
    else {
        statusToUse = item.status;
    }

    panelBodyDiv.appendChild(CreatePanelHolderDiv("Status:", statusToUse));
    panelBodyDiv.appendChild(CreatePanelHolderDiv("Employee:", item.emp));

    var buttonDiv = document.createElement("div");
    buttonDiv.classList.add("text-center");

    var button = document.createElement("a");   
    var buttonHtml = '';
    if (item.open) {
        buttonHtml = '<a href="item.html?Id=' + item.id + '" class="btn btn-primary btn-lg more-more-margin-top">Open item</a>';
    }
    else {
        buttonHtml = '<a class="btn btn-primary btn-lg disabled more-more-margin-top">Open item</a>';
        panelHeaderText.setAttribute("id", "panel-title");
    }
    button.innerHTML = buttonHtml;
    buttonDiv.appendChild(button);
    panelBodyDiv.appendChild(buttonDiv);
    mainPanelDiv.appendChild(panelBodyDiv);
    mainHolderDiv.appendChild(mainPanelDiv);

}

function CreatePanelHolderDiv(textTitle, textValue) {
    var panelHolderDiv = document.createElement("div");
    panelHolderDiv.classList.add("pannel-info-holder");

    var labelSpan = document.createElement("span");
    labelSpan.classList.add("my-panel-label");
    labelSpan.innerText = textTitle;

    var valueSpan = document.createElement("span");
    valueSpan.classList.add("panel-content");
    valueSpan.innerText = textValue;

    panelHolderDiv.appendChild(labelSpan);
    panelHolderDiv.appendChild(valueSpan);
    return panelHolderDiv;
}

function UpdateTableHeaders(){
    var tabeleHeader = document.getElementsByClassName('toggle-table');
    for (let index = 0; index < tabeleHeader.length; index++) {

        if(viewFullTable){
            tabeleHeader[index].classList.remove('hide-on-load');
            tabeleHeader[index].classList.add('table-cell-display');            
        }else{
            tabeleHeader[index].classList.remove('table-cell-display');
            tabeleHeader[index].classList.add('hide-on-load');
        }                
    }    
    var descriptionHeader = document.getElementById('wide-header');
    if(viewFullTable){
        descriptionHeader.classList.add('col-md-3');
    }else{
        descriptionHeader.classList.remove('col-md-3');
    }    
}

function AddDataToRowToTable(item) {
    var itemOwner = nodes.filter(x => x.Id == item.owner);
    var owner;
    if (itemOwner.length == 0) {

        if(levelD){
            itemOwner = overviewNode;
            owner = "Laurie Gumble"
        }else{
            return;
        }
      
    }else{
        owner = itemOwner[0].Name;
    }
    //This array is cleared and updated in AddDateToTable  method
    itemsOnScreen.push(item);
   
    var tBodyElem = document.getElementById("table-data");
    //If you want to add more. Make it an Array!
    var row = document.createElement("tr");
    var cell1 = document.createElement("td");
    var cell2 = document.createElement("td");
    var cell3 = document.createElement("td");
    var cell4 = document.createElement("td");
    var cell5 = document.createElement("td");
    var cell6 = document.createElement("td");
    var cell7 = document.createElement("td");

    var discriptionCell = document.createElement("td");
    var creatorCell = document.createElement("td");

    var textDescrip;
    if(item.description === null || item.description === undefined){
        textDescrip = document.createTextNode('');
    }
    else{
        textDescrip = document.createTextNode(item.description);
    }


    var textCreator;
    if(item.inputer=== null || item.inputer === undefined){
        textCreator = document.createTextNode('');
    }
    else{
        textCreator = document.createTextNode(item.inputer);
    }
    
    var textnode1 = document.createTextNode(owner);
    var textnode2 = document.createTextNode(item.title);
    var textnode3 = document.createTextNode(item.date);
    var textnode4;
    if (item.status === null || item.status === undefined) {
        textnode4 = document.createTextNode("Resolved");
    }
    else {
        textnode4 = document.createTextNode(item.status);
    }
    var textnode6 = document.createTextNode(item.emp);
    var textnode7 = document.createTextNode(GetItemType(item.itemType, item));
    var buttonHtml = '';
    if (item.open) {
        buttonHtml = '<a href="item.html?Id=' + item.id + '" class="btn btn-primary">Open item</a>';
    }
    else {
        buttonHtml = '<a class="btn btn-primary disabled">Open item</a>';
    }
    var textnode5 = buttonHtml;
    cell1.appendChild(textnode1);
    cell7.appendChild(textnode7);
    cell4.appendChild(textnode4);
    cell2.appendChild(textnode2);
    cell3.appendChild(textnode3);

    cell5.innerHTML = textnode5;
    cell6.appendChild(textnode6);
    discriptionCell.appendChild(textDescrip);
    if(viewFullTable){
        discriptionCell.classList.remove('hide-on-load');
        discriptionCell.classList.add('table-cell-display');
        discriptionCell.classList.add('col-md-3');
        creatorCell.classList.remove('hide-on-load');
        creatorCell.classList.add('table-cell-display');
    }else{
        discriptionCell.classList.remove('table-cell-display');
        discriptionCell.classList.remove('col-md-3');
        discriptionCell.classList.add('hide-on-load');
        creatorCell.classList.remove('table-cell-display');
        creatorCell.classList.add('hide-on-load');
    }
   
    creatorCell.appendChild(textCreator);
    row.appendChild(cell1);
    row.appendChild(cell7);
    row.appendChild(cell4);
    row.appendChild(cell2);
    row.appendChild(discriptionCell);
    row.appendChild(cell3);


    row.appendChild(cell6);
    row.appendChild(creatorCell);
    row.appendChild(cell5);
 

    // var tabeleHeader = document.getElementsByClassName('toggle-table');

    // console.log(tabeleHeader);
    // for (let index = 0; index < tabeleHeader.length; index++) {

    //     if(viewFullTable){
    //         tabeleHeader[index].classList.remove('hide-on-load');
    //         tabeleHeader[index].classList.add('table-cell-display');            
    //     }else{
    //         tabeleHeader[index].classList.remove('table-cell-display');
    //         tabeleHeader[index].classList.add('hide-on-load');
    //     }                
    // }

    // var descriptionHeader = document.getElementById('wide-header');
    // if(viewFullTable){
    //     descriptionHeader.classList.add('col-md-3');
    // }else{
    //     descriptionHeader.classList.remove('col-md-3');
    // }


    //tBodyElem.appendChild(row);
    $('#myTable').dataTable().fnAddData(row);
}

function GetItemType(itemTypeId, item){    
    var type = itemTypes.find(x => x.itemTypeId === itemTypeId);    
    if(type === undefined){
        //THIS  IS A BUG. LOOK INTO THIS MORE!!!!!
        console.log('Id ' + itemTypeId);
        console.log('Item ' + item.title);
        return "Policy";
    }

    return type.itemType;
}

function AddDataToitemsRecords(items) {
    var startingCount = 11;
    for (let i = 0; i < items.length; i++) {
        var randomNumer = Math.floor(Math.random() * startingCount);       
        var today = new Date();
        today.setDate(today.getDate() + randomNumer + 21);
        var date = FormatDate(today);
        items[i].date = date;
        items[i].dateObject = today;
    }
}

function FormatDate(date) {
    return date.getMonth() + '-' + date.getDate() + '-' + date.getFullYear().toString().substr(-2);
}

function FormatDatePicker(date) {

    if(date.getMonth() < 10){
        return date.getFullYear().toString()  + '-0' +  date.getMonth() + '-' + date.getDate();
    }

    return date.getFullYear().toString()  + '-' +  date.getMonth() + '-' + date.getDate();
}

//Button clicks
var fullTableButton = document.getElementById('open-item');
fullTableButton.addEventListener('click', function (event) {
    ToggleFullTable();   
});

function ToggleFullTable()
{
    var canvasDiv = document.getElementById('parent');
    var tableDiv = document.getElementById('table-holder');
    if(!viewFullTable){
        canvasDiv.style.display = 'none';
        tableDiv.classList.remove('col-md-8');
        tableDiv.classList.add('col-md-12');
        viewFullTable = true;
    }
    else{
        tableDiv.classList.remove('col-md-12');
        tableDiv.classList.add('col-md-8');
        canvasDiv.style.display = 'block';
        viewFullTable = false;
    }   
    UpdateTableRows();
}

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
    var tempitemsHolder = [];
    var tBodyElem = document.getElementById("table-data");
    tBodyElem.innerHTML = '';
    for (let index = 0; index < nodes.length; index++) {
        var itemsPerUser = originalitems.filter(x => x.owner == nodes[index].Id);
        if (itemsPerUser.length > 0) {
            for (let i = 0; i < itemsPerUser.length; i++) {
                tempitemsHolder.push(itemsPerUser[i]);
            }
        }
    }

    if(levelD){        
        tempitemsHolder = LevelDItems;
    }
 
    if(showOnlyFeaturedLeader){        
        items = tempitemsHolder.filter(x => x.owner == overviewNode.Id);
    }
    else if(policyClicked){
        items = tempitemsHolder.filter(x => x.itemType == 3);
    }  
    else if(issuesClicked){
        items = tempitemsHolder.filter(x => x.itemType == 1);
    }  
    else if(resolvedClicked){
        items = tempitemsHolder.filter(x => x.status === 'Resolved');
    }
    else if(unresolvedClicked){
        items = tempitemsHolder.filter(x => x.status !== 'Resolved');
    }
    else if(leaderClicked){
        items = tempitemsHolder.filter(x => x.itemType == 4);
    }
    else if(associateClicked){
        items = tempitemsHolder.filter(x => x.itemType == 5);
    }
    else if(praiseClicked){
        items = tempitemsHolder.filter(x => x.itemType == 2);
    }
    else{
        items = tempitemsHolder;
    }
    
    AddDataToTable(items);
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
    LoadProgressBars();
}
//Recursion
function GetChild(element, level) {
    element.level = level;
    tempNewNodes.push(element);
    UpdateItemCount(element);
    level++;
    var children = nodes.filter(x => x.parent == element.Id);
    if (children.length === 0) {
        return;
    }
    for (let i = 0; i < children.length; i++) {

        GetChild(children[i], level);
    }
}

function UpdateItemCount(element){
        var newCount = {
        Id : element.Id,
        Resolved : 0,
        Unresolved : 0,       
        Total : 0,
        ParentId : element.parent
    }
    itemsPerPerson.push(newCount);
}

function SetDefaultLayout() {
    var singleNodeBuffer = (canvas.width - nodes[0].width) / 2;
    var doubleNodeBuffer = (canvas.width - (nodes[0].width * 2)) / 3;

    var superSmallScreen = (canvas.width < 380)

    
    var nodeWidth = nodes[0].width;
    
    for (let i = 0; i < nodes.length; i++) {
        //Right now this will work, but if it gets big figure this out
        if (nodes[i].level === 1) {
            nodes[i].top = 30;           
            nodes[i].left = singleNodeBuffer;    
            topForLegend = 125;       
        }

        if (nodes[i].level === 2) {
            nodes[i].top = 140;
            topForLegend = 235;  
        }

        if (nodes[i].level === 3) {
            nodes[i].top = 250;
            topForLegend = 355;    
        }

        if (nodes[i].level === 4) {
            nodes[i].top = 360;   
            topForLegend = 465;       
        }
    }
    //Honestly this kind of sucks, but works for the prototype
    for (let i = 1; i < 5; i++) {
        var levelNodes = nodes.filter(x => x.level == i);
        if (levelNodes.length == 2 && ((levelNodes[0].parent != levelNodes[1].parent) || i == 2)) {
            if(superSmallScreen){
                AdjustWidth(levelNodes[0].Id, doubleNodeBuffer - 0);
                AdjustWidth(levelNodes[1].Id, (doubleNodeBuffer * 2) + nodeWidth);
            }else{
                AdjustWidth(levelNodes[0].Id, doubleNodeBuffer);
                AdjustWidth(levelNodes[1].Id, (doubleNodeBuffer * 2) + nodeWidth);
            }
            
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
elem.addEventListener('click', function (event) {
    event.preventDefault();
    // console.log("Here the numbers for the click");
    // console.log("x offset = " + offsetX);
    // console.log("y offset = " + offsetY);
    // console.log("event x ="  + event.clientX);
    // console.log("event y ="  + event.clientY);
    canvasOffset = canvas.getBoundingClientRect();   
    x = parseInt(event.clientX - offsetX);
    y = parseInt(event.clientY - canvasOffset.top);
    var looking = true;
    // console.log("x = " + x);
    // console.log("y = " + y);
    nodes.forEach(function (element) {
        //console.log(element);
        if (y > element.top && y < element.top + element.height && x > element.left && x < element.left + element.width && looking) {
            looking = false;
            // console.log("element that is hit");
            // console.log(element);
            UpdateNodesOnZoom(element);
        }
    });
}, false);

window.addEventListener('resize', function (event) {
    //console.log("windows resize");
    if(window.innerWidth > 768 && window.innerWidth < 992){
        console.log(window.innerWidth);
    }
  
    HandleResize(event);
});

function HandleResize(event){
    if(levelD){
        return;
    }
    //event.preventDefault();
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight; 
    //console.log(parent.offsetHeight);
     canvasOffset = canvas.getBoundingClientRect();   
    // console.log(canvasOffset.top);
    // offsetX = canvasOffset.left + window.scrollX;
     offsetY = canvasOffset.top + window.scrollY;
    // console.log(offsetY);
    SetDefaultLayout();
    draw(false);
}

//Mouse is down do this tuff
// elem.addEventListener('mousedown', function (event) {
//     mouseDown = true;
//     handleMouseDown(event);
// });

// elem.addEventListener('touchstart', function (event) {
//     mouseDown = true;
//     handleMouseDown(event);
// });

// elem.addEventListener('mousemove', function (event) {
//     if (mouseDown) {
//         handleMouseMove(event);
//     }
// });

// elem.addEventListener('touchmove', function (event) {
//     if (mouseDown) {
//         handleMouseMove(event);
//     }
// });

// elem.addEventListener('mouseup', function (event) {
//     mouseDown = false;
//     event.preventDefault();
//     selectedItem = null;
//     selectedIndex = -1;
// });

// elem.addEventListener('touchend', function (event) {
//     mouseDown = false;
//     event.preventDefault();
//     selectedItem = null;
//     selectedIndex = -1;
// });

// elem.addEventListener('mouseout', function (event) {
//     mouseDown = false;
//     event.preventDefault();
//     selectedItem = null;
//     selectedIndex = -1;
// });

// the last mousemove event and move the selected text
// by that distance
//function handleMouseMove(e) {
//     if (selectedItem === null) {
//         console.log('oh no, its null');
//         return;
//     }
//     e.preventDefault();
//     mouseX = parseInt(e.clientX - offsetX);
//     mouseY = parseInt(e.clientY - offsetY);

//     // Put your mousemove stuff here
//     var dx = mouseX - startX;
//     var dy = mouseY - startY;
//     startX = mouseX;
//     startY = mouseY;
//     var rectangle = selectedItem
//     rectangle.left += dx;
//     rectangle.top += dy;
//     nodes[selectedIndex] = rectangle;
//     draw(false);
// }

// //When the most is pushed down, figure out if it hit element
// function handleMouseDown(e) {
//     e.preventDefault();
//     startX = parseInt(e.clientX - offsetX);
//     startY = parseInt(e.clientY - offsetY);
//     // Put your mousedown stuff here  
//     for (i = 0; i < nodes.length; i++) {
//         if (textHittest(startX, startY, nodes[i])) {
//             selectedItem = nodes[i];
//             selectedIndex = i;
//             return
//         }
//     }
// }

var previousButton = document.getElementById('previous-view');
previousButton.addEventListener('click', function (event) {
    PreviousButton(); 
});


function PreviousButton(){
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
    LoadProgressBars();
}
var homeButton = document.getElementById('home-view');
homeButton.addEventListener('click', function(event){
HomeButton();
});

function GetItems(id)
{
    return itemsPerPerson.find(x => x.Id === id);
}

function HomeButton(){
    nodes = originalViewNodes
    SetHomepageDetails();
    tempNewNodes = [];
    GetChild(nodes[0], 1);
    nodes = tempNewNodes;
    SetDefaultLayout();
    UpdateTableRows();
    draw(false);
    LoadProgressBars();
}

///The DRAWING METHOD!!!
function draw() {

    var supersSmallScreen = (canvas.width < 380);

    var singleNodeBuffer = (canvas.width - nodes[0].width) / 2;
    var doubleNodeBuffer = (canvas.width - (nodes[0].width * 2)) / 3;
    var nodeWidth = nodes[0].width;

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
    if(supersSmallScreen){
        c.font = "13px Segoe UI";
    }else{
        c.font = "14px Segoe UI";
    }
    
    //Green Circle
    c.arc(270, topForLegend, 12, 0, Math.PI * 2, false);
    c.strokeStyle = black;
    c.fillStyle = greenCircle;
    c.fill();
    c.stroke();
    c.beginPath();

    //Red Circle
    c.arc(115, topForLegend, 12, 0, Math.PI * 2, false);
    c.strokeStyle = black;
    c.fillStyle = redCircle;
    c.fill();
    c.stroke();
    c.beginPath();
    c.fillStyle = black;
    c.fillText("Resolved items", 290, topForLegend + 4)
    c.fillText("Unresolved items", 135, topForLegend + 4)
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
        var superSmallScreen = (canvas.width < 380);
        var rightBufffer = (canvas.width - (doubleNodeBuffer + nodeWidth))   
           

        if (nodes[i].Id === 6) {
                  
            var buffer = 75;

            if(canvas.width < 600){
                buffer = 40;
            }

            if(canvas.width > 800){
                buffer = 150;
            }

            var leftBuffer = rightBufffer - nodeWidth - buffer;
            if(superSmallScreen){
                leftBuffer = doubleNodeBuffer - 0;
            }
          
            nodes[i].left = leftBuffer;
        }
        if (nodes[i].Id === 7) {
            var rightBufffer = (canvas.width - (doubleNodeBuffer + nodeWidth))
            nodes[i].left = rightBufffer;
        }

        if(nodes.length === 1){
            nodes[i].left = singleNodeBuffer;
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
        c.beginPath();     
        c.moveTo(nodes[i].x, nodes[i].y);
        var parent = nodes.find(o => o.Id === nodes[i].parent);
        c.lineTo(parent.x, parent.y);
        var localItems = GetItems(nodes[i].Id);       
        if(localItems.Unresolved > localItems.Resolved){
            c.strokeStyle = 'red';
        }else{
            c.strokeStyle = 'black';
        }      
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
        if(i === 0){
            c.fillStyle = white;
            c.fill();
        }else{
                var localItems = GetItems(nodes[i].Id);   
                var resolved = localItems.Resolved;
                var unresolved = localItems.Unresolved;
                if(resolved > unresolved){
                    c.fillStyle = "#76FC9D";
                   
                }
                if(unresolved === resolved){
                    c.fillStyle = "yellow";
                  
                }
                if(unresolved > resolved){
                    c.fillStyle = "#FFFF99";
                   
                }
                if(unresolved > (resolved * 2)){
                    c.fillStyle = "#F08080";
                }
                c.fill();
        }
       
       
        //Commented this out and it looks good, not sure why
        //c.fillStyle = black;
        //c.stroke();

        //Draw the red circle  otherwise known as items
        //c.moveTo(tempRectangle.x -40, tempRectangle.y + 10);
        c.beginPath();
        c.arc(tempRectangle.x -8, tempRectangle.y + 15, 12, 0, Math.PI * 2, false);
        c.strokeStyle = black;
        c.fillStyle = redCircle;
        c.fill();
        c.stroke();
        c.beginPath();
        c.fillStyle = black;
        var itemCount = itemsPerPerson.find(x => x.Id === tempRectangle.Id);
        var itemsText = new String(itemCount.Unresolved);
        var itemResolvedY = tempRectangle.y + 20;
        if (itemsText.length == 2) {
            c.fillText(itemsText, tempRectangle.x - 18, itemResolvedY)
        }
        if (itemsText.length == 1) {
            c.fillText(itemsText, tempRectangle.x -13, itemResolvedY)
        }
        c.beginPath();

        //Draw the green circle otherwise known as resolved
        //c.moveTo(tempRectangle.x -10, tempRectangle.y + 10);
        c.beginPath();
        c.arc(tempRectangle.x  + 19 , tempRectangle.y + 15, 12, 0, Math.PI * 2, false);
        c.strokeStyle = black;
        c.fillStyle = greenCircle;
        c.fill();
        c.stroke();
        c.beginPath();

        //Draw the number
        c.fillStyle = black;
        var resolvedText = new String(itemCount.Resolved);
        if (resolvedText.length == 2) {
            c.fillText(resolvedText, tempRectangle.x + 11, itemResolvedY)
        }
        if (resolvedText.length == 1) {
            c.fillText(resolvedText, tempRectangle.x + 15, itemResolvedY)
        }
        c.beginPath();
        c.fillStyle = 'black';
        c.fillText(nodes[i].Name, nodes[i].x - 16, nodes[i].y - 16);
        c.fillText(nodes[i].Title, nodes[i].x - 16, nodes[i].y - 0);
        c.beginPath();                   
    }   
    var parent = document.getElementById("image-span");
    parent.innerHTML = '';
    for (i = 0; i < nodes.length; i++) {
        //Draw the image
        //var imageFilePath = "https://chrismcclure.github.io/assets/" + nodes[i].image;
        var imageFilePath = "assets/" + nodes[i].image;
        var image = new Image();
        var htmlImage = document.createElement("img");
        htmlImage.setAttribute("src", imageFilePath);
        htmlImage.style = "position:absolute; left: " + (nodes[i].left + 20) + "px; top:" + (nodes[i].top + 4) + "px; height: 60px; width: 60px; border: 1px solid black;";
        parent.appendChild(htmlImage);
        image.src = imageFilePath;
        images.push(image);
    }  
}

//Progress bar stuff:
function LoadProgressBars() {
    //any numbers of variables here
    var duration = 500;
    var strokeWidth = 10;
    var itemstoUse;
    
    if(showOnlyFeaturedLeader){
        itemstoUse = itemsOnScreen.filter(x => x.owner == overviewNode.Id);
    }
    else if(policyClicked){
        itemstoUse = itemsOnScreen.filter(x => x.itemType == 3);    
    }
    else if(issuesClicked){
        itemstoUse = itemsOnScreen.filter(x => x.itemType == 1);
    }
    else if(resolvedClicked){
        itemstoUse = itemsOnScreen.filter(x => x.status === 'Resolved');
    }
    else if(unresolvedClicked){
        itemstoUse = itemsOnScreen.filter(x => x.status !== 'Resolved');
    }
    else if(leaderClicked){
        itemstoUse = itemsOnScreen.filter(x => x.itemType == 4);
    }
    else if(associateClicked){
        itemstoUse = itemsOnScreen.filter(x => x.itemType == 5);
    }
    else if(praiseClicked){
        itemstoUse = itemsOnScreen.filter(x => x.itemType == 2);
    }
    else{
        itemstoUse = itemsOnScreen;
    }     


    var total = 0;
    var resolved = [];
    var unresolved = [];
    var assocaite = [];
    var leader = [];
    var policy = [];
    var praise = [];
    var issues = [];
    if(itemstoUse === null || itemstoUse === undefined){
        itemstoUse = [];
    }else{
         total = itemstoUse.length;    
         resolved = itemstoUse.filter(x => x.status === 'Resolved');
         unresolved = itemstoUse.filter(x => x.status !== 'Resolved');
         assocaite = itemstoUse.filter(x => x.itemType === 5);
         leader = itemstoUse.filter(x => x.itemType === 4);
         policy = itemstoUse.filter(x => x.itemType === 3);
         praise = itemstoUse.filter(x => x.itemType === 2);
         issues = itemstoUse.filter(x => x.itemType === 1);
    }

    createCircle('Resolved', Divide(resolved,total), greenCircle);
    createCircle('Unresolved', Divide(unresolved,total), redCircle);
    createCircle('Issues', Divide(issues,total), '#FC9D76');
    createCircle('Policies', Divide(policy, total), '#9D76FC');   
    createCircle('Praise', Divide(praise, total), '#4974A5');  
    createCircle('Leader', Divide(leader, total), '#FFFF00');  
    createCircle('Associate', Divide(assocaite, total), '#FF00FF');  

    var element = document.getElementById('TotalItems');
    element.innerHTML = '';

    //Total Circle
    var circleTotalItems = new ProgressBar.Circle('#TotalItems', {
        color: '#31B0D5',
        duration: duration,
        easing: 'easeInOut',
        strokeWidth: strokeWidth,
    });
    circleTotalItems.setText(total);
    circleTotalItems.text.style.color = black;
    circleTotalItems.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
    circleTotalItems.text.style.fontSize = '5rem';    
    circleTotalItems.animate(0);            
}

policyElement = document.getElementById('Policies');
policyElement.addEventListener('click', function () {
    var policyLabel = document.getElementById('policies-label');
    var clicked = policyClicked;
    ClearAllClicked();   
    if(!clicked){
        policyClicked = true;
        policyLabel.style.fontWeight = 'bold';
        policyLabel.style.fontSize = '20px';
       
    }
    UpdateTableRows();
    LoadProgressBars();
});

issuesElement = document.getElementById('Issues');
issuesElement.addEventListener('click', function () {
    var label = document.getElementById('issues-label');
    var clicked = issuesClicked;
    ClearAllClicked();
    if(!clicked){      
        issuesClicked = true;
        label.style.fontWeight = 'bold';
        label.style.fontSize = '20px';
    }
    UpdateTableRows();
    LoadProgressBars();
});

resolvedElement = document.getElementById('Resolved');
resolvedElement.addEventListener('click', function () {
    var label = document.getElementById('resolved-label');
    var clicked = resolvedClicked;
    ClearAllClicked();
    if(!clicked){      
        resolvedClicked = true;
        label.style.fontWeight = 'bold';
        label.style.fontSize = '20px';
    }
    UpdateTableRows();
    LoadProgressBars();
});

unresolvedElement = document.getElementById('Unresolved');
unresolvedElement.addEventListener('click', function () {
    var label = document.getElementById('unresolved-label');
    var clicked = unresolvedClicked;
    ClearAllClicked();
    if(!clicked){      
        unresolvedClicked = true;
        label.style.fontWeight = 'bold';
        label.style.fontSize = '20px';
    }
    UpdateTableRows();
    LoadProgressBars();
});

praiseElement = document.getElementById('Praise');
praiseElement.addEventListener('click', function () {
    var label = document.getElementById('praise-label');
    var clicked = praiseClicked;
    ClearAllClicked();
    if(!clicked){      
        praiseClicked = true;
        label.style.fontWeight = 'bold';
        label.style.fontSize = '20px';
    }
    UpdateTableRows();
    LoadProgressBars();
});

leaderElement = document.getElementById('Leader');
leaderElement.addEventListener('click', function () {
    var label = document.getElementById('leader-label');
    var clicked = leaderClicked;
    ClearAllClicked();
    if(!clicked){      
        leaderClicked = true;
        label.style.fontWeight = 'bold';
        label.style.fontSize = '20px';
    }
    UpdateTableRows();
    LoadProgressBars();
});

associateElement = document.getElementById('Associate');
associateElement.addEventListener('click', function () {
    var label = document.getElementById('associate-label');
    var clicked = associateClicked;
    ClearAllClicked();
    if(!clicked){      
        associateClicked = true;
        label.style.fontWeight = 'bold';
        label.style.fontSize = '20px';
    }
    UpdateTableRows();
    LoadProgressBars();
});

function ClearAllClicked(){
    issuesClicked = false;
    policyClicked = false;
    resolvedClicked = false;
    unresolvedClicked = false;
    praiseClicked = false;
    leaderClicked = false;
    associateClicked = false;
    var labels = [];
    labels.push(document.getElementById('policies-label'));
    labels.push(document.getElementById('issues-label'));
    labels.push(document.getElementById('resolved-label'));
    labels.push(document.getElementById('unresolved-label'));
    labels.push(document.getElementById('praise-label'));
    labels.push(document.getElementById('leader-label'));
    labels.push(document.getElementById('associate-label'));
    for (let i = 0; i < labels.length; i++) {
        labels[i].style.fontWeight = 'normal';
        labels[i].style.fontSize = '20px';        
    }
}

function createCircle(id, percent, color) {
    var element = document.getElementById(id);
    element.innerHTML = '';

    var duration = 500;
    var strokeWidth = 10;

    var circlePolicy = new ProgressBar.Circle('#' + id, {
        color: color,
        duration: duration,
        easing: 'easeInOut',
        strokeWidth: strokeWidth,
    });
    circlePolicy.setText(FormatPercent(percent));
    circlePolicy.text.style.color = black;
    circlePolicy.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
    circlePolicy.text.style.fontSize = '3rem';
    circlePolicy.animate(percent);
}

function FormatPercent(rawNumber){
   return Math.round(rawNumber * 100) + '%';    
}

function Divide(lowNumber, total){

if(total === 0){
    return 0;
}

    return lowNumber.length / total;
}