document.addEventListener('DOMContentLoaded', function(event){   
    var beginbutton = document.getElementById("BeginButton");
    beginbutton.addEventListener('click', function (event) {
       OpenCorrectPage();
    });
}, false);

function OpenCorrectPage(){
    var levelA = document.getElementById("LevelA");
    var levelB = document.getElementById("LevelB");
    var levelC = document.getElementById("LevelC");
    var levelD = document.getElementById("LevelD");
    
    if(levelA.checked){
        console.log("level A checked");
        window.open("index.html", "_top");
    }
    if(levelB.checked){
        console.log("level B checked");
        window.open("index.html?level=B", "_top");
    }
    if(levelC.checked){
        console.log("level C checked");
        window.open("index.html?level=C", "_top");
    }
    if(levelD.checked){
        console.log("level D checked")
        window.open("index.html?level=D", "_top");
    }
}