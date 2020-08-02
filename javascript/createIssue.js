var maxIdKey = 'MaxId';
var maxIdFromFileKey = 'MaxIdFromFile';
var employees = ['Alan Burns', 'Devon Carlson', 'Trista Bouvier'];
var directReportKey = 'directReports';
var canCreateIssue;

window.onload = function(){
    DefaultSettings();
}

var submitButton = document.getElementById('create-issue-button');

submitButton.addEventListener('click', function () {
    var createdIssue = {};
    canCreateIssue = true;
    createdIssue.owner = 1;
    createdIssue.type = GetRadioValueByName('issueType');
    createdIssue.title = GetValueById('issue-title');
    createdIssue.description = GetValueById('issue-description');
    createdIssue.emp = GetValueById('employee-list');
    createdIssue.visibility = GetRadioValueByName('visible');
    createdIssue.leaders = GetCheckBoxValueByName('leader');
    createdIssue.open = false;
    if(canCreateIssue){
        SaveToLocalStorage(createdIssue);
        window.open("index.html", "_top");
    }
});

function SaveToLocalStorage(createdIssue){
    var maxId = GetCurrentMaxId();
    var newMax = maxId + 1;
    createdIssue.id = newMax;
    console.log(createdIssue);
    localStorage.setItem(newMax, JSON.stringify(createdIssue));
    localStorage.removeItem(maxIdKey);
    localStorage.setItem(maxIdKey, newMax);
}

function GetCurrentMaxId() {
    var maxId = localStorage.getItem(maxIdKey);
    if (maxId === 'null' || maxId === null || maxId === 'NaN') {
        var maxFileId = localStorage.getItem(maxIdFromFileKey);
        if (maxFileId === 'null' || maxFileId === null) {
            return maxId;
        }
        return parseInt(maxFileId);
    }
    return parseInt(maxId);
}

function GetCheckBoxValueByName(name) {
    var leaders = [];
    var checkboxes = document.getElementsByName(name);
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            leaders.push(checkboxes[i].value);
        }
    }

    if (leaders.length === 0) {
        canCreateIssue = false;
        alert.log('Some leader must be selected!');
    }
    return leaders;
}

function GetValueById(id) {
    return document.getElementById(id).value;
}

function GetRadioValueByName(name) {
    var type = document.getElementsByName(name);
    for (let i = 0; i < type.length; i++) {
        if (type[i].checked)
            return type[i].value;
    }
}

//deal with radio buttons
var directReport = document.getElementById('direct-report');
var selfIssue = document.getElementById('self');
var checkboxes = document.getElementsByClassName('checkbox-holder');
var list = document.getElementById('employees');
var employeeCheckbox = document.getElementById('employee');
var leaerCheckbox = document.getElementById('leader');

function DefaultSettings(){
    ToggleLeaderCheckboxes("none");
    ToggleListOfEmployees('block');
    MakeListOfDirectReports();
}

directReport.addEventListener('click', function(){
    console.log('direct report checked');
  DefaultSettings();
}, false);

employeeCheckbox.addEventListener('click', function(){
    console.log('employeeCheckbox  checked');
    ToggleLeaderCheckboxes("none");
    ToggleListOfEmployees('block');
    MakeListOfEmployees();
}, false);


leaerCheckbox.addEventListener('click', function(){
    console.log('leaerCheckbox  checked');
    ToggleLeaderCheckboxes("block");
    ToggleListOfEmployees('none');
}, false);

selfIssue.addEventListener('click', function(){
    console.log('self checked');
    ToggleLeaderCheckboxes("block");
    ToggleListOfEmployees("none");
}, false);

function ToggleListOfEmployees(displayType){
    var listDiv = document.getElementById("list-holder");
    listDiv.style.display = displayType;
}

//functions for managing what is showing and what isn't based on the issue type
function ToggleLeaderCheckboxes(display){
    for (let index = 0; index < checkboxes.length; index++) {
        checkboxes[index].style.display = display;
    }
}

function MakeListOfDirectReports(){
    var reports = JSON.parse(localStorage.getItem(directReportKey));
    var htmlInner = '';
    for (let index = 0; index < reports.length; index++) {
        var option = '<option>' + reports[index].Name + '</option>';
        htmlInner += option;      
    }
    list.innerHTML = htmlInner;
}

function MakeListOfEmployees(){
    var htmlInner = '';
    for (let index = 0; index < employees.length; index++) {
        var option = '<option>' + employees[index] + '</option>';
        htmlInner += option;        
    }
    list.innerHTML = htmlInner;
};