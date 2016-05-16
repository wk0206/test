/**
 * Created by wk on 3/29/16.
 */
//=======Global Variables==========
raw_filename = "";
raw_file = "";

RDFGraph = {};
DSD = [];
CodeList = [];
DataTTL = [];

MAX_STRING_LENGTH = 20;
qbtypesDb = ['Dimension', 'Attribute', 'Value'];
prefixesDb = ['http://obeu', 'http://rdfs']

//=======page1==========

function fileEnter(files){

    handleFiles(files);

    setTitle(files);
}

function handleFiles(files) {

    raw_file=files;

    // Check for the various File API support.
    if (window.FileReader) {
        // FileReader are supported.
        raw_filename=files[0].name;
    } else {
        alert('FileReader are not supported in this browser.');
    }
}

function setTitle(files){

    document.getElementById("datasetTitle").value=raw_filename;
}



function startProcessing(){
    $(".loader").fadeOut("slow");
}

function endProcessing(){
    document.getElementById("page_processing").style.display = "none";
}


function splitData(input, delimiterMark){

    //---SPLIT DATA START-----
    if(delimiterMark==','){
        input = replaceInsideComma(input);
        input = input.replace(/;/g,"REPLACE_MARK");

    }else {
        input = input.replace(/,/g,"REPLACE_MARK");

    }

    var data = input.split(delimiterMark);

    if(delimiterMark==','){
        for (var i = 0 ; i < data.length ; i++){
            data[i] = data[i].replace(/REPLACE_MARK/g,';');
            data[i] = data[i].replace(/INSIDE_COMMA_MARK/g,',');
        }
    }else {
        for (var j = 0 ; j < data.length ; j++){

            data[j] = data[j].replace(/REPLACE_MARK/g,',');
        }
    }

    return data;
    //---SPLIT DATA END-----
}

function initialMapping( input ){

    return false;

    if(input=="MS"){
        return "administrativeClassification";

    }

    if(input == "Fund"){
        return "fund";

    }

    if(input == "TO"){
        return "functionalClassification";

    }

    if(input == "EU Amount"){
        return "amountEU";

    }

    if(input == "National Amount"){
        return "amountNational";

    }

    if(input == "Total Amount"){
        return "amountTotal";

    }

    return false;

}
//deal with leaf/data
function processXMLdata(input){
    //return object
    var obj = [];
    //var tempdata =input;

    var data = input.match(/<bud-data.*\/bud-data>/g);
    var remark = input.match(/<bud-remarks.*\/bud-remarks>/g);
    ////console.log(data[0]);
    //////console.log(remark);

    var tempdata = extractData(data[0]);
    ////console.log(tempdata);
    obj["data"] = tempdata;
    obj["remark"] = remark;
    /*
    if(tempdata.indexOf("<p>")>0){
        ele["title"]=tempdata.substring(tempdata.indexOf("<p>")+3,tempdata.indexOf("</p>"));
    } else if(tempdata.indexOf("<p lang=")>0){
        ele["title"]=tempdata.substring(tempdata.indexOf("<p lang=")+13,tempdata.indexOf("</p>"));
    }
    */

    return obj;
}

function buildXMLColumn(inputJson){


}

function buildPage1(inputJson){
    console.log(inputJson);
    //////console.log(inputJson);
    var fileDisplayArea = document.getElementById('fileDisplayArea');
    var body = document.getElementsByTagName('body')[0];

    var table = document.getElementById("toc0");
    var tblBody = document.createElement("tbody");

    //var allTextLines = csv.split(/\r\n|\n/);

    JSON_ctrl=[];

    //temp node
    var currentNode=[];
    //temp data
    var currentData=[];
    //final node and data
    var nodeAndData=[];

    //element of final
    var ele={};


    currentNode.push(inputJson[0]);
    var idn = 0;
    var indString="";
    //////console.log("This is the begining-------------");
    //////console.log("root add to current node -------------");
    //////console.log(inputJson[0].title);
    //loop every element of input Json , build columen and their data
    for (var i=1; i<inputJson.length; i++) {

        //last will be data
        if(i == inputJson.length-1){
            currentData.push(inputJson[i]);
            ele["data"]=currentData;
            currentData=[];
            nodeAndData.push(ele);
            ele={};


            idn++;
            indString="";
            for(var ii = 0 ;ii<idn;ii++){
                indString+=indentation;
            }
    //        ////console.log(indString+"this is a data cube");
    //        ////console.log("This is the end-------------");
        }
        /*

        ////console.log(inputJson[i]);
        ////console.log("current type "+(inputJson[i].type));
        ////console.log("check1 "+(inputJson[i-1].type=="node" && inputJson[i].type=="node"));
        ////console.log("check2 "+(inputJson[i-1].type=="leaf" && inputJson[i].type=="node"));
        ////console.log("check3 "+(inputJson[i].type=="leaf"  && inputJson[i+1].type=="leaf"));
        ////console.log("check4 "+(inputJson[i].type=="leaf"  && inputJson[i+1].type=="node"));

        */


        //check
        //1.NODE
        //previous one is node, current is node, next one is node
        //previous one is node, current is node, next one is data
        if(inputJson[i-1].type=="node" && inputJson[i].type=="node"){
            currentNode.push(inputJson[i]);

            idn++;
            indString="";
            for(var ii = 0 ;ii<idn;ii++){
                indString+=indentation;
            }
            ////console.log(indString+inputJson[i].title);
            if(inputJson[i+1].type=="leaf"){

                var tempNode=[];
                for (var k = 0 ; k < currentNode.length;k++){
                    //////console.log("-------------------------");
                    //////console.log(currentNode[k].title);
                    //////console.log("-------------------------");
                    tempNode.push(currentNode[k]);
                    //console.log(currentNode[k].title+"-------------add from current node");
                }
                ele["node"]=tempNode;
            }
        }
        //previous one is data, current is node, next one is node
        //previous one is data, current is node, next one is data
        if(inputJson[i-1].type=="leaf" && inputJson[i].type=="node") {
            //////console.log("before anything");
            //////console.log(currentNode);
            //console.log("current identity is "+(inputJson[i].identity));

            //specical treatment
            //remove tree node

            var length = inputJson[i].identity.length;

            for(var j = currentNode.length-1; j>=0 ;j--){
                //////console.log("compare identity is "+(currentNode[j].identity));
                //////console.log("compare identity deleted from currentNode");
                if(currentNode[j].identity.length>=length){
                    //currentNode.pop();
                    //currentNode.length=length-1;
                    idn--;
                    indString="";
                    for(var ii = 0 ;ii<idn;ii++){
                        indString+=indentation;
                    }
                    //console.log(currentNode[j].title+"-------------deleted from current node");
                    currentNode.splice(-1,1);

                    //////console.log("after deleted");
                    //////console.log(currentNode);
                }
            }
            //add current one
/*
            ////console.log("current nod is ");
            ////console.log(inputJson[i]);
            ////console.log(currentNode[0]);
            ////console.log(currentNode[1]);
            ////console.log(currentNode[2]);
*/

            idn++;
            indString="";
            for(var ii = 0 ;ii<idn;ii++){
                indString+=indentation;
            }

            currentNode.push(inputJson[i]);
            //console.log(indString+inputJson[i].title);
//            ////console.log("after added");
            ////console.log(currentNode);
            ////console.log(inputJson[i+1]);
            if(inputJson[i+1].type=="leaf"){

                var tempNode=[];
                for (var k = 0 ; k < currentNode.length;k++){
                    //////console.log("-------------------------");
                    //////console.log(currentNode[k].title);
                    //////console.log("-------------------------");
                    tempNode.push(currentNode[k]);
                    //console.log(currentNode[k].title+"-------------add from current node");
                }
                ele["node"]=tempNode;
            }
        }

        //console.log(ele);

        //2.DATA
        //current is data, next one is data
        console.log(i);
        if(i==67){
            console.log(inputJson[i]);
        }
        if(i<inputJson.length-1){
            if(inputJson[i].type=="leaf"  && inputJson[i+1].type=="leaf"){

                indString="";
                for(var ii = 0 ;ii<idn;ii++){
                    indString+=indentation;
                }
                //////console.log(indString+"----this is a data cube");
                currentData.push(inputJson[i]);
            }
            //current is data, next one is node
            if(inputJson[i].type=="leaf"  && inputJson[i+1].type=="node"){
                currentData.push(inputJson[i]);
                ele["data"]=currentData;
                currentData=[];
                nodeAndData.push(ele);
                ele={};


                indString="";
                for(var ii = 0 ;ii<idn;ii++){
                    indString+=indentation;
                }
                //////console.log(indString+"----this is a data cube");
            }
        }

        if(i==inputJson.length-1){
            if(inputJson[i].type=="leaf"){

                indString="";
                for(var ii = 0 ;ii<idn;ii++){
                    indString+=indentation;
                }
                //////console.log(indString+"----this is a data cube");
                currentData.push(inputJson[i]);
            }
        }

    }


    ////console.log(nodeAndData);
    return nodeAndData;

}


