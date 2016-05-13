/**
 * Created by wk on 4/14/16.
 */
//CODELIST_EU=["Austria","Belgium","Bulgaria","Croatia","Cyprus","CzechRepublic","Denmark","Estonia","Finland","France","Germany","Greece","Hungary","Ireland","Italy","Latvia","Lithuania","Luxembourg","Malta","Netherlands","Poland","Portugal","Romania","Slovakia","Slovenia","Spain","Sweden","UnitedKingdom"];
//CODELIST_EU_ABBV=[ "BE","EL","LT","PT","BG","ES","LU","RO","CZ","FR","HU","SI","DK","HR","MT","SK","DE","IT","NL","FI","EE","CY","AT","SE","IE","LV","PL","UK"];

var parser = require("xml2json");

CODELIST_MAPPING=[["Objective","Function"],["Fund","funds"],]


function createOtherTable(lstDic,index){

    //console.log(lstDic);


    var body = document.getElementsByTagName('body')[0];
    var div = document.createElement("div");
    div.id = "temp_table";
    body.appendChild(div);
    var table = document.createElement("table");
    table.id="tocx"+(index);
    table.border=1;
    var tblBody = document.createElement("tbody");
    var linebreak = document.createElement("br");



    var tablename="";
    for(var i = 0; i < lstDic.node.length; i++){
        //tablename+=;
        var title = lstDic.node[i].title;
        var p = document.createElement("p");
        //p.value = title
        //p.text = title;
        p.innerText=title;
        //console.log(p);
        body.appendChild(p);
        //body.appendChild(linebreak);
    }

   // var title = document.createTextNode(tablename);
    //console.log(title.innerHTML);
    //console.log(title);
    //body.appendChild(title);
    var row = document.createElement("tr");
    var cell = document.createElement("td");
    //cell.appendChild(document.createTextNode(""))
    cell.appendChild(document.createTextNode(""));
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.appendChild(document.createTextNode(""))
    row.appendChild(cell);

    cell = document.createElement("td");
    cell.appendChild(document.createTextNode("@budget:2014"))
    row.appendChild(cell);

    cell = document.createElement("td");
    cell.appendChild(document.createTextNode("@budget:2013"))
    row.appendChild(cell);

    cell = document.createElement("td");
    cell.appendChild(document.createTextNode("@outturn:2012"))
    row.appendChild(cell);

    row.class='clickable-row';
    //row.id= "row_"+index+"_"+ i;
    tblBody.appendChild(row);


    //create data part
    //display sample data
    for (var i=0; i<lstDic.data.length; i++) { //allTextLines.length

        var row = document.createElement("tr");
        row.class='clickable-row';
        row.id= "row_"+index+"_"+ i;
        //row.appendChild(document.createElement("a").setAttribute("href","#"));

        var dic = lstDic.data[i];
        var cell = document.createElement("td");
        cell.style.backgroundColor= "#95B9C7";
        cell.appendChild(document.createTextNode(i.toString()));
        row.appendChild(cell);

        //add data column
        for (var j = 0; j<4 ; j++) {


            var cell = document.createElement("td");
            console.log(dic.data.data[0]);
            var values = extractData(dic.data.data[0]);

            if(j==0){
                cell.appendChild(document.createTextNode(dic.title));
            }else {
                cell.appendChild(document.createTextNode(values[j-1]));
            }


            //set color
            if(j==0){
                cell.style.backgroundColor= "#95B9C7";
                cell.id = "key_"+ (index)+"_"+ (i);
                cell.setAttribute("name","columnName");
            } else{

                //cell.style.backgroundColor= "#79BAEC";
            }

            row.appendChild(cell);

        }

        var mappingCell = document.createElement("td");
        mappingCell.id="mapping_"+i.toString();
        mappingCell.name="mappingCell";
        mappingCell.style.display = "none";
        mappingCell.style.backgroundColor= "#95B9C7";
        mappingCell.appendChild(document.createTextNode("mapping"));
        row.appendChild(mappingCell);

        var deleteCell = document.createElement("td");
        deleteCell.id="delete_"+i.toString();
        deleteCell.name="deleteButton";
        deleteCell.style.display = "none";
        var delteButton = document.createElement("input");
        delteButton.id="deleteButton_"+i.toString();
        delteButton.type="button";
        delteButton.value="delete";
        delteButton.style.width="100%";
        delteButton.setAttribute("onclick","deleteMapping(this)");

        deleteCell.appendChild(delteButton);
        row.appendChild(deleteCell);

        tblBody.appendChild(row);

        test();
    }

    table.appendChild(tblBody);
    body.appendChild(table)
    ////console.log(document.getElementById("toc1").innerHTML );
}

function test(){

    //var content = "";
    //content = exec("node example.js");
    //console.log(content);
    //var parser = require('xml2json');

    var xml = "<foo attr=\"value\">bar</foo>";
    console.log("input -> %s", xml)
    var json = parser.toJson(xml);
    console.log("to json -> %s", json);

}

exports.test = test;
