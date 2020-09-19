var items= [];
var nodes = [];
var itemsHsitory = [];
var csvFilePath = 'files/default.csv';
var itemsDetailsFile = 'files/items-1.csv';
var itemsFile = 'files/items.csv';
var selectedItem;
var itemIdFromUrl;
var openDate;
var overviewNode;
var itemTypes = [];
var itemsTypesFile = 'files/itemType.csv';

///Parse the files
Papa.parse(csvFilePath + "?_=" + (new Date).getTime(), {
    header: true,
    download: true,
    dynamicTyping: true,
    complete: function (results) {
        nodes = results.data;
        getItems();
        Papa.parse(itemsDetailsFile  + "?_=" + (new Date).getTime(), {
            header: true,
            download: true,
            dynamicTyping: true,
            complete: function (results) {
                itemsHsitory = results.data;                   
                Papa.parse(itemsTypesFile + "?_=" + (new Date).getTime(), {
                    header: true,
                    download: true,
                    dynamicTyping: true,
                    complete: function (results) {
                        itemTypes = results.data;                            
                        loadItems();
                    }
                });                                 
            }
        });
    }
});

function loadItems() {
    Papa.parse(itemsFile  + "?_=" + (new Date).getTime(), {
        header: true,
        download: true,
        dynamicTyping: true,
        complete: function (results1) {
            items= results1.data;                 
            selectedItem = items.find(o => o.id == itemIdFromUrl);         
            overviewNode = nodes.find(x => x.Id == selectedItem.owner);
            setThePage();         
        }
    });   
}

function getItems(){
    var url = window.location.search;
    var query = url.split('=');
    itemIdFromUrl = (query[query.length -1]);   
}

function setThePage() {
    if (selectedItem === null || selectedItem === undefined) {
        console.log('Selected item null or undefined')
        return
    }

    var title = document.getElementById('Item-Name');
    title.innerText = selectedItem.title;
    var description = document.getElementById('item-description')
    description.innerText = selectedItem.description; 
    var screenItems = itemsHsitory.filter(x => x.itemId == itemIdFromUrl);
    FillInHistory(screenItems);
    var creatorSpan = document.getElementById('creator');
    creatorSpan.innerText = selectedItem.inputer + " - " + openDate;
    var ownerSpan = document.getElementById('leader');
    overviewNode = nodes.find(o => o.Id == selectedItem.owner);
    var employeeSpan = document.getElementById('employee'); 
    employeeSpan.innerText = selectedItem.emp; 
    ownerSpan.innerHTML = overviewNode.Name;
    var typeSpan = document.getElementById('type');
    typeSpan.innerHTML = GetItemType(selectedItem.itemType);
    SetDropDown(screenItems[screenItems.length - 1]);
}

function SetDropDown(item){
    var statusSelect = document.getElementById('status');

    if(item.status ==='New'){
        statusSelect.selectedIndex = 0;
    }
    if(item.status ==='In-Progress'){
        statusSelect.selectedIndex = 1;
    }
    if(item.status ==='Waiting for Response'){
        statusSelect.selectedIndex = 2;
    }
    if(item.status ==='Waiting for Resolution'){
        statusSelect.selectedIndex = 3;
    }
    if(item.status ==='Resolved'){
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

function GetItemType(itemTypeId){
    var type = itemTypes.find(x => x.itemTypeId === itemTypeId);    
    return type.itemType;
}