function formatJson(input){
    //console.log(input);
    //console.log(input.data[0]);
    var dataAndRemark = input.data;
    var nodeName = input.node;
    var tablename="";

    var res = [];
    var table =[];
    var ele=[];
    for (var i = 0; i < dataAndRemark.length; i ++){
        var data = input.data[i].data.data;
        ////console.log(data);
        //lines.push(data);
        var title = dataAndRemark[i].title;
        res.push(data);
        ele.push(title);;
    }

    lines.push(ele);


    for (var i = 0; i < res[0].length; i ++){
        var str =[];
        for (var j = 0; j < res.length; j ++){
            str.push(res[j][i]);
        }
        lines.push(str);
        table.push(str);
    }


    for(var i = 0; i < nodeName.length; i++){
        tablename+=nodeName[i].title+'<br/>';
    }

    //////console.log(lines);
    //////console.log(table);
    document.getElementById("datasetTitle").value=tablename;
    //////console.log(document.getElementById("datasetTitle"));
    return table;


}
function buildForms(inputJson){


    ////console.log(inputJson);

    for(var i = 0 ; i < inputJson.length; i++){
    //for(var i = 0 ; i < 1; i++){
        var table = document.getElementById("toc0");
        var tblBody = document.createElement("tbody");


        if(i==0){
            var datas = formatJson(inputJson[0]);
        }


        ////console.log(inputJson);
        createOtherTable(inputJson[i],i);
        //////console.log(datas);
        buildJsonCtrl(datas,";");
    }
}

