var issues = [];
var originalIssues = [];
var issuesFile = 'issues.csv';
var csvFilePath = 'default.csv';
var originalViewNodes = [];
var nodes = [];
var tempNewNodes = [];
var overviewNode;

///Parse the files
Papa.parse(csvFilePath, {
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
        console.log(url);
        var query = url.split('=');
        var idToGet = (query[query.length -1]);
        console.log(idToGet);
        overviewNode = nodes.find(o => o.Id == idToGet);                 
        UpdateTableTitle(overviewNode);
}

function loadIssues(){
    Papa.parse(issuesFile, {
        header: true,
        download: true,
        dynamicTyping: true,
        complete: function (results) {
        issues = results.data; 
        console.log(issues);
        originalIssues = results.data;         
        AddDataToIssuesRecords(issues);    
        AddDataToTable(issues);
        }
    });
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
    var cell1 = document.createElement("td");
    var cell2 = document.createElement("td");
    var cell3 = document.createElement("td");
    var cell4 = document.createElement("td");
    var cell5 = document.createElement("td");
    var textnode1 = document.createTextNode(owner);
    var textnode2 = document.createTextNode(issue.title);
    var textnode3 = document.createTextNode(issue.date);
    var textnode4 = document.createTextNode(issue.emp);
    var textnode5 = '<button class="btn btn-success">Open Issue</button';
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
  return  date.getMonth()+'-'+date.getDate()  +'-'+ date.getFullYear();
}