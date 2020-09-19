var itemTypes = [];
var itemsTypesFile = 'files/itemType.csv';
var employees = [];
var employeesFile = 'files/employees.csv';

window.onload = function () {
    Papa.parse(itemsTypesFile + "?_=" + (new Date).getTime(), {
        header: true,
        download: true,
        dynamicTyping: true,
        complete: function (results) {
            itemTypes = results.data;
            Papa.parse(employeesFile + "?_=" + (new Date).getTime(), {
                header: true,
                download: true,
                dynamicTyping: true,
                complete: function (results) {
                    employees = results.data;
                    MakeListOfEmployees();
                }
            });
        }
    });
}

//deal with radio buttons
var generalRadio = document.getElementById('general');
var issueRadio = document.getElementById('issue');
var policyRadio = document.getElementById('policy');
var praiseRadio = document.getElementById('praise');


generalRadio.addEventListener('click', function(){
    console.log('general report checked');
}, false);

issueRadio.addEventListener('click', function(){
    console.log('issue  checked');
}, false);


policyRadio.addEventListener('click', function(){
    console.log('policy checked');
}, false);


function MakeListOfEmployees(){
    var list = document.getElementById('employees-to-tag');
    var htmlInner = '';
    list.innerHTML = htmlInner;

    for (let index = 0; index < employees.length; index++) {
        var option = '<option>' + employees[index].Name + '</option>';
        htmlInner += option;        
    }
    list.innerHTML = htmlInner;
}