function processXML(xml){

    //////console.log(xml);
    var match = xml.match(/alias=(\"[0-9 ]*\"){1}/g);
    var length = match.length;
    //processData(csv);
    //var res = xml2json(xml,",");
    //////console.log(match);
    //////console.log(match.length);
    //////console.log(match[0]);
    //////console.log(match[1].substring(7,match[1].length-1));

    var strcture = [];
    var data = [];
    var json = [];

    //
    var count =0;

    for(var i = 0; i <length-1; i++){
        strcture.push(match[i].substring(7,match[i].length-1).split(" "));
        ////console.log("from "+match[i]);
        ////console.log("to   "+match[i+1]);
        data.push(xml.substring(xml.indexOf(match[i]),xml.indexOf(match[i+1])));
    }

    //////console.log(match);

    for(var i = 0; i <length-1; i++) {

        ele={};
        ele["id"] = i;
        ele["titlelanguage"]="";
        ele["remarklanguage"]="";
        ele["type"]="";
        ele["title"]="";
        ele["data"]="";
        ele["remark"]="";
        ele["identity"]=strcture[i];



        if(i!=length-2){
            if(strcture[i].length==strcture[i+1].length){
                ele["type"]="leaf";
            }else if(strcture[i].length<strcture[i+1].length){
                ele["type"]="node";
            }else if(strcture[i].length>strcture[i+1].length){
                ele["type"]="leaf";
            }

        }
        if(i==length-2){
            ele["type"]="leaf"
        }

        if(ele["type"]=="node"){
            //ele["language"];
            var language = data[i].match(/lang=\"[a-z]{2}\"/g);
            //////console.log(language);
            if(language!=null){
                if(language.length==1){
                    ele["titlelanguage"]=language[0];
                }else if(language.length==2){
                    ele["titlelanguage"]=language[0];
                    ele["remarklanguage"]=language[1];
                }else {
                    ele["titlelanguage"]="";
                    ele["remarklanguage"]="";
                }

            }


            if(data[i].indexOf("<bud-remarks>")>0){
                var tempdata = data[i].substring(0,data[i].indexOf("<bud-remarks>"));

                if(tempdata.indexOf("<p>")>0){
                    ele["title"]=tempdata.substring(tempdata.indexOf("<p>")+3,tempdata.indexOf("</p>"));
                } else if(tempdata.indexOf("<p lang=")>0){
                    ele["title"]=tempdata.substring(tempdata.indexOf("<p lang=")+13,tempdata.indexOf("</p>"));
                }

                var tempremark = data[i].substring(data[i].indexOf("<bud-remarks>"));
                if(tempdata.indexOf("<p>")>0){
                    ele["remark"]=tempremark.substring(tempremark.indexOf("<p>")+3,tempremark.indexOf("</p>"));
                } else if(tempremark.indexOf("<p lang=")>0){
                    ele["remark"]=tempremark.substring(tempremark.indexOf("<p lang=")+13,tempremark.indexOf("</p>"));
                }
                //ele["remark"]=data[i].substring(data[i].indexOf("<bud-remarks>"));


            }else {
                var tempdata =data[i];
                if(tempdata.indexOf("<p>")>0){
                    ele["title"]=tempdata.substring(tempdata.indexOf("<p>")+3,tempdata.indexOf("</p>"));
                } else if(tempdata.indexOf("<p lang=")>0){
                    ele["title"]=tempdata.substring(tempdata.indexOf("<p lang=")+13,tempdata.indexOf("</p>"));
                }
            }

            count ++;
        }else {

            //deal with leaf/data
            var tempdata =data[i];
            //////console.log(tempdata);
            if(tempdata.indexOf("<bud-heading><p>")>0){
                ele["title"]=tempdata.substring(tempdata.indexOf("<p>")+3,tempdata.indexOf("</p>"));
            } else if(tempdata.indexOf("<bud-heading><p lang=")>0){

                ele["title"]=tempdata.substring(tempdata.indexOf("<p lang=")+13,tempdata.indexOf("</p>"));
            }

            ////console.log(data[i]);
            ele["data"] = processXMLdata(data[i]);
        }

        json.push(ele);
    }
    //////console.log(strcture);
    //////console.log(data);
    //////console.log(json);
    //////console.log("we have "+count+" node");

    var resJson = buildPage1(json);
    ////console.log(json);
    ////console.log(resJson);
    buildForms(resJson);
}

function buildJsonCtrl(datas, delimiterMark){
    ////console.log(datas);
    for (var i=0; i<datas.length-1; i++) {


        //build json
        if(i==0){
            JSON_ctrl["nodeKeyProperty"] = "id";
            var lst = [];
            addOption("");
            for(var x = 0; x < datas[i].length; x++){

                var ele={};
                ele["id"] = x;
                ele["text"]=datas[i][x];
                ele["isAttachment"]=true;
                if(initialMapping(datas[i][x])){
                    ele["mapping"]=initialMapping(datas[i][x]);
                }else {
                    ele["mapping"]=null;
                }
                ele["specific"]=false;
                ele["specificname"]="";
                ele["concept"]="";
                ele["schema"]="";
                ele["useCodelist"]=false;
                ele["codelistName"]=null;
                ele["codelistColumn"]=null;
                ele["codelistCode"]=null;
                ele["codelistLabel"]=null;
                ele["codelistDescription"]=null;
                ele["isOutput"]=false;
                lst.push(ele) ;

                //add option to id="selectColumn"
                addOption(datas[i][x]);

            }
            JSON_ctrl["nodeDataArray"] = lst;
            JSON_ctrl["linkDataArray"] = [];

        }else if(i>2){

            //compare every element with privious one
            for(var y = 0; y < datas[i].length; y++){
                if(!JSON_ctrl["nodeDataArray"][y].isAttachment){
                    continue;
                }else{

                    var compareData = datas[i-1];

                    if(datas[i][y]!=compareData[y]){
                        JSON_ctrl["nodeDataArray"][y].isAttachment=false;
                        ////////console.log("data name :"+JSON_ctrl["nodeDataArray"][y].text+" is set false at "+i);
                    }else{
                        continue;
                    }
                }

            }
        }
    }
}

function processData(csv) {
    var fileDisplayArea = document.getElementById('fileDisplayArea');
    var body = document.getElementsByTagName('body')[0];
    var allTextLines = csv.split(/\r\n|\n/);
    var table = document.getElementById("toc0");
    var tblBody = document.createElement("tbody");
    JSON_ctrl=[];

    //detect delimiter
    var delimiterMark;
    for (var i=0; i<3; i++) {

        var semicolonMark = allTextLines[i].split(';');
        var commaMark = allTextLines[i].split(',');

        if(semicolonMark.length>commaMark.length){
            delimiterMark=';';
        }else {
            delimiterMark=',';
        }
    }



    var datas=[];
    for (var i=0; i<allTextLines.length-1; i++) {
//    for (var i=0; i<5; i++) {
        var row = document.createElement("tr");

        var str = allTextLines[i];

        var data = splitData(str, delimiterMark);
        datas.push(data);

        var tarr = [];

        for (var j = 0; j < data.length; j++) { //data.length
            tarr.push(data[j]);
        }

        if (tarr != "") {
            lines.push(tarr);
        }
    }

    buildJsonCtrl(datas, delimiterMark);


}


function testxml2json(xml){

    ////console.log("in test xml to json");
    // Changes XML to JSON

    // Create the return object
    var obj = {};
    ////console.log(xml.nodeType);
    if (xml.nodeType == 1) { // element

        // do attributes
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3) { // text
        obj = xml.nodeValue;
    }
    // do children
    ////console.log("in 2nd test");
    if (xml.hasChildNodes) {
        for(var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof(obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof(obj[nodeName].length) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;

}

function loadHandler(event) {

    var csv = event.target.result;

    processData(csv);
}

function  xmlLoadHandler(event){

    var xml = event.target.result;

    processXML(xml);
}

function errorHandler(evt) {
    if(evt.target.error.name == "NotReadableError") {
        alert("Canno't read file !");
    }
}

function finishPage1(){
    document.getElementById("page1").style.display = "none";
    document.getElementById("temp_table").style.display = "none";
}

function getAsText(fileToRead) {

    ////console.log(fileToRead);

    if(fileToRead.name.substring(fileToRead.name.length-3)=="csv"){
        ////console.log("csv processing");
        var reader = new FileReader();
        // Read file into memory as UTF-8
        reader.readAsText(fileToRead);

        // Handle errors load
        reader.onload = loadHandler;
        reader.onerror = errorHandler;
    }

    if(fileToRead.name.substring(fileToRead.name.length-3)=="xml"){
        ////console.log("xml processing");
        var reader = new FileReader();
        // Read file into memory as UTF-8
        reader.readAsText(fileToRead);
        ////console.log(reader);

        // Handle errors load
        reader.onload =　xmlLoadHandler;
        reader.onerror = errorHandler;

    }

}



function processFile(inputType){

    //finishPage1();
    getAsText(raw_file[0]);
    //startPage2(inputType);
}


function toPage2(){
    finishPage1();

    var radios = document.getElementsByName("typeChoose");
    var selectedValue = $("input[name='typeChoose']:checked");

    startPage2(selectedValue[0].id);
}

//=======page2==========

function clearAll(){

    //clean table
    var table = document.getElementById("toc1");
    var html = table.innerHTML.replace(/bgcolor="#79BAEC"/g,"");
    table.innerHTML=html;

    //clear mapping cell
    var html = table.innerHTML.replace(/display: block/g,"display: none");
    table.innerHTML=html;

    //pop page 2
    document.getElementById("form").style.display="none";
    document.getElementById("divSpecific").style.display="none";
    document.getElementById("general").checked=false;
    document.getElementById("specific").checked=false;
    document.getElementById("specificName").value=null;
    document.getElementById("selectColumn").options.selectedIndex;

    document.getElementById("codelistMark").checked=false;
    document.getElementById("datasetMark").checked=false;
    document.getElementById("datasetValue").value=null;

    //pop page 3
    document.getElementById("form_codelist").style.display="none";
}

function  mapTextArea(){
    //specical name
    var optionList=document.getElementById("selectColumn").options;

    var columnName = optionList[optionList.selectedIndex].text;

    var specificName = document.getElementById("specificName").value;
    if(specificName!="" && specificName!= null){
        for (var i = 0 ;i < JSON_ctrl["nodeDataArray"].length; i++){
            if(JSON_ctrl["nodeDataArray"][i].text==columnName ){
                JSON_ctrl["nodeDataArray"][i].specificname=specificName;
            }
        }
    }
    //concept
    var conceptName = document.getElementById("concept").value;
    if(conceptName!="" && conceptName!= null){
        for (var i = 0 ;i < JSON_ctrl["nodeDataArray"].length; i++){
            if(JSON_ctrl["nodeDataArray"][i].text==columnName ){
                JSON_ctrl["nodeDataArray"][i].concept=conceptName;
            }
        }
    }
    //schema
    var schemaName = document.getElementById("schema").value;
    if(schemaName!="" && schemaName!= null){
        for (var i = 0 ;i < JSON_ctrl["nodeDataArray"].length; i++){
            if(JSON_ctrl["nodeDataArray"][i].text==columnName ){
                JSON_ctrl["nodeDataArray"][i].schema=schemaName;
            }
        }
    }

}

function inputCheck(){

    if(document.getElementById("codelistMark").checked==true){
        if(document.getElementById("concept").value==""||document.getElementById("concept").value==null){
            alert("please input concept");
            return false;
        }

        if(document.getElementById("schema").value==""||document.getElementById("schema").value==null){
            alert("please input schema");
            return false;
        }

    }

    return true;

}

function multiSubmitClick(){
    mapTextArea();
    if(inputCheck()==true){
        resetTable();
    }
}

function submitClick(){

    mapTextArea();
    if(inputCheck()==true){
        refreshTable();
    }

}

function resetTable(){

    for (var i = 0 ;i < JSON_ctrl["nodeDataArray"].length; i++){
        if(JSON_ctrl["nodeDataArray"][i].mapping!=null ){
            var id = JSON_ctrl["nodeDataArray"][i].id;
            var name = JSON_ctrl["nodeDataArray"][i].text;
            var mapping = JSON_ctrl["nodeDataArray"][i].mapping;

            if(mapping!=null){
                changeColumnColor(name, true);
                changeMapping(id,mapping,true);
            }
        }
    }
}

function refreshTable(){



    //clear table
    clearAll();

    //reset table
    resetTable();

    ////////console.log(JSON_ctrl);
}

function  changeColumnColor( columnName,setMark){

    ////////console.log(document.getElementById("toc1").innerHTML);

    document.getElementById(columnName);
    var columnNames = document.getElementsByName("columnName");

    for(var i = 0 ; i < columnNames.length; i++){
        if(columnNames[i].textContent==columnName){
            //get id
            var id = columnNames[i].id;
            //get next element and color it

            var temp = document.getElementById(id).nextSibling;
            if(setMark){
                temp.setAttribute("bgcolor","#79BAEC");
            }else{
                temp.removeAttribute("bgcolor");
            }

            while(temp.nextSibling){
                temp = temp.nextSibling;
                if(setMark){
                    temp.setAttribute("bgcolor","#79BAEC");
                }else{
                    temp.removeAttribute("bgcolor");
                }
            }
        }
    }
}

function changeMapping(id,mapping, mark){
    document.getElementById("mapping_"+id).style.display="block";
    document.getElementById("mapping_"+id).textContent=mapping;
    document.getElementById("delete_"+id).style.display="block";
}


function deleteMapping(cb){
    var id = cb.id;
    var obj = document.getElementById("key_"+id.substring(13));
    var name = obj.textContent;
    var mapping = document.getElementById("mapping_"+id.substring(13)).textContent;

    for (var i = 0 ;i < JSON_ctrl["nodeDataArray"].length; i++){
        if(JSON_ctrl["nodeDataArray"][i].text==name ){
            JSON_ctrl["nodeDataArray"][i].mapping=null;
        }
    }

    refreshTable();
}

function setPeriod(cb){
    var select = document.getElementById("selectColumn_fiscal_period");
    select.innerHTML="";
    var option = document.createElement("option");
    option.value="";
    option.text="";

    select.appendChild(option);

    ////////console.log(cb.value);
    if(cb.value=="year"){
        for (var i = 1970; i < 2099; i++){
            var option = document.createElement("option");
            option.value=i;
            option.text=i;

            select.appendChild(option);
        }


    } else {

        for (var i = 1; i < 12; i++){
            var option = document.createElement("option");
            option.value=i;
            option.innerText=i;

            select.appendChild(option);

        }

    }

}


function initialCheckbox(){
    var mappingName;

    for (var i = 0 ;i < JSON_ctrl["nodeDataArray"].length; i++){
        if(JSON_ctrl["nodeDataArray"][i].mapping!=null ){
            mappingName = JSON_ctrl["nodeDataArray"][i].mapping;
            //boxSelect(mappingName);
            var cbx = document.getElementById("cbx_"+mappingName);

            cbx.setAttribute("checked",true);
        }
    }
}


function initialColor(){
    var columnName;
    for (var i = 0 ;i < JSON_ctrl["nodeDataArray"].length; i++){
        if(JSON_ctrl["nodeDataArray"][i].mapping!=null ){
            columnName = JSON_ctrl["nodeDataArray"][i].text;
            changeColumnColor(columnName,true);

        }
    }
    ////console.log(JSON_ctrl);
}

function startPage2(inputType){

    document.getElementById("page2").style.display = "block";
    document.getElementById("page2FileName").textContent=document.getElementById("datasetTitle").value;
    ////console.log(document.getElementById("datasetTitle").value);
    addColumnInfo();

    //checkbox
    addCheckboxByType(inputType);

    //initial table color
    initialColor();

    //initial checkbox
    initialCheckbox();

}

function changeCodelist(cb){

    var optionList=document.getElementById("selectColumn").options;

    var columnName = optionList[optionList.selectedIndex].text;

    if(cb.checked){
        //pop up codelist detail
        document.getElementById("form_codelist").style.display="block";
    }else{
        //hide codelist detail
        document.getElementById("form_codelist").style.display="none";
    }


    var codeHtml=document.getElementById("selectColumn").innerHTML;
    document.getElementById("select_code").innerHTML=codeHtml;

    var labelHtml=document.getElementById("selectColumn").innerHTML;
    document.getElementById("select_label").innerHTML=labelHtml;

    var descriptionHtml=document.getElementById("selectColumn").innerHTML;
    document.getElementById("select_description").innerHTML=descriptionHtml;



    //mapping to JSON
    for (var i = 0 ;i < JSON_ctrl["nodeDataArray"].length; i++){

        if(JSON_ctrl["nodeDataArray"][i].text == columnName) {
            if(cb.checked){
                JSON_ctrl["nodeDataArray"][i].useCodelist=true;
                ////////console.log(JSON_ctrl["nodeDataArray"][i].text +" codelist attribute is set to: "+JSON_ctrl["nodeDataArray"][i].useCodelist);
                break;
            } else {
                //setJSON(columnName, "is" )
                JSON_ctrl["nodeDataArray"][i].useCodelist=false;
                ////////console.log(JSON_ctrl["nodeDataArray"][i].text +" codelist attribute is set to: "+JSON_ctrl["nodeDataArray"][i].useCodelist);
                break;
            }
        }
    }
}


function changeDataset(cb){

    var optionList=document.getElementById("selectColumn").options;

    var columnName = optionList[optionList.selectedIndex].text;
    for (var i = 0 ;i < JSON_ctrl["nodeDataArray"].length; i++){

        if(JSON_ctrl["nodeDataArray"][i].text == columnName) {
            if(cb.checked){
                JSON_ctrl["nodeDataArray"][i].isAttachment=true;
                ////////console.log(JSON_ctrl["nodeDataArray"][i].text +" dataset attribute is set to: "+JSON_ctrl["nodeDataArray"][i].isAttachment);
                break;
            } else {
                //setJSON(columnName, "is" )
                JSON_ctrl["nodeDataArray"][i].isAttachment=false;
                ////////console.log(JSON_ctrl["nodeDataArray"][i].text +" dataset attribute is set to: "+JSON_ctrl["nodeDataArray"][i].isAttachment);
                break;
            }
        }

    }
}


function addOption (inputText){
    var selectParent = document.getElementById("selectColumn");
    var selectCode = document.getElementById("select_code");
   // var selectLabel = document.getElementById("select_label");
   // var selectDescription = document.getElementById("select_description");

    selectParent.setAttribute("onchange","changeColumn(this, true)");

    var tempOption = document.createElement("option");
    tempOption.text=inputText;

    selectParent.appendChild(tempOption);
    //selectCode.appendChild(tempOption);
   // selectLabel.appendChild(tempOption);
    //selectDescription.appendChild(tempOption);
}


function addList(inputType,json){
    var selectParent = document.getElementById("selectColumn");
    selectParent.setAttribute("onchange","changeColumn(true)");

    if(inputType=='budget'){


        var list = DROPLIST1;

        for (var i = 0; i <list.varData.length; i ++){

            var tempOption = document.createElement("option");
            tempOption.text=list.varData[i][0];
            selectParent.appendChild(tempOption);

        }
    } else if(inputType=='spending'){
        var list = SPENDINGLIST;
        for (var i = 0; i <list.varData.length; i ++){
            var tempOption = document.createElement("option");
            tempOption.text=list.varData[i][0];
            selectParent.appendChild(tempOption);
        }
    }

}




function changeColumn(cb, setMark){

    var optionList=document.getElementById("selectColumn").options;
    var columnName = optionList[optionList.selectedIndex].text;

    if(columnName!=""){
        //column mapped before
        if(checkMapping(document.getElementById("pop_id").textContent)){
            var privousName;
            for (var i = 0 ;i < JSON_ctrl["nodeDataArray"].length; i++){
                if(JSON_ctrl["nodeDataArray"][i].mapping ==document.getElementById("pop_id").textContent ){
                    privousName = JSON_ctrl["nodeDataArray"][i].text;
                }
            }
            //changeColumnColor(privousName,false);

        }
        //changeColumnColor(columnName,true);


        //mapping to JSON
        for (var i = 0 ;i < JSON_ctrl["nodeDataArray"].length; i++){
            if(JSON_ctrl["nodeDataArray"][i].text == columnName) {
                JSON_ctrl["nodeDataArray"][i].mapping=document.getElementById("pop_id").textContent;

                //set general/specific
                //radios[0]=general
                //radios[1]=specific
                var radios=document.getElementsByName("specific");
                if(radios[0].checked ==true){
                    JSON_ctrl["nodeDataArray"][i].specific=false;
                }else if (radios[1].checked ==true){
                    JSON_ctrl["nodeDataArray"][i].specific=true;
                }

                //check/uncheck datasest box
                if(JSON_ctrl["nodeDataArray"][i].isAttachment){
                    document.getElementById("datasetMark").checked = true;
                    document.getElementById("datasetValue").value = lines[1][i];

                }

            }
        }

        document.getElementById("divSpecific").style.display="block";
    }else {
        document.getElementById("divSpecific").style.display="none";

    }



    //refreshTable();
}

function checkMapping(name){

    for (var i = 0 ;i < JSON_ctrl["nodeDataArray"].length; i++){

        if(JSON_ctrl["nodeDataArray"][i].mapping == name) {
            return true;
        }
    }

    return false;
}

function cleanPop(){
    var optionList=document.getElementById("selectColumn").options;
    //set droplist to empty option
    optionList[optionList.selectedIndex].removeAttribute("selected");
    optionList.selectedIndex=0;

    document.getElementById("codelistMark").checked = false;
    document.getElementById("datasetMark").checked = false;
    document.getElementById("concept").value = null;
    document.getElementById("schema").value = null;

}


function boxSelect(cb){

    var optionList=document.getElementById("selectColumn").options;


    //check
    if(cb.checked){
        //set title
        document.getElementById("pop_id").innerText=cb.id.substring(4);

        //clean up pop
        cleanPop();

        //show pop
        if(cb.nextElementSibling.textContent == "Fiscal Period"){
            //document.getElementById("form").style.display="none";
            //document.getElementById("form_fiscal_period").style.display="block";
            //document.getElementById("form_budgetary_Unit").style.display="none=";

            document.getElementById("form").style.display="block";


        } else if(cb.nextElementSibling.textContent == "Budgetary Unit"){
            //document.getElementById("form").style.display="none";
            //document.getElementById("form_fiscal_period").style.display="none";
            //document.getElementById("form_budgetary_Unit").style.display="block";
            document.getElementById("form").style.display="block";

        } else{
            document.getElementById("form").style.display="block";
            document.getElementById("form_fiscal_period").style.display="none";
            document.getElementById("form_budgetary_Unit").style.display="none";
        }


    } else {
        //box uncheck

        //if it is mapped before
        if(checkMapping(cb.nextElementSibling.textContent)){
            //get columnName
            var columnName;
            var priviousName = cb.nextElementSibling.textContent;
            //delete mapping
            for (var i = 0 ;i < JSON_ctrl["nodeDataArray"].length; i++){

                if(JSON_ctrl["nodeDataArray"][i].mapping == priviousName) {
                    JSON_ctrl["nodeDataArray"][i].mapping=null;
                    columnName=JSON_ctrl["nodeDataArray"][i].text;
                }
            }

            //reset table
            changeColumnColor(columnName,false);

        }

        //hide pop
        document.getElementById("form").style.display="none";
        document.getElementById("form_fiscal_period").style.display="none";
        document.getElementById("form_budgetary_Unit").style.display="none";

        //set title to null
        document.getElementById("pop_id").innerText="";

        //set droplist to empty option
        optionList[optionList.selectedIndex].removeAttribute("selected");
        optionList[0].setAttribute("selected","selected");

    }
}

function addCheckboxByType(dataType){
    var body = document.getElementsByTagName('body')[0];
    var table = document.getElementById("toc0");
    var tblBody = document.createElement("tbody");

    var toc0List = [];

    if(dataType=='budget'){

        toc0List = BUDGETLIST;

        for (var i = 0; i < toc0List.varData.length; i++){
            var row = document.createElement("tr");
            var cell = document.createElement("td");

            var checkBox = document.createElement("input");
            checkBox.setAttribute("type","checkbox");
            //checkBox.setAttribute("checked","checked");
            checkBox.setAttribute("onchange","boxSelect(this)");

            checkBox.id="cbx_"+(toc0List.varData[i][0]);

            var label = document.createElement("label");
            label.innerText=toc0List.varData[i][0];
            label.id="lbl_"+(toc0List.varData[i][0]);

            row.appendChild(checkBox);
            row.appendChild(label);
            tblBody.appendChild(row);



        }
        table.appendChild(tblBody);


    } else if (dataType == 'spending'){

        toc0List = SPENDINGLIST;

        for (var i = 0; i < toc0List.varData.length; i++){

            var row = document.createElement("tr");
            var cell = document.createElement("td");

            var checkBox = document.createElement("input");
            checkBox.setAttribute("type","checkbox");
            //checkBox.setAttribute("checked","checked");
            checkBox.setAttribute("onchange","boxSelect(this)");

            checkBox.id="cbx_"+(toc0List.varData[i][0]);


            var label = document.createElement("label");
            label.innerText=toc0List.varData[i][0];
            label.id="lbl_"+(toc0List.varData[i][0]);

            row.appendChild(checkBox);
            row.appendChild(label);
            tblBody.appendChild(row);


        }
        table.appendChild(tblBody);

    }

    //body.appendChild(table);

}

function addColumnInfo(){

    //removeTable("toc0");
    initColumnInfo(lines);
    console.log(lines);
    initColumnJason();
    createTable(columnInfo);
}


function removeTable(id)
{
    var tbl = document.getElementById(id);
    if(tbl) tbl.parentNode.removeChild(tbl);
}


function initColumnInfo(lines){

    var keys = ['Col', 'Sample','Sample2'];
    for (var i=0; i< lines.length; i++) {
        row = lines[i]
        key = keys[i]
        for (var j=0; j<row.length-1; j++){
            if (columnInfo.length <= j){
                var dic={}
                dic[key]=row[j]

                columnInfo.push(dic)
            }
            else{
                columnInfo[j][key] = row[j]
            }
        }
    }
}

function initColumnJason(){
    JSON_data["nodeKeyProperty"] = "id";
    var lst = [];
    for (var i=0; i<lines[0].length; i++){ //
        //for (var i=0; i<5; i++){ //
        ele={};
        ele["id"] = i;
        ele["name"] = lines[0][i];
        var columnvalue=[];
        for (var j=1; j<lines.length; j++){
            columnvalue.push(lines[j][i])
        }
        ele["value"] = columnvalue;
        lst.push(ele) ;

        ////////console.log(columnInfo[i]);
    } ;
    JSON_data["nodeDataArray"] = lst;
    JSON_data["linkDataArray"] = [];
    //////console.log(lst);

    //getColumndata("MS Name");

    ////////console.log(lst);
}

function createTable(lstDic){

    var body = document.getElementsByTagName('body')[0];
    var table = document.getElementById("toc1");
    var tblBody = document.createElement("tbody");

    //create data part
    //display sample data
    for (var i=0; i<lstDic.length; i++) { //allTextLines.length

        var row = document.createElement("tr");
        row.class='clickable-row';
        row.id= "row_"+ i;
        //row.appendChild(document.createElement("a").setAttribute("href","#"));

        var dic = lstDic[i];
        var cell = document.createElement("td");
        cell.style.backgroundColor= "#95B9C7";
        cell.appendChild(document.createTextNode(i.toString()));
        row.appendChild(cell);

        //add data column
        for (key in dic) {
            var cell = document.createElement("td");
            cell.appendChild(document.createTextNode(dic[key]));

            //set color
            if("Col"==key){
                cell.style.backgroundColor= "#95B9C7";
                cell.id = "key_"+ i.toString();
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


    }

    table.appendChild(tblBody);
    // body.appendChild(table)
    ////////console.log(document.getElementById("toc1").innerHTML );
}

function checkDataset(input){
    return input.isAttachment;
}

function checkCodelist(input){
    return input.useCodelist;
}


function composeDSDPrifix(input){
    var DSDnamespace = "# ----- DSD-specific namespaces -----\n\n\@prefix "+ input[0] +":             <http:\/\/data.openbudgets.eu\/ontology\/"+ input[1] +"\/> .\n@prefix shortNmae-codelist:    <http:\/\/data.openbudgets.eu\/resource\/identity\/codelist\/> .\n\@prefix shortNmae-dimension:   <http:\/\/data.openbudgets.eu\/ontology\/dsd\/identity\/dimension/> .\n\@prefix shortNmae-measure:     <http:\/\/data.openbudgets.eu/ontology\/dsd\/identity\/measure\/> .\n\n";//@prefix shortNmae-operation:   <http:\/\/data.openbudgets.eu\/resource\/identity\/codelist/operation-character\/> .\n\n";
    //@prefix eu-funds:         <http:\/\/data.openbudgets.eu\/resource\/identity\/codelist/eu-funds\/> .\n

    DSDnamespace=DSDnamespace.replace(/shortNmae/g,input[0]);
    DSDnamespace=DSDnamespace.replace(/identity/g,input[3]);



    var DSD=DSDnamespace+OBEUnamespace+GENERICnamespace;

    return DSD;
}


function checkAttachment(DSD,input){

    var res="";

    if(input.isAttachment){
        var temp=DSD.substring(0,DSD.length-3);
        ////////console.log(JSON_ctrl["nodeDataArray"][i].isAttachment);
        res=temp +";\n \t\t\t\t qb:componentAttachment qb:DataSet ],\n";
        return res;
    };

    return DSD;
}

function getProperty(name){

    var list = BUDGETLIST;
    for (var i = 0; i <list.varData.length; i ++){
        if(list.varData[i][0]==name){
            return list.varData[i][1];
        }
    }
}

function normalizeName(name){

    //NationalAmount
    var name2=name.replace(/ /g,"");

    //nationalAmount
    var res=name2.substring(0,1).toLowerCase()+name2.substring(2);

    return res;
}

function composeDSDSingle(node,input){

    var res="";



    //National Amount
    //var name = node.text;

    //NationalAmount
    //var name2=name.replace(/ /g,"");

    //nationalAmount
    //var name3=name2.substring(0,1).toLowerCase()+name2.substring(2);
    var name3=normalizeName(node.text);

    //Budgetary Unit
    var mapping = node.mapping;
    var property =getProperty(mapping);


    if(mapping!=null){
        //NationalAmount
        var mapping=mapping.replace(/ /g,"");
        //nationalAmount
        var mapping=mapping.substring(0,1).toLowerCase()+mapping.substring(1);
    }

    if(node.specific==true){

        var specificName = node.specificname;
        res="\n \t\t\t\t[ qb:"+property+" "+input[0]+"-"+property+":"+specificName+" ],\n";
    }else {
        res="\n \t\t\t\t[ qb:"+property+" obeu-"+property+":"+mapping+" ],\n";
    }

    return res;

}

function composeDSDMiddle(input){
    var comment = document.getElementById("datasetComment").value;
    var DSDbegin="# ----- DSD -----\n\n <http:\/\/data.openbudgets.eu\/ontology\/dsd\/"+ input[3] +"> a qb:DataStructureDefinition ;\n rdfs:label \""+comment+ input[2] +"\"@en ;  \n";

    var DSD = DSDbegin + "qb:component ";
    var temp="";

    for (var i = 0 ; i<JSON_ctrl["nodeDataArray"].length; i ++){
        if(JSON_ctrl["nodeDataArray"][i].mapping!=null){
            DSD+=composeDSDSingle(JSON_ctrl["nodeDataArray"][i],input);
            temp=DSD;
            DSD=checkAttachment(temp,JSON_ctrl["nodeDataArray"][i]);
        }

    }
    //end #DSD
    var endDSD=DSD.substring(0,DSD.length-2);

    DSD=endDSD +".\n";

    return DSD;
}

function buildProperty(node,input){
    var res="";

    var DSD="";

    if(node.useCodelist==true){

        DSD+="qb:codeList "+input[0]+"-codelist:functions ;\n\t";
    }

    if(node.specific==true){
        DSD+=input[0]+"-measure:"+node.mapping+" a rdf:Property, qb:DimensionProperty ; \n\t";
        DSD+="rdfs:label \"Amount EU\"@en ;\n\t";
        DSD+="rdfs:comment \"Amount funded by the resp. EU fund.\"@en ;\n\t";
        DSD+="rdfs:subPropertyOf obeu-measure:"+node.mapping+" ;\n\t";
        DSD+="rdfs:isDefinedBy <http:\/\/data.openbudgets.eu\/ontology\/dsd\/"+input[3]+"> .\n\n"
    } else {

        DSD+="obeu-measure:amount a rdf:Property, qb:MeasureProperty ;\n\t";
        DSD+="rdfs:label "+node.mapping+"@en ;\n\t";
        DSD+="rdfs:comment \"The" +node.mapping+ "budgeted.\"@en ;\n\t";
        DSD+="rdfs:subPropertyOf sdmx-measure:obsValue ;\n\t";
        DSD+="rdfs:range xsd:decimal ;\n\t";
        DSD+="qb:concept sdmx-concept:obsValue .\n\n";

    }

    if(node.useCodelist==true){

        DSD+="qb:codeList "+input[0]+"-codelist:functions ;\n\t";
    }


}

function composeDSDSingleProperty(node , input){

//////console.log("this is for composeSingleProperty"+node);

    //Budgetary Unit
    var mapping = node.mapping;
    var property =getProperty(mapping);
    var codeProperty=(node.codelistName!=null?", qb:CodedProperty":"");

    var subMapping=mapping.replace(/ /g,"");
    subMapping=mapping.substring(0,1).toLowerCase()+mapping.substring(1);

    var mainProerty = input[0]+"-"+property+":"+node.specificname+" a rdf:Property"+codeProperty+", qb:DimensionProperty;\n\t";
    var subProperty= "rdfs:subPropertyOf obeu-"+property+":"+subMapping+" ;\n\t";
    if(mapping.substring(mapping.length-13).toLowerCase()=="classfication" && mapping.length>13){
        //subProperty+= "rdfs:subPropertyOf obeu-dimension:classification ;\n\t";
    }
    var codelist= "";
    var range= "";

    if(node.codelistName!=null){
        codelist = "qb:codeList "+input[0]+"-codelist:"+ node.schema +" ;\n\t";
        range = "rdfs:range "+input[0]+":"+ node.concept +" ;\n\t";
    }

    //range = "rdfs:range "+input[0]+":"+ node.codelistName +" ;\n\t";
    var propertiesDefinition = "rdfs:isDefinedBy <http:\/\/data.openbudgets.eu\/ontology\/dsd\/"+input[3]+"> .\n\n"



    var res = mainProerty+subProperty+codelist+range+propertiesDefinition;

    return res;
}

function composeDSDClarification(node, input){

    var res = "";
    {
        res+=input[0]+":"+ node.concept+" a rdfs:Class ;\n";
        res+="rdfs:label \""+ node.concept+"\"@en ;\n";
        res+="rdfs:subClassOf skos:Concept ;\n";
        res+="rdfs:isDefinedBy <http:\/\/data.openbudgets.eu\/ontology\/dsd\/"+input[3]+"> .\n\n";
    }

    return res;
}

function composeDSDProperties(input){

    var propertiesBegin="\n# ----- Component properties -----\n\n"

    var DSD=propertiesBegin;

    var needClarification="\n# ----- Needs some clarification -----\n\n"

    for (var i = 0 ; i<JSON_ctrl["nodeDataArray"].length; i ++){
        var mapping=JSON_ctrl["nodeDataArray"][i].mapping;
        if(mapping!=null) {

            if(JSON_ctrl["nodeDataArray"][i].specific){
                DSD+=composeDSDSingleProperty(JSON_ctrl["nodeDataArray"][i],input);
            }

            if(JSON_ctrl["nodeDataArray"][i].concept!=""&&JSON_ctrl["nodeDataArray"][i].concept!=null){
                needClarification+=composeDSDClarification(JSON_ctrl["nodeDataArray"][i],input);
            }
        }
    }

    DSD+=needClarification;

    return DSD;
}

function composeDSD(){


    //var shortName = "esif";

    //var fullNmae = "european-funds";

    var shortName=document.getElementById("short").value;
    var fullNmae=document.getElementById("full").value;

    var interval = document.getElementById("year_begin").value.substring(0,4)+"-"+document.getElementById("year_end").value.substring(0,4);
    //var interval = "2000-2004"
    var identity = shortName.toUpperCase()+"-"+interval;

    var input =[shortName,fullNmae,interval,identity]

    prifix = composeDSDPrifix(input);
    ////////console.log(prifix);
    middle = composeDSDMiddle(input);
    ////////console.log(middle);
    properties = composeDSDProperties(input);
    ////////console.log(properties);

    DSD = prifix + middle + properties;

    DSDfinal=DSD;
    //download("DSD",DSD);
    ////////console.log(DSD);
}

function download(filename, text,id) {
  /*  var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
   */

    //////console.log(filename);
    //////console.log(text);
    //////console.log(id);

    var data=[];
    data.push(text);
    properties = {type: 'plain/text'}; // Specify the file's mime-type.

    try {
        // Specify the filename using the File constructor, but ...
        file = new File(data, filename, properties);
    } catch (e) {
        ////console.log(e);
        // ... fall back to the Blob constructor if that isn't supported.
        file = new Blob(data, properties);
    }

    url = URL.createObjectURL(file);
    document.getElementById(id).href = url;

}

function setCLcode(cb){

    var mappingOptions = document.getElementById("selectColumn").options;
    var mappingIndex = document.getElementById("selectColumn").options.selectedIndex;
    var mappingText =  mappingOptions[mappingIndex].text;

    var options = document.getElementById("select_code").options;
    var index = document.getElementById("select_code").options.selectedIndex;
    var option = options[index];
    var text = option.text;

    //map to JSON
    for (var i = 0 ;i < JSON_ctrl["nodeDataArray"].length; i++){

        if(JSON_ctrl["nodeDataArray"][i].text == mappingText) {

            JSON_ctrl["nodeDataArray"][i].codelistName=text;
            JSON_ctrl["nodeDataArray"][i].codelistCode=text;
        }
    }
}

function setCLlabel(cb){
    var mappingOptions = document.getElementById("selectColumn").options;
    var mappingIndex = document.getElementById("selectColumn").options.selectedIndex;
    var mappingText =  mappingOptions[mappingIndex].text;

    var options = document.getElementById("select_label").options;
    var index = document.getElementById("select_label").options.selectedIndex;
    var option = options[index];
    var text = option.text;

    //map to JSON
    for (var i = 0 ;i < JSON_ctrl["nodeDataArray"].length; i++){

        if(JSON_ctrl["nodeDataArray"][i].text == mappingText) {

            JSON_ctrl["nodeDataArray"][i].codelistLabel=text;
        }
    }
}

function setCLdescritpion(cb){
    var mappingOptions = document.getElementById("selectColumn").options;
    var mappingIndex = document.getElementById("selectColumn").options.selectedIndex;
    var mappingText =  mappingOptions[mappingIndex].text;

    var options = document.getElementById("select_description").options;
    var index = document.getElementById("select_description").options.selectedIndex;
    var option = options[index];
    var text = option.text;

    //map to JSON
    for (var i = 0 ;i < JSON_ctrl["nodeDataArray"].length; i++){

        if(JSON_ctrl["nodeDataArray"][i].text == mappingText) {

            JSON_ctrl["nodeDataArray"][i].codelistDescription=text;
        }
    }
}

function compare(a,b){
    var res = true;
    for(var i = 0; i < a.length; i ++){
        if(a[i]!=b[i]){
            res=false;
            break;
        }
    }
    return res;
}

function include(array, ele){
    var res = false;

    for(var i = 0; i < array.length; i ++){

        if(array[i].length==3){
            if((array[i][0]==ele[0])&&(array[i][1]==ele[1])&&(array[i][2]==ele[2])){
                return true;
            }

        }
        if(array[i].length==2){
            if((array[i][0]==ele[0])&&(array[i][1]==ele[1])){
                return true;
            }

        }
        if(array[i].length==1){
            if(array[i][0]==ele[0]){
                return true;
            }

        }
    }

    return res;
}

function removeDiff(inputArray){
    var res=[];
    res.push(inputArray[0]);
    //////console.log(res);
    for(var i = 1; i < inputArray.length ; i++){

        ////////console.log("two elements"+" are same: "+compare(inputArray[i],inputArray[i-1]));
        if(!compare(inputArray[i],inputArray[i-1])){

            ////////console.log("this element is inside the array :"+include(res,inputArray[i]));
            if(!include(res,inputArray[i])){
                ////////console.log("this element is inside the array :"+include(res,inputArray[i]));
                ////////console.log("this array is :"+res);
                ////////console.log("element added : "+inputArray[i][0]+", "+inputArray[i][1]+", "+inputArray[i][2]);
                res.push(inputArray[i]);
            }
        }
    }

    return res;
}

function getColumndata(name){

    var columnData;

    for(var i = 0; i < JSON_data["nodeDataArray"].length ; i++){
        if(JSON_data["nodeDataArray"][i].name==name){
            columnData=JSON_data["nodeDataArray"][i].value;
        }
    }

    //var res = removeDiff(columnData);

    return columnData;
}

function getMultiColumndata(names){

    var columnData=[];

    if(names.length==1){
        var column0=getColumndata(names[0]);
    }else if (names.length==2){
        var column0=getColumndata(names[0]);
        var column1=getColumndata(names[1]);

    }else{
        var column0=getColumndata(names[0]);
        var column1=getColumndata(names[1]);
        var column2=getColumndata(names[2]);

    }


    //////console.log(column0);
    for(var i = 0; i < column0.length ; i++){
        if(names.length==1){
            var tempData=[column0[i]];
        }else if(names.length==2){
            var tempData=[column0[i],column1[i]];
        }else{
            var tempData=[column0[i],column1[i],column2[i]];
        }

        columnData.push(tempData);
        ////////console.log(tempData);
    }

    var res = removeDiff(columnData);

    return res;
}


function composeCodelistSingle(node, input){

    var columnName = node.codelistCode;
    var labelName = node.codelistLabel;
    var descriptionName = node.codelistDescription;

    var names = [];

    if(columnName!=null){
        names.push(columnName);
    }

    if(labelName!=null){
        names.push(labelName);
    }

    if(descriptionName!=null){
        names.push(descriptionName);
    }

    var rows = getMultiColumndata(names);

    //////console.log(rows);

    var res="";

    for (var i = 0; i < rows.length; i++){
        var first="<http:\/\/data.openbudgets.eu\/resource\/"+input[3]+"\/codelist\/"+node.schema+"\/"+rows[i][0]+"> skos:notation \""+rows[i][0]+"\" ;\n"

        var label="";
        if(rows[0].length>1){
            label = "skos:prefLabel \""+rows[i][1]+"\"@en;\n";
        }

        var description="";

        if(rows[0].length>2){

            description="<http:\/\/data.openbudgets.eu\/resource\/"+input[3]+"/codelist/"+input[0]+"\/"+"here should be column name"+"> \""+rows[i][2]+"\" ;\n";
            //label += "skos:definition \""+rows[i][1]+"\"@en;\n";
        }

        var concept="a skos:Concept;\n";
        if(node.concept!=null || node.concept!=""){
            concept = concept.substring(0,concept.length-2)+" , <http:\/\/data.openbudgets.eu\/resource\/"+input[3]+"\/"+node.concept+"> ;\n"
        }

        var schema="";
        if(node.schema!=null || node.schema!=""){
            schema="skos:inschema <http:\/\/data.openbudgets.eu\/resource\/"+input[3]+"\/codelist\/"+node.schema+"\/> .\n\n";
        }


        var last2="skos:inschema "+input[0]+"-codelist:"+columnName+" .\n\n";

        var row = first+label+description+concept+schema;

        res+=row;

    }
    ////////console.log(res);
    if(node.specificname=="" || node.specificname!=null){
        var codelistName=input[0]+"-codelist:"+node.concept+" a skos:ConceptSchema ;\n";

        res+=codelistName;
    }


    return res;
}

function composeCodelist(){

    var shortName=document.getElementById("short").value;
    var fullNmae=document.getElementById("full").value;

    var interval = document.getElementById("year_begin").value.substring(0,4)+"-"+document.getElementById("year_end").value.substring(0,4);
    //var interval = "2000-2004"
    var identity = shortName.toUpperCase()+"-"+interval;

    var input =[shortName,fullNmae,interval,identity]

    var prifix="";

    prifix+="# ----- DSD-specific namespaces -----\n";

    prifix+="@prefix "+input[0]+":             <http:\/\/data.openbudgets.eu\/ontology\/"+input[1]+"/> .\n";
    prifix+="@prefix "+input[0]+"-codelist:    <http:\/\/data.openbudgets.eu\/resource\/"+input[3]+"\/codelist\/> .\n";
    prifix+="@prefix "+input[0]+"-dimension:   <http:\/\/data.openbudgets.eu\/ontology\/dsd/"+input[3]+"\/dimension\/> .\n";
    prifix+="@prefix "+input[0]+"-measure:     <http:\/\/data.openbudgets.eu\/ontology\/dsd/"+input[3]+"\/measure\/> .\n";
    //prifix+="@prefix "+input[0]+"-operation:   <http:\/\/data.openbudgets.eu\/resource\/"+input[3]+"\/codelist/operation-character\/> .\n";

    prifix+="\n# ----- OpenBudgets.eu namespaces -----\n";

    prifix+="@prefix obeu:             <http:\/\/data.openbudgets.eu\/ontology\/> .\n";
    prifix+="@prefix obeu-attribute:   <http:\/\/data.openbudgets.eu\/ontology\/dsd\/attribute\/> .\n";
    prifix+="@prefix obeu-dimension:   <http:\/\/data.openbudgets.eu\/ontology\/dsd\/dimension\/> .\n";
    prifix+="@prefix obeu-measure:     <http:\/\/data.openbudgets.eu\/ontology\/dsd\/measure\/> .\n";

    prifix+="\n# ----- Generic namespaces ------\n";

    prifix+="@prefix foaf:             <http:\/\/xmlns.com\/foaf\/0.1\/> .\n";
    prifix+="@prefix org:              <http:\/\/www.w3.org\/ns\/org#> .\n";
    prifix+="@prefix owl:              <http:\/\/www.w3.org\/2002\/07\/owl#> .\n";
    prifix+="@prefix qb:               <http:\/\/purl.org\/linked-data\/cube#> .\n";
    prifix+="@prefix rdf:              <http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#> .\n";
    prifix+="@prefix rdfs:             <http:\/\/www.w3.org\/2000\/01\/rdf-schema#> .\n";
    prifix+="@prefix skos:             <http:\/\/www.w3.org\/2004\/02\/skos\/core#> .\n";
    prifix+="@prefix xsd:              <http:\/\/www.w3.org\/2001\/XMLSchema#> .\n";
    //prifix+="@prefix esif-fund:        <http:\/\/data.openbudgets.eu\/resource\/ESIF-2014-2020\/codelist/eu-funds/>\n";


    var codelist = "";

    var res="";
    //get codelist element
    for (var i = 0 ;i < JSON_ctrl["nodeDataArray"].length; i++){

        if(JSON_ctrl["nodeDataArray"][i].useCodelist) {
            //prifix+="@prefix "+input[0]+"-"+JSON_ctrl["nodeDataArray"][i].codelistName+":        <http:\/\/data.openbudgets.eu\/resource\/"+input[0]+"\/codelist/"+input[2]+"/>\n";
            codelist=composeCodelistSingle(JSON_ctrl["nodeDataArray"][i],input);
            res=prifix+"\n\n"+codelist;

            CODELISTfinal.push(res);
        }
    }
}

function finishPage2(){
    document.getElementById("page2").style.display = "none";
}
function checkMatching(checkArray, CLvalue){

    for(var i = 0 ; i < checkArray.length; i++){
        //for (var  k = 0; k < CLvalue.length ; k++){
            if(CLvalue[i][2].indexOf(checkArray[i])){
                continue;
            }else{
                return false;
            }
        //}
    }
    return true;
}


function composeDatasetData(){
    ////console.log("enter composeDatasetData");
    //for (var  i = 0; i )
    //JSON_data JSON_ctrl JSON_opt


    var datasetLength = JSON_data["nodeDataArray"][0].value.length;

    var CLvalue=[];
    for (var  i = 0; i < CODELISTfinal.length ; i++){
        var CLstring = CODELISTfinal[0];
        //////console.log(CODELISTfinal[0]);
        //var CLstring = "";
        var re=/skos:notation *\".*\"/g;
        var re2= /\".*\"/g;
        var match="";
        var CLmapping=[] ;
        while (match= re.exec(CLstring)){

            var subStr = match[0].substring(14,match[0].length).replace(/\"/g,"");
            CLmapping.push(subStr);
        };

        var count = 0;
        var CLid="";
        var CLname="";
        for (var j = 0 ; j<JSON_ctrl["nodeDataArray"].length; j ++){
            if(JSON_ctrl["nodeDataArray"][j].useCodelist) {
                if(count == i){
                    CLid = JSON_ctrl["nodeDataArray"][j].id;
                    CLname = JSON_ctrl["nodeDataArray"][j].text;
                    break;
                }
                count++;

            }
        }

        var ele=[CLid,CLname, CLmapping];
        CLvalue.push(ele);
        ////console.log(CLvalue);
    }

    var shortName=document.getElementById("short").value;
    var fullNmae=document.getElementById("full").value;
    var interval = document.getElementById("year_begin").value.substring(0,4)+"-"+document.getElementById("year_end").value.substring(0,4);
    var identity = shortName.toUpperCase()+"-"+interval;

    var input =[shortName,fullNmae,interval,identity]

    var res="";
    var obsCount=0;
    //every single data will be checked
    for (var i = 0 ;i < JSON_data["nodeDataArray"][0].value.length; i++){
        //check sepcific column in code list
        var checkArray=[];
        for (var  j = 0; j < CLvalue.length ; j++){
            checkArray.push(JSON_data["nodeDataArray"][CLvalue[j][0]].value[i]);
        }

        //if ture, ouput this line;
        if(checkMatching(checkArray,CLvalue)){
            res +="<http:\/\/data.openbudgets.eu\/resource\/dataset\/"+input[3]+"\/observation\/"+obsCount+"> a qb:Observation ;\n";
            for (var k = 0 ; k<JSON_ctrl["nodeDataArray"].length; k ++){
                if(JSON_ctrl["nodeDataArray"][k].specific) {

                    var node = JSON_ctrl["nodeDataArray"][k];
                    var property =getProperty(node.mapping);

                    if(node.useCodelist){
                        res +="obeu-"+property+":"+node.specificname+" <http:\/\/data.openbudgets.eu\/resource\/"+input[3]+"\/codelist\/"+node.schema+"\/"+JSON_data["nodeDataArray"][k].value[i]+"> ;\n"
                    }
                    else{
                        res+=input[0]+"-"+property+":"+node.specificname+" "+JSON_data["nodeDataArray"][k].value[i] +" ;\n"
                    }
                }

            }
            res+="\n"
            obsCount++;
        };
    }

    return res;
}

function composeDatasetDSD(){
    ////console.log("enter composeDatasetDSD");


    var shortName=document.getElementById("short").value;
    var fullNmae=document.getElementById("full").value;
    var interval = document.getElementById("year_begin").value.substring(0,4)+"-"+document.getElementById("year_end").value.substring(0,4);
    var identity = shortName.toUpperCase()+"-"+interval;

    var input =[shortName,fullNmae,interval,identity]

    var DSDnamespace = "# ----- DSD-specific namespaces -----\n\n\@prefix "+ input[0] +":             <http:\/\/data.openbudgets.eu\/ontology\/"+ input[1] +"\/> .\n@prefix shortNmae-codelist:    <http:\/\/data.openbudgets.eu\/resource\/identity\/codelist\/> .\n\@prefix shortNmae-dimension:   <http:\/\/data.openbudgets.eu\/ontology\/dsd\/identity\/dimension/> .\n\@prefix shortNmae-measure:     <http:\/\/data.openbudgets.eu/ontology\/dsd\/identity\/measure\/> .\n\n";//@prefix shortNmae-operation:   <http:\/\/data.openbudgets.eu\/resource\/identity\/codelist/operation-character\/> .\n\n";
    //@prefix eu-funds:         <http:\/\/data.openbudgets.eu\/resource\/identity\/codelist/eu-funds\/> .\n

    DSDnamespace=DSDnamespace.replace(/shortNmae/g,input[0]);
    DSDnamespace=DSDnamespace.replace(/identity/g,input[3]);



    var DSD=DSDnamespace+OBEUnamespace+GENERICnamespace;



    var clLength = CODELISTfinal.length;
    var nodelength=JSON_opt["nodeDataArray"].length;

    var res=DSD;
    for(var i =0; i < nodelength; i++){

        var node = JSON_opt["nodeDataArray"][i];
        ////console.log(node);
        res+="qb:"+node.DSD0+" "+node.DSD1 + "-"+node.DSD2+ ":"+node.DSD3+";\n"
        res+=node.DSD4+".\n"
        res+=node.DSD5+".\n"
        res+=node.DSD6+"-"+node.DSD7 + ":"+node.DSD8+ " a "+node.DSD9+node.DSD10+", "+node.DSD11+";\n";
        res+=node.DSD12+" "+node.DSD13 + "-"+node.DSD14+ ":"+node.DSD15+";\n";
        if(node.useCodelist){
            res+=node.DSD16+" "+node.DSD17 + "-"+node.DSD18+ ":"+node.DSD19+";\n";
            res+=node.DSD20+" "+node.DSD21 + ":"+node.DSD22+";\n";

        }
        res+=node.DSD23+"\n\n"

    }


    ////console.log(res);
    return res;
}

function composeDataset(){
    var res = "";
    res=composeDatasetDSD();
    res+=composeDatasetData();
    DATASETTTL=res;
}
function initialJSONopt(){

    var shortName=document.getElementById("short").value;
    var fullNmae=document.getElementById("full").value;
    var interval = document.getElementById("year_begin").value.substring(0,4)+"-"+document.getElementById("year_end").value.substring(0,4);
    var identity = shortName.toUpperCase()+"-"+interval;

    var input =[shortName,fullNmae,interval,identity]


    JSON_opt["nodeKeyProperty"] = "id";
    var lst = [];
    for (var i = 0 ; i<JSON_ctrl["nodeDataArray"].length; i ++){
        if(JSON_ctrl["nodeDataArray"][i].mapping!=null) {
            node = JSON_ctrl["nodeDataArray"][i];
            var mapping = node.mapping;
            var property =getProperty(mapping);

            //general and scpecific
            var ele = {};
            ele["DSD0"] = property;
            if(node.specificname!=null&&node.specificname!=""){
                ele["DSD1"] = input[0];
            }else{
                ele["DSD1"] = "obeu";
            }
            ele["DSD2"] = property;

            if(node.specificname!=null&&node.specificname!=""){
                ele["DSD3"] = node.specificname;
            }else{
                ele["DSD3"] = normalizeName(node.mapping);
            }

            if(node.isAttachment){
                ele["DSD4"] = "qb:componentAttachment qb:DataSet.";
            }else{
                ele["DSD4"] = "";
            }

            if(node.mapping.toLowerCase()=="currency"){
                ele["DSD5"] = "qb:componentRequired true.";
            }else{
                ele["DSD5"] = "";
            }

            //specific only
            if(node.specificname!=null&&node.specificname!="") {
                ele["DSD6"] = input[0];

                ele["DSD7"] = property;
                ele["DSD8"] = node.specificname;
                ele["DSD9"] = "rdf:Property";

                if (node.useCodelist) {
                    ele["DSD10"] = " , qb:CodedProperty";
                } else {
                    ele["DSD10"] = "";
                }

                ele["DSD11"] = "qb:DimensionProperty";
                ele["DSD12"] = "rdfs:subPropertyOf";
                ele["DSD13"] = "obeu";
                ele["DSD14"] = property;
                ele["DSD15"] = normalizeName(node.mapping);
                if (node.useCodelist) {
                    ele["DSD16"] = "qb:codeList";
                    ele["DSD17"] = input[0];
                    ele["DSD18"] = "codelist";
                    ele["DSD19"] = node.schema;
                    ele["DSD20"] = "rdfs:range";
                    ele["DSD21"] = input[0];
                    ele["DSD22"] = node.concept;
                } else {
                    ele["DSD16"] = "";
                    ele["DSD17"] = "";
                    ele["DSD18"] = "";
                    ele["DSD19"] = "";
                    ele["DSD20"] = "";
                    ele["DSD21"] = "";
                    ele["DSD22"] = "";
                }

                ele["DSD23"] = "rdfs:isDefinedBy <http:\/\/data.openbudgets.eu\/ontology\/dsd\/ESIF-2014-2020> .";
            }

            lst.push(ele) ;
        }
    }
    JSON_opt["nodeDataArray"] = lst;
    JSON_opt["linkDataArray"] = [];
}

function toPage3(){
    finishPage2();
    initialJSONopt();
    composeDSD();
    composeCodelist();
    composeDataset();
    startPage3();
}
//=======page3==========

function startPage3(){
    document.getElementById("page3").style.display = "block";
    document.getElementById("page2FileName3").textContent=document.getElementById("datasetTitle").value;
    document.getElementById("toc3_1").innerHTML = document.getElementById("toc1").innerHTML;


    var table = document.getElementById("toc3_0");
    //get codelist element
    for (var i = 0 ;i < JSON_ctrl["nodeDataArray"].length; i++){

        if(JSON_ctrl["nodeDataArray"][i].useCodelist) {
            var row = document.createElement("tr");
            var cell = document.createElement("td");
            cell.appendChild(document.createTextNode(JSON_ctrl["nodeDataArray"][i].mapping));
            row.appendChild(cell);
            table.appendChild(row);
        }
    }

    //download link


    var div_download = document.getElementById("download_div");
    div_download.appendChild(document.createElement("hr"));
    for(var i = 0; i < CODELISTfinal.length; i ++){
        //<a  id="codelist1_download" href="2" download="codelist1.ttl">codelist1 download</a>
        var aTag = document.createElement("a");
        var herfNum = 2+i;
        herNum = herfNum.toString();
        var codelistNum = "codelist"+(i+1);

        aTag.id =codelistNum+"_download";
        aTag.setAttribute("href",herfNum);
        aTag.setAttribute("download",codelistNum+".ttl");
        aTag.textContent=codelistNum+" download";

        div_download.appendChild(aTag);
        div_download.appendChild(document.createElement("hr"));
        ////console.log(aTag);
        var filename = codelistNum+'.ttl'
        var id = codelistNum+"_download"
        download(filename ,CODELISTfinal[i],id);
    }
    download('DSD.ttl',DSDfinal,"DSD_download");
    /*download('codelist1.ttl',CODELISTfinal[0],"codelist1_download");
    download('codelist1.ttl',CODELISTfinal[1],"codelist2_download");
    download('codelist1.ttl',CODELISTfinal[2],"codelist3_download");
    */
    download('dataset.ttl',DATASETTTL,"dataset_download");
}