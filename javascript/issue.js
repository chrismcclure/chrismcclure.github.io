var issues = [];
var nodes = [];
var issuesHistory = [];
var csvFilePath = 'files/default.csv';
var issueDetailsFile = 'files/Issue-1.csv';
var issuesFile = 'files/issues.csv';
var selectedIssue;
var issueIdFromUrl;
var openDate;
var overviewNode;

///Parse the files
Papa.parse(csvFilePath + "?_=" + (new Date).getTime(), {
    header: true,
    download: true,
    dynamicTyping: true,
    complete: function (results) {
        nodes = results.data;
        getIssue();
        Papa.parse(issueDetailsFile  + "?_=" + (new Date).getTime(), {
            header: true,
            download: true,
            dynamicTyping: true,
            complete: function (results) {
                issuesHistory = results.data;                
                loadIssues();                            
            }
        });
    }
});

function loadIssues() {
    Papa.parse(issuesFile  + "?_=" + (new Date).getTime(), {
        header: true,
        download: true,
        dynamicTyping: true,
        complete: function (results1) {
            issues = results1.data;                 
            selectedIssue = issues.find(o => o.id == issueIdFromUrl); 
            overviewNode = nodes.find(x => x.Id == selectedIssue.owner);
            setThePage();         
        }
    });   
}

function getIssue(){
    var url = window.location.search;
    var query = url.split('=');
    issueIdFromUrl = (query[query.length -1]);   
}

function setThePage() {
    if (selectedIssue === null || selectedIssue === undefined) {
        console.log('Selected issue null or undefined')
        return
    }

    var title = document.getElementById('Issue-Name');
    title.innerText = selectedIssue.title;
    var description = document.getElementById('issue-description')
    description.innerText = selectedIssue.description; 
    var screenIssues = issuesHistory.filter(x => x.issueId == issueIdFromUrl);
    FillInHistory(screenIssues);
    var creatorSpan = document.getElementById('creator');
    creatorSpan.innerText = selectedIssue.inputer + " - " + openDate;
    var ownerSpan = document.getElementById('leader');
    overviewNode = nodes.find(o => o.Id == selectedIssue.owner);
    var employeeSpan = document.getElementById('employee');
    console.log(selectedIssue);
    employeeSpan.innerText = selectedIssue.emp;
    ownerSpan.innerHTML = overviewNode.Name;
    SetDropDown(screenIssues[screenIssues.length - 1]);
}

function SetDropDown(issueItem){
    var statusSelect = document.getElementById('status');

    if(issueItem.status ==='New'){
        statusSelect.selectedIndex = 0;
    }
    if(issueItem.status ==='In-Progress'){
        statusSelect.selectedIndex = 1;
    }
    if(issueItem.status ==='Waiting for Response'){
        statusSelect.selectedIndex = 2;
    }
    if(issueItem.status ==='Waiting for Resolution'){
        statusSelect.selectedIndex = 3;
    }
    if(issueItem.status ==='Resolved'){
        statusSelect.selectedIndex = 4;
    }
    //THERE shouldn't be a removed
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