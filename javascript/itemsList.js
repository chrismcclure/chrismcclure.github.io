var items= [];
var originalitems= [];
var csvFilePath = 'files/default.csv';
var itemsFile = 'files/items.csv';
var itemsTypesFile = 'files/itemType.csv';
var originalViewNodes = [];
var nodes = [];
var tempNewNodes = [];
var overviewNode = {};
var maxIdKey = 'MaxId';
var maxIdFromFileKey = 'MaxIdFromFile';
var UserLevelD = false;
var itemTypes = [];

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
            if(UserLevelD){
                tempNewNodes.push(overviewNode);
                nodes = tempNewNodes;
                loadItems();
            }
            else{
                     
                GetChild(overviewNode, 1);           
                nodes = tempNewNodes;
                loadItems();
            }            
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
        
        if(idToGet === '100'){
            UserLevelD = true;
            overviewNode = {
                id : 100,
                Name : 'Jim Wiggum',
                itemOwner :' Laurie Gumble',
                image : "Jim.PNG"
            };
        }
        else{
            overviewNode = nodes.find(o => o.Id == idToGet);                 
          
        }       
        UpdateTableTitle(overviewNode);
        SetImage();
}

function SetImage(){
    var image = document.getElementById('image');
    image.src = "assets/" + overviewNode.image;
}

function loadItems() {
    Papa.parse(itemsTypesFile + "?_=" + (new Date).getTime(), {
        header: true,
        download: true,
        dynamicTyping: true,
        complete: function (results) {
            itemTypes = results.data;
            Papa.parse(itemsFile + "?_=" + (new Date).getTime(), {
                header: true,
                download: true,
                dynamicTyping: true,
                complete: function (results) {
                    items = results.data;
                    originalitems = results.data;
                    PullFromLocalStorage();
                    AddDataToItemssRecords(items);
                    AddDataToTable(items);
                    PopulateNumbers(items);
                }
            });
        }
    });
}

function PopulateNumbers(){
    console.log(itemsOnScreen);
    var resolved = itemsOnScreen.filter(x => x.status === null);
    var unresolved = itemsOnScreen.filter(x => x.status !== null);

    var resolvedElement = document.getElementById('resolved');
    resolvedElement.textContent = resolved.length;

    var unresolvedElement = document.getElementById('unresolved');
    unresolvedElement.textContent = unresolved.length;
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
            var item = JSON.parse(localStorage.getItem(index)); 
            var itemtoAdd = {};
            itemtoAdd.id = item.id;
            itemtoAdd.title = item.title;
            itemtoAdd.owner = item.owner;
            itemtoAdd.emp = item.emp;
            itemtoAdd.description = item.description;
            items.push(itemtoAdd);    
            console.log('add item ' + itemtoAdd.title);        
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

function AddDataToTable(items){
    itemsOnScreen = [];    
    for (let i = 0; i < items.length; i++) {
      AddDataToRowToTable(items[i]);        
    }
    //Update the date range
    var dates = itemsOnScreen.sort((a, b) => b.dateObject - a.dateObject);  
    var outPut = "No items";
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
    //Need some way to get all the children then make sure they are included in the items
}

function AddDataToRowToTable(item) {    
    var itemOwner;
    if(UserLevelD){      
        itemOwner   = nodes.filter(x => x.Name === item.emp); 
    }else{       
        itemOwner  = nodes.filter(x => x.Id == item.owner); 
    }
    
    
    if(itemOwner.length == 0){
        return;
    }
    //This array is cleared and updated in AddDateToTable  method
    itemsOnScreen.push(item);
    var owner;
    if(UserLevelD){
        owner = itemOwner[0].itemOwner;  
    }else{
        owner = itemOwner[0].Name;  
    }   
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
    var cellType = document.createElement("td");

    var textOwner = document.createTextNode(owner);
    var textTitle = document.createTextNode(item.title);
    var textDate = document.createTextNode(item.date);
    var textEmploy = document.createTextNode(item.emp);
    var textType = document.createTextNode(GetItemType(item.itemType));
    var textButton;
    if(item.open){
        textButton = '<a href="item.html?Id='+item.id+'"  class="btn btn-primary" role="button">Open Item</a>';
    }
    else{
        textButton = '<a href="item.html?Id='+item.id+'"  class="btn btn-primary disabled" role="button">Open Item</a>';
    }
    
    var textDescrip;
    if(item.description === null || item.description === undefined){
        textDescrip = document.createTextNode('');
    }
    else{
        textDescrip = document.createTextNode(item.description);
    }

    var textStatus;
    if(item.status=== null || item.status === undefined){
        textStatus = document.createTextNode('Resolved');
    }
    else{
        textStatus = document.createTextNode(item.status);
    }

    var textCreator;
    if(item.inputer=== null || item.inputer === undefined){
        textCreator = document.createTextNode('');
    }
    else{
        textCreator = document.createTextNode(item.inputer);
    }
 
    cellOwner.appendChild(textOwner);
    cellTitle.appendChild(textTitle);
    cellDescrip.appendChild(textDescrip);
    cellDate.appendChild(textDate);
    cellEmploy.appendChild(textEmploy);
    cellStatus.appendChild(textStatus);
    cellCreator.appendChild(textCreator);
    cellType.appendChild(textType);
    cellButton.innerHTML = textButton;
    row.appendChild(cellOwner);
    row.appendChild(cellType);
    row.appendChild(cellTitle);
    row.appendChild(cellStatus);
    row.appendChild(cellDescrip);
    row.appendChild(cellDate);
    row.appendChild(cellEmploy);
    row.appendChild(cellCreator);
    row.appendChild(cellButton);
    tBodyElem.appendChild(row); 
}

function GetItemType(itemTypeId){
    var type = itemTypes.find(x => x.itemTypeId === itemTypeId);    
    return type.itemType;
}

function AddDataToItemssRecords(items){
   var startingCount = 30;
    for (let i = 0; i < items.length; i++) {

        var alterDate = startingCount + i;
        if(i > 7){
            startingCount = startingCount - i;
        }
        var today = new Date();    
        today.setDate(today.getDate() + alterDate);
        var date = FormatDate(today);
        items[i].date = date;    
        items[i].dateObject = today;    
    }   
}

function FormatDate(date){
    return date.getMonth() + '-' + date.getDate() + '-' + date.getFullYear().toString().substr(-2);  
}