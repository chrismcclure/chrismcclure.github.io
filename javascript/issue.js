var issues = [];
var nodes = [];
var issuesHistory = [];
var csvFilePath = 'files/default.csv';
var issueFile1 = 'files/issue1.csv';
var issueFile4 = 'files/Issue4.csv';
var maxIdKey = 'MaxId';
var selectedIssue;
var openDate;

///Parse the files
//Papa.parse(csvFilePath +"?_="+ (new Date).getTime(), {
Papa.parse(csvFilePath, {
    header: true,
    download: true,
    dynamicTyping: true,
    complete: function (results) {        
    nodes = results.data;               
            loadIssues();       
            getIssue();
            setThePage();
    }
});

function loadIssues(){
   var maxId = GetCurrentMaxId();
   for (let index = 1; index <= maxId; index++) {
       var issue = JSON.parse(localStorage.getItem(index));
        issues.push(issue);
   }
}

function GetCurrentMaxId(){
    var maxId = localStorage.getItem(maxIdKey);
    if (maxId === 'null' || maxId === null || maxId === 'NaN'){
        return maxId;
    }
    return parseInt(maxId);
}

function getIssue(){
    var url = window.location.search;
    var query = url.split('=');
    var idToGet = (query[query.length -1]);
    selectedIssue = issues.find(o => o.id == idToGet);  
}

function setThePage(){
    if(selectedIssue === null || selectedIssue === undefined){
        console.log('Selected issue null or undefined')
        return
    }

    console.log(selectedIssue);
    var title = document.getElementById('Issue-Name');
    title.innerText = selectedIssue.title;

    var description = document.getElementById('issue-description')
    description.innerText = selectedIssue.description;

    if(selectedIssue.id === 4){
        Papa.parse(issueFile4 +"?_="+ (new Date).getTime(), {
            header: true,
            download: true,
            dynamicTyping: true,
            complete: function (results) {        
            issuesHistory = results.data;               
                FillInHistory(issuesHistory);
                var creatorSpan = document.getElementById('creator');
                creatorSpan.innerText =  selectedIssue.inputer+  " - " + openDate;
                var ownerSpan = document.getElementById('leader');
                console.log(nodes);
                overviewNode = nodes.find(o => o.Id == selectedIssue.owner);
                console.log(overviewNode);
                ownerSpan.innerHTML = overviewNode.Name;
                var statusSelect = document.getElementById('status');
                statusSelect.selectedIndex = 3;
            }
        });
    }

    if(selectedIssue.id === 1){
        console.log('issues 1');
        Papa.parse(issueFile1 +"?_="+ (new Date).getTime(), {
            header: true,
            download: true,
            dynamicTyping: true,
            complete: function (results) {        
            issuesHistory = results.data;               
                FillInHistory(issuesHistory);
                var creatorSpan = document.getElementById('creator');
                creatorSpan.innerText =  selectedIssue.inputer+  " - " + openDate;
                var ownerSpan = document.getElementById('leader');
                console.log(nodes);
                overviewNode = nodes.find(o => o.Id == selectedIssue.owner);
                console.log(overviewNode);
                ownerSpan.innerHTML = overviewNode.Name;
                var statusSelect = document.getElementById('status');
                statusSelect.selectedIndex = 2;
            }
        });
    }
}

function FillInHistory(history){
    var mainDiv = document.getElementById('history');
    var dateIncreaser = 28;

    for (let i = history.length - 1; i >= 0; i--) {     
        var holderDiv = document.createElement("div");
        holderDiv.classList.add("history-element")

        var pargraph = document.createElement("p");
        pargraph.classList.add("history-paragraph");
        pargraph.innerHTML = history[i].text;
      

        var today = new Date();
        today.setDate(today.getDate() + (i + dateIncreaser));
        var date = FormatDate(today);
        if(i === 0){        
            openDate = date;
        }
        var pargraph2 = document.createElement("p");
        
        pargraph2.innerHTML = '<strong>Updated by:</strong> ' + history[i].person + " " + date;
        holderDiv.appendChild(pargraph);
        holderDiv.appendChild(pargraph2);
        mainDiv.appendChild(holderDiv);
    }
}


function FormatDate(date) {
    return date.getMonth() + '-' + date.getDate() + '-' + date.getFullYear().toString().substr(-2);  
}