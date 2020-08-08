var issues = [];
var originalIssues = [];
var csvFilePath = 'files/default.csv';
var issuesFile = 'files/issues.csv';
var originalViewNodes = [];
var nodes = [];
var tempNewNodes = [];
var overviewNode;
var maxIdKey = 'MaxId';
var maxIdFromFileKey = 'MaxIdFromFile';

// $(document).ready( function () {
//     $('#myTable').DataTable();
// } );

///Parse the files
Papa.parse(csvFilePath +"?_="+ (new Date).getTime(), {
    header: true,
    download: true,
    dynamicTyping: true,
    complete: function (results) {        
    nodes = results.data;        
        if(nodes.length > 0){
        
            for (i = 0; i < nodes.length; i++) {
                nodes[i].width = 160;
                nodes[i].height = 70;
            }          
            SetHomepageDetails();
            tempNewNodes = [];          
            GetChild(overviewNode, 1);           
            nodes = tempNewNodes;
            loadIssues();
        }
        originalViewNodes = nodes; 
    }
});

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

function SetHomepageDetails(){  
        var url = window.location.search;
        var query = url.split('=');
        var idToGet = (query[query.length -1]);
        overviewNode = nodes.find(o => o.Id == idToGet);                 
        UpdateTableTitle(overviewNode);
}

function loadIssues(){
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
        }
    });
}

function PullFromLocalStorage(){
    var maxId = GetCurrentMaxId();
    var maxFileId = GetCurrentMaxFileId();
    console.log('Max id = ' + maxId + '. File Id = ' + maxFileId);
    if(maxId > maxFileId){
        console.log('Max id = ' + maxId + '. File Id = ' + maxFileId);
        console.log('there is something in local storage!');
        for (let index = maxFileId + 1; index < maxId + 1; index++) {
            console.log(index);
            var issue = JSON.parse(localStorage.getItem(index));
            console.log(issue);
            var issuestoAdd = {};
            issuestoAdd.id = issue.id;
            issuestoAdd.title = issue.title;
            issuestoAdd.owner = issue.owner;
            issuestoAdd.emp = issue.emp;
            issuestoAdd.description = issue.description;
            issues.push(issuestoAdd);    
            console.log('add issued ' + issuestoAdd.title);        
        }
    }
    else{
        console.log('nothing cool in here :(');
    }
}

function GetCurrentMaxId(){
    var maxId = localStorage.getItem(maxIdKey);
    console.log("maxid from storage =" +maxId);
    if (maxId === 'null' || maxId === null || maxId === 'NaN'){
        return maxId;
    }
    return parseInt(maxId);
}

function GetCurrentMaxFileId(){
    var maxId = localStorage.getItem(maxIdFromFileKey);
    console.log('this  max file id is straight from the storage = '+ maxId);
    if (maxId === 'null' || maxId === null){
        return maxId;
    }
    return parseInt(maxId);
}

function AddDataToTable(issues){
    issuesOnScreen = [];    
    for (let i = 0; i < issues.length; i++) {
      AddDataToRowToTable(issues[i]);        
    }
    //Update the date range
    var dates = issuesOnScreen.sort((a, b) => b.dateObject - a.dateObject);  
    var outPut = "No issues";
    if(dates.length > 0 ) {
        outPut = FormatDate(dates[dates.length - 1].dateObject) + " to " + FormatDate(dates[0].dateObject);
    } 
    var dateRangeElem = document.getElementById('date-range');
    dateRangeElem.innerHTML = outPut;
    $('#myTable').DataTable();
}

function UpdateTableTitle(node){
    var titleSpan = document.getElementById('title-name');
    titleSpan.innerText = node.Name;
    //Need some way to get all the children then make sure they are included in the issues
}

function AddDataToRowToTable(issue) {    
    var issueOwner = nodes.filter(x => x.Id == issue.owner); 
    if(issueOwner.length == 0){
        return;
    }
    //This array is cleared and updated in AddDateToTable  method
    issuesOnScreen.push(issue);
    var owner = issueOwner[0].Name;    
    var tBodyElem = document.getElementById("table-data");
    //If you want to add more. Make it an Array!
    var row = document.createElement("tr");
    var cellOwner = document.createElement("td");
    var cellTitle = document.createElement("td");
    var cellDescrip = document.createElement("td");
    var cellDate = document.createElement("td");
    var cellEmploy = document.createElement("td");
    var cellButton = document.createElement("td");
    var cellStatus = document.createElement("td");
    var cellCreator = document.createElement("td");

    var textOwner = document.createTextNode(owner);
    var textTitle = document.createTextNode(issue.title);
    var textDate = document.createTextNode(issue.date);
    var textEmploy = document.createTextNode(issue.emp);
    var textButton;
    if(issue.open){
        textButton = '<a href="issue.html?Id='+issue.id+'"  class="btn btn-primary" role="button">Open Issue</a>';
    }
    else{
        textButton = '<a href="issue.html?Id='+issue.id+'"  class="btn btn-primary disabled" role="button">Open Issue</a>';
    }
    
    var textDescrip;
    if(issue.description === null || issue.description === undefined){
        textDescrip = document.createTextNode('');
    }
    else{
        textDescrip = document.createTextNode(issue.description);
    }

    var textStatus;
    if(issue.status=== null || issue.status === undefined){
        textStatus = document.createTextNode('Resolved');
    }
    else{
        textStatus = document.createTextNode(issue.status);
    }

    var textCreator;
    if(issue.inputer=== null || issue.inputer === undefined){
        textCreator = document.createTextNode('');
    }
    else{
        textCreator = document.createTextNode(issue.inputer);
    }
 
    cellOwner.appendChild(textOwner);
    cellTitle.appendChild(textTitle);
    cellDescrip.appendChild(textDescrip);
    cellDate.appendChild(textDate);
    cellEmploy.appendChild(textEmploy);
    cellStatus.appendChild(textStatus);
    cellCreator.appendChild(textCreator);
    cellButton.innerHTML = textButton;
    row.appendChild(cellOwner);
    row.appendChild(cellTitle);
    row.appendChild(cellStatus);
    row.appendChild(cellDescrip);
    row.appendChild(cellDate);
    row.appendChild(cellEmploy);
    row.appendChild(cellCreator);
    row.appendChild(cellButton);
    tBodyElem.appendChild(row); 
}

function AddDataToIssuesRecords(issues){
   var startingCount = 30;
    for (let i = 0; i < issues.length; i++) {

        var alterDate = startingCount + i;
        if(i > 7){
            startingCount = startingCount - i;
        }
        var today = new Date();    
        today.setDate(today.getDate() + alterDate);
        var date = FormatDate(today);
        issues[i].date = date;    
        issues[i].dateObject = today;    
    }   
}

function FormatDate(date){
    return date.getMonth() + '-' + date.getDate() + '-' + date.getFullYear().toString().substr(-2);  
}