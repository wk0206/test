/**
 * 
 */

//=======Global Variables==========
raw_filename = "";
lines = [];
columnInfo = [];
RDFGraph = {};
DSD = [];
CodeList = [];
DataTTL = [];

MAX_STRING_LENGTH = 20;
qbtypesDb = ['Dimension', 'Attribute', 'Value'];
prefixesDb = ['http://obeu', 'http://rdfs'];
 
//========Save to File or Push to RDF Triple Store ====
function exportToTripleStore() {
    var csv = JSON.stringify(RDFGraph);
    

    //window.open('data:text/csv;charset=utf-8;filename=saved.ttl,' + escape(myCsv), 'saved.ttl');
    
    //var json_pre = '[{"Id":1,"UserName":"Sam Smith"},{"Id":2,"UserName":"Fred Frankly"},{"Id":1,"UserName":"Zachary Zupers"}]';
    //var json = $.parseJSON(json_pre);

    //var csv = JSON2CSV(json);
    var downloadLink = document.createElement("a");
    var blob = new Blob(["\ufeff", csv]);
    var url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = raw_filename+'.ttl';

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}


//========Generating TTL and Checking ========

function generating_TTL(){
	
	document.getElementById("TTLArea").value=myDiagram.model.toJson();
	RDFGraph = JSON.parse(document.getElementById("TTLArea").value); 
	
	
}

//=======OutputJason=======
function outputColumnJason(){
	// if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
	var $ = go.GraphObject.make;  // for conciseness in defining templates
	myDiagram =
		$(go.Diagram, "myDiagram",  // must name or refer to the DIV HTML element
			{
				// start everything in the middle of the viewport
				initialContentAlignment: go.Spot.Center,
				// have mouse wheel events zoom in and out instead of scroll up and down
				"toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
				// support double-click in background creating a new node
				"clickCreatingTool.archetypeNodeData": { text: "new node" },
				// enable undo & redo
				"undoManager.isEnabled": true
			});

	load_vis();
}
//=======LOAD GRAPH========
function init_vis() {
	  // if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
	   var $ = go.GraphObject.make;  // for conciseness in defining templates
	   myDiagram =
	     $(go.Diagram, "myDiagram",  // must name or refer to the DIV HTML element
	       {
	         // start everything in the middle of the viewport
	         initialContentAlignment: go.Spot.Center,
	         // have mouse wheel events zoom in and out instead of scroll up and down
	         "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
	         // support double-click in background creating a new node
	         "clickCreatingTool.archetypeNodeData": { text: "new node" },
	         // enable undo & redo
	         "undoManager.isEnabled": true
	       });
	   
	   // when the document is modified, add a "*" to the title and enable the "Save" button
	   myDiagram.addDiagramListener("Modified", function(e) {
	     var button = document.getElementById("SaveButton");
	     if (button) button.disabled = !myDiagram.isModified;
	     var idx = document.title.indexOf("*");
	     if (myDiagram.isModified) {
	       if (idx < 0) document.title += "*";
	     } else {
	       if (idx >= 0) document.title = document.title.substr(0, idx);
	     }
	   });
	   // define the Node template
	   myDiagram.nodeTemplate =
	     $(go.Node, "Auto",
	       new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
	       // define the node's outer shape, which will surround the TextBlock
	       $(go.Shape, "RoundedRectangle",
	         {
	           parameter1: 20,  // the corner has a large radius
	           fill: $(go.Brush, "Linear", { 0: "rgb(254, 201, 0)", 1: "rgb(254, 162, 0)" }),
	           stroke: "black",
	           portId: "",
	           fromLinkable: true,
	           fromLinkableSelfNode: true,
	           fromLinkableDuplicates: true,
	           toLinkable: true,
	           toLinkableSelfNode: true,
	           toLinkableDuplicates: true,
	           cursor: "pointer"
	         }),
	       $(go.TextBlock,
	         {
	           font: "bold 11pt helvetica, bold arial, sans-serif",
	           editable: true  // editing the text automatically updates the model data
	         },
	         new go.Binding("text", "text").makeTwoWay())
	     );
	   // unlike the normal selection Adornment, this one includes a Button
	   myDiagram.nodeTemplate.selectionAdornmentTemplate =
	     $(go.Adornment, "Spot",
	       $(go.Panel, "Auto",
	         $(go.Shape, { fill: null, stroke: "blue", strokeWidth: 2 }),
	         $(go.Placeholder)  // this represents the selected Node
	       ),
	       // the button to create a "next" node, at the top-right corner
	       $("Button",
	         {
	           alignment: go.Spot.TopRight,
	           click: addNodeAndLink  // this function is defined below
	         },
	         $(go.Shape, "PlusLine", { desiredSize: new go.Size(6, 6) })
	       ) // end button
	     ); // end Adornment
	   // clicking the button inserts a new node to the right of the selected node,
	   // and adds a link to that new node
	   function addNodeAndLink(e, obj) {
	     var adorn = obj.part;
	     e.handled = true;
	     var diagram = adorn.diagram;
	     diagram.startTransaction("Add State");
	     // get the node data for which the user clicked the button
	     var fromNode = adorn.adornedPart;
	     var fromData = fromNode.data;
	     // create a new "State" data object, positioned off to the right of the adorned Node
	     var toData = { text: "new" };
	     var p = fromNode.location.copy();
	     p.x += 200;
	     toData.loc = go.Point.stringify(p);  // the "loc" property is a string, not a Point object
	     // add the new node data to the model
	     var model = diagram.model;
	     model.addNodeData(toData);
	     // create a link data from the old node data to the new node data
	     var linkdata = {
	       from: model.getKeyForNodeData(fromData),  // or just: fromData.id
	       to: model.getKeyForNodeData(toData),
	       text: "transition"
	     };
	     // and add the link data to the model
	     model.addLinkData(linkdata);
	     // select the new Node
	     var newnode = diagram.findNodeForData(toData);
	     diagram.select(newnode);
	     diagram.commitTransaction("Add State");
	     // if the new node is off-screen, scroll the diagram to show the new node
	     diagram.scrollToRect(newnode.actualBounds);
	   }
	   // replace the default Link template in the linkTemplateMap
	   myDiagram.linkTemplate =
	     $(go.Link,  // the whole link panel
	       { curve: go.Link.Bezier, adjusting: go.Link.Stretch, reshapable: true },
	       new go.Binding("curviness", "curviness"),
	       new go.Binding("points").makeTwoWay(),
	       $(go.Shape,  // the link shape
	         { strokeWidth: 1.5 }),
	       $(go.Shape,  // the arrowhead
	         { toArrow: "standard", stroke: null }),
	       $(go.Panel, "Auto",
	         $(go.Shape,  // the link shape
	           {
	             fill: $(go.Brush, "Radial",
	                     { 0: "rgb(240, 240, 240)", 0.3: "rgb(240, 240, 240)", 1: "rgba(240, 240, 240, 0)" }),
	             stroke: null
	           }),
	         $(go.TextBlock, "transition",  // the label
	           {
	             textAlign: "center",
	             font: "10pt helvetica, arial, sans-serif",
	             stroke: "black",
	             margin: 4,
	             editable: true  // editing the text automatically updates the model data
	           },
	           new go.Binding("text", "text").makeTwoWay())
	       )
	     );
	   // read in the JSON-format data from the "RDFModel" element
	   load_vis();
	 }

  // Show the diagram's model in JSON format
function save_vis() {
    //document.getElementById("RDFModel").value = myDiagram.model.toJson();
    RDFGraph = JSON.parse(document.getElementById("RDFModel").value);
   // myDiagram.isModified = false;
  }
  
function load_vis() { 
	removeTable("toc1") ;
	
	document.getElementById("RDFModel").value = JSON.stringify(RDFGraph);
    myDiagram.model = go.Model.fromJson(document.getElementById("RDFModel").value);
	//console.log(document.getElementById("RDFModel").value);
}

function initColumnJason(){ 
	RDFGraph["nodeKeyProperty"] = "id"; 
	var lst = [];
	var loc_x = 120;
	var loc_y = 10;
	var delta = 20;  
	for (var i=0; i<columnInfo.length; i++){ //
	//for (var i=0; i<5; i++){ //
		ele={}; 
		ele["id"] = i;
		loc_x += delta*i;
	//	loc_y += delta*i;
		loc = loc_x.toString()+' '+loc_y.toString();
		ele["loc"] = loc; 
		sampleStr = columnInfo[i]["Sample"].substring(0, MAX_STRING_LENGTH)+"..." ; 
		ele["text"] = i.toString()+'  '+columnInfo[i]["Col"]+'\n  '+sampleStr;
		lst.push(ele) ;
	} ;
	RDFGraph["nodeDataArray"] = lst;
	RDFGraph["linkDataArray"] = [];
}

function fixColumnJason(){

	console.log(RDFGraph);
}

function buildFinalJasonArr(table, list){

	for(var x =0; x < list.length; x++){
        var tempRDFGraph = {};

		tempRDFGraph["nodeKeyProperty"] = "id";
		var lst = [];

		for (var i=0; i<usefulTable.length; i++){ //

			//console.log(list[x][i]);
			if(list[x][i]==true){
				//for (var i=0; i<5; i++){ //
				ele={};
				ele["id"] = i;
				ele["name"]=usefulTable[i]["columnName"];
				ele["describe1"]=usefulTable[i]["columnList1"];
				ele["describe2"]=usefulTable[i]["columnList2"];
				ele["additional"]=usefulTable[i]["columnAdd"];

				lst.push(ele) ;

			}else {
				continue;
			}
		} ;

		tempRDFGraph["nodeDataArray"] = lst;
		tempRDFGraph["linkDataArray"] = [];

		RDFGraphArr.push(tempRDFGraph);
	}

	RDFGraph["nodeKeyProperty"] = "id";
	var lst = [];
	var loc_x = 120;
	var loc_y = 10;
	var delta = 20;

	for (var i=0; i<usefulTable.length; i++){ //
		//for (var i=0; i<5; i++){ //
		ele={};
		ele["id"] = i;
		loc_x += delta*i;
		//	loc_y += delta*i;
		loc = loc_x.toString()+' '+loc_y.toString();
		//ele["loc"] = loc;
		//console.log(usefulTable[i]);
		//console.log(usefulTable[i]["columnName"]);
		ele["name"]=usefulTable[i]["columnName"];
		ele["describe1"]=usefulTable[i]["columnList1"];
		ele["describe2"]=usefulTable[i]["columnList2"];
		ele["additional"]=usefulTable[i]["columnAdd"];

		//sampleStr = columnInfo[i]["Sample"].substring(0, MAX_STRING_LENGTH)+"..." ;
		//ele["text"] = i.toString()+'  '+columnInfo[i]["Col"]+'\n  '+sampleStr;
		lst.push(ele) ;
	} ;
	RDFGraph["nodeDataArray"] = lst;
	RDFGraph["linkDataArray"] = [];

	console.log(RDFGraphArr);
}

function fixColumnJason(){

	//console.log(RDFGraph);
}

//======ADD FEATURES TO COLUMNS========
/*
 * COLUMN, EXAMPLE (maximun 10 chars), 'Add English', 'Select Dim/Att/Val', 'Select Prefix (can add new)'
 */

function addColumnInfo(){
	
	removeTable("toc0");
	initColumnInfo(lines);
	initColumnJason();
	createTable(columnInfo)
	
}

function addColumnInfo2(){

	//removeTable("toc0");

	//console.log("in addColumnInfo2")
	getDataFromTable();
	buildFinalJasonArr(usefulTable,outputListArr);

	fixColumnJason();

	outputColumnJason();
	//createTable(columnInfo)

}

function onchangeFunc(){


}

function understandColumn2nd(row, idx){

	var rowRtn = row;
	var cell = document.createElement("td");
	var selectBox = document.createElement("select");

	//default option
	var option = document.createElement("option");

	//cell ID
	var cellId = "list".concat(idx.toString()).concat("_2");

	//get previous select id
	var cellIdPrivious = "list_".concat(idx.toString()).concat("_1");


	//console.log(cell);

	//add a string droplist

	selectBox.id=cellId;
	//default option
	var option2_1 = document.createElement("option");
	option2_1.text="1";
	selectBox.appendChild(option2_1);
	var option2_2 = document.createElement("option");
	option2_2.text="2";
	selectBox.appendChild(option2_2);
	cell.appendChild(selectBox);
	rowRtn.appendChild(cell);

	return rowRtn;
	//get previous select value
	//var x = document.getElementById(cellIdPrivious);
	//console.log(x);
	//var strValue = x.options[x.selectedIndex].va;

	//console.log(strValue);
}

//add droplist by given list
function setDroplistUniversal(optionList,defaultValue, selectBox){

	if(selectBox.options.length>0){
		var length = selectBox.options.length;

		for (i = length-1; i >-1; i--) {
			selectBox.remove(i);
		}
	}


	for (var i = 0; i < optionList.varData.length; i++){
		var option = document.createElement("option");
		option.text=optionList.varData[i];
		option.value=i;
		if(defaultValue == i){
			option.setAttribute("selected","selected");
		}
		selectBox.appendChild(option);
		selectBox.setAttribute("onChange","droplist1Onchange()");

	}

	return selectBox;

}

//first list
//dimensions
//measures
//attributes
function setDroplist(defaultValue, selectBox){

	var option1 = document.createElement("option");
	var option2 = document.createElement("option");
	var option3 = document.createElement("option");

	option1.text="Dimensions";
	option1.value=0;


	option2.text="Measures";
	option2.value=1;


	option3.text="Attributes";
	option3.value=2;




	if(defaultValue == 1){
		option1.setAttribute("selected","selected");
	} else if(defaultValue == 2){
		option2.setAttribute("selected","selected");
	} else if(defaultValue == 3){
		option3.setAttribute("selected","selected");
	}

	selectBox.appendChild(option1);
	selectBox.appendChild(option2);
	selectBox.appendChild(option3);
	selectBox.setAttribute("name","columnList1");
	selectBox.setAttribute("onChange","droplist1Onchange()");

	return selectBox;

}


//second list
//dimensions
//	1 Budgetary unit
//	2 Fiscal period
//	3 Fiscal year
//	4 Classification
//    4.1
//    4.2
//    4.3
//    4.4
//	5 Operation Character
//	6 Budget phase
//measures
//	1 Amount
//attributes
//	1 Currency
//	2 Taxes Included

function setDroplist2(firstBoxValue, defaultValue, selectBox){

	var option1 = document.createElement("option");
	var option2 = document.createElement("option");
	var option3 = document.createElement("option");
	var option4 = document.createElement("option");
	var option5 = document.createElement("option");
	var option6 = document.createElement("option");
	var option7 = document.createElement("option");


	option1.text="Budgetary unit";
	option1.value=0;


	option2.text="Fiscal period";
	option2.value=1;


	option3.text="Fiscal year";
	option3.value=2;




	if(defaultValue == 0){
		option1.setAttribute("selected","selected");
	} else if(defaultValue == 1){
		option2.setAttribute("selected","selected");
	} else if(defaultValue == 2){
		option3.setAttribute("selected","selected");
	}

	selectBox.appendChild(option1);
	selectBox.appendChild(option2);
	selectBox.appendChild(option3);
	selectBox.setAttribute("onChange","droplist1Onchange()");
	selectBox.setAttribute("name","columnList2");

	return selectBox;

}

function addCell(mark, idx){

	//add first cell
	var cell = document.createElement("td");
	//first cell id
	var cellId1 = "droplist_".concat(idx.toString()).concat("_1");
	//add first cell
	var cell2 = document.createElement("td");
	//first cell id
	var cellId2 = "droplist_".concat(idx.toString()).concat("_2");
	//droplist
	var selectBox = document.createElement("select");
	//droplist id
	selectBox.id=cellId1;
	//default option
	var option = document.createElement("option");

	if(mark == 0) {
		//cell.appendChild(document.createTextNode("-"));
	}
//	console.log(mark);
	if(mark<10){

		selectBox.id=cellId1;
		selectBox.setAttribute("name","columnList1");

		if(mark == 0) {
			selectBox = setDroplistUniversal(DROPLIST1,0,selectBox);
		}
		if(mark == 1) {
			selectBox = setDroplistUniversal(DROPLIST1,1,selectBox);
		}
		if(mark == 2) {
			selectBox = setDroplistUniversal(DROPLIST1,2,selectBox);

		}
		cell.setAttribute("name",DROPLIST1.varName);
		cell.appendChild(selectBox);

	}else{
		//droplist id
		selectBox.id=cellId2;
		selectBox.setAttribute("name","columnList2");
		if(mark == 10) {


			selectBox = setDroplistUniversal(DROPLIST2,0,selectBox);
			cell.setAttribute("name",DROPLIST2.varName);
			cell.appendChild(selectBox);
		}


		if(mark == 11) {
			selectBox = setDroplistUniversal(DROPLIST3,0,selectBox);
			cell.setAttribute("name",DROPLIST3.varName);
			cell.appendChild(selectBox);
		}

		if(mark == 12) {
			selectBox = setDroplistUniversal(DROPLIST2,3,selectBox);
			cell.setAttribute("name",DROPLIST2.varName);
			cell.appendChild(selectBox);
		}

		if(mark == 15) {
			selectBox = setDroplistUniversal(DROPLIST2,6,selectBox);
			cell.setAttribute("name",DROPLIST2.varName);
			cell.appendChild(selectBox);
		}


		if(mark == 16) {
			selectBox = setDroplistUniversal(DROPLIST4,0,selectBox);
			cell.setAttribute("name",DROPLIST4.varName);
			cell.appendChild(selectBox);
		}

	}


//console.log(cell);

	return cell;



}


//parameter　1: selected or not in default(boolean)
//parameter　２: row number
//parameter ３: column number of same element(checkbox)
function addCheckbox (checked, idx, count){
	//add checkbox cell
	var cell = document.createElement("td");
	//first cell id
	var cellId = "checkbox_".concat(idx.toString()).concat("_").concat(count.toString());

	//checkBox
	var checkBox = document.createElement("input");
	//checkBox id
	checkBox.id=cellId;
	checkBox.setAttribute("name","checkbox"+count.toString());
	//set type
	checkBox.setAttribute("type","checkbox");
	//checkBox.type="checkbox";

	if (true == checked){
		//set default checked
		checkBox.setAttribute("checked","checked");
	}


	cell.appendChild(checkBox);

	return cell;

}


function popupOnclick(cb){

	//popup page
	var submit = document.getElementById("submit");
	submit.setAttribute("value",cb.id)

	var title = document.getElementById("key_"+cb.id.substring(10)).textContent;
	document.getElementById("popTitle").textContent=title;


	var pop1_1 = document.getElementById("pop1_1");
	var pop1_2 = document.getElementById("pop1_2");
	var pop1_3 = document.getElementById("pop1_3");

	var newList1 = document.getElementsByName("list1");
	var newList2 = document.getElementsByName("list2");

	var droplist1 = document.getElementById("droplist_"+cb.id.substring(10)+"_1");
	var optionList1 = droplist1.options;


	if (optionList1[0].selected == true){
		newList1[0].checked=true;
	}

	if (optionList1[1].selected == true){
		newList1[1].checked=true;
	}

	if (optionList1[2].selected == true){
		newList1[2].checked=true;
	}


	document.getElementById('pop').style.display = "block";

	//console.log(document.getElementById("pop1_1").nextSibling);
	//console.log(document.getElementById("pop").innerHTML );

}

//function to hide Popup
function popHide(){
	document.getElementById('pop').style.display = "none";
}

function omitOnclick(cb){
	var row = document.getElementById("row_"+cb.id.substring(5));
	var lastCheckbox = row.lastChild.innerHTML.toString();
	//last id should in format 12_20
	var tempId = lastCheckbox.substring(20,lastCheckbox.indexOf('"',21))
	//get the last number from tempId should be 20 and then puls 1, reslut 21
	var numberOfCheckbox = parseInt(tempId.substring(tempId.indexOf("_")+1))+1;


	if (cb.checked == false){
		//recover row
		row.removeAttribute("bgcolor");
		//check every box
		for (var i = 0; i < numberOfCheckbox; i ++){
			var checkbox = document.getElementById("checkbox_"+cb.id.substring(5)+"_"+i);
			checkbox.disabled=false;
			checkbox.setAttribute("checked","checked");
		}
		document.getElementById("popButton_"+cb.id.substring(5)).disabled=false;

	} else {
		//delete row
		row.setAttribute("bgcolor","#FF0000");

		//uncheck every box
		for (var i = 0; i < numberOfCheckbox; i ++){
			var checkbox = document.getElementById("checkbox_"+cb.id.substring(5)+"_"+i);
			//TO BE DONE
			//ADD DISABLE ATTRIBUTE
			checkbox.disabled=true;
			checkbox.removeAttribute("checked")
		}
		document.getElementById("popButton_"+cb.id.substring(5)).disabled=true;
	}
}



function createTable(lstDic){
	var body = document.getElementsByTagName('body')[0];
    var table = document.getElementById("toc1");
    var tblBody = document.createElement("tbody");

	//store how many "amount" in the dadaset and their index
	var amountIndex = [];

	//create data part
	//display sample data
    for (var i=0; i<lstDic.length; i++) { //allTextLines.length
   
		var row = document.createElement("tr");
		row.id= "row_"+ i;
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
				cell.style.backgroundColor= "#79BAEC";
			}


			row.appendChild(cell);

		}

		//add comment area
		var commentCell = document.createElement("td");
		commentCell.setAttribute("class","hideANDseek");

		var comment = document.createElement("input");
		comment.type = "text";
		comment.setAttribute("name","columnAdd");
		var cellId = "comment_".concat(i.toString());
		comment.id = cellId;

		commentCell.appendChild(comment);
		row.appendChild(commentCell);


		//add omit option
		//omit one row if clicked
		{
			var omitCell = document.createElement("td");
			var omit = document.createElement("input");
			omit.type = "checkbox";
			//comment.placeholder = "your comment here";
			//omit.setAttribute("name", 'pop');
			omit.setAttribute("onclick", 'omitOnclick(this)');
			//cell id
			var cellId = "omit_".concat(i.toString());
			omit.id = cellId;
			omitCell.appendChild(omit);
			row.appendChild(omitCell);

		}



		//add droplist cell
		{
			var tagMark = understandColumn(dic, i);

			var cellAdd1 = addCell(tagMark[0], i);
			row.appendChild(cellAdd1);

			var cellAdd2 = addCell(tagMark[1], i);
			row.appendChild(cellAdd2);

			if (tagMark[1] == 11) {

				amountIndex.push(i);
				//console.log(amountIndex);
			}
		}

		//add pop up button
		{
			var buttonCell = document.createElement("td");
			var button = document.createElement("input");
			button.type = "button";
			//comment.placeholder = "your comment here";
			//button.setAttribute("name", 'pop');
			var cellId = "popButton_".concat(i.toString());
			button.id = cellId;
			button.setAttribute("name","columnAdd");
			button.value="more";
			button.setAttribute("onclick", 'popupOnclick(this)');
			buttonCell.appendChild(button);
			row.appendChild(buttonCell);

		}

        tblBody.appendChild(row);
    }


	//add checkbox
	//one amount value = one column checkbox
	for (var i=0; i<amountIndex.length; i++){
		var rowCount=0;

		var currentRow = tblBody.firstElementChild;


		//TO BE DONE
		//check blank cell
		//console.log(currentRow.childElementCount);
		var blankMark = currentRow.getElementsByTagName("select")
		//console.log(blankMark);
		if (0==1) {
			var cell = document.createElement("td");
			cell.appendChild(document.createTextNode("-"));
			currentRow.appendChild(cell);
			continue;
		}
		//END

		if (0 != amountIndex[0]){
			currentRow.appendChild(addCheckbox(true,rowCount, i));
			rowCount++;
		} else {
			if (i == amountIndex.indexOf(rowCount)){
				currentRow.appendChild(addCheckbox(true,rowCount, i));
			} else {
				currentRow.appendChild(addCheckbox(false,rowCount, i));
			}


			rowCount++;
		}


		while(currentRow.nextElementSibling!=undefined){
			currentRow = currentRow.nextElementSibling;

			var blankMark = currentRow.getElementsByTagName("select")
			if (blankMark.length == 0) {

				currentRow.appendChild(addBlankCell());
				rowCount++;
				continue
			}

			if (!amountIndex.includes(rowCount)){
				currentRow.appendChild(addCheckbox(true,rowCount, i));
				rowCount++;
			} else {
				if (i == amountIndex.indexOf(rowCount)){
					currentRow.appendChild(addCheckbox(true,rowCount, i));
				}else {
					currentRow.appendChild(addCheckbox(false,rowCount, i));
				}

				rowCount++;
			}
		}
	}


	table.appendChild(tblBody)
	body.appendChild(table)
	//console.log(document.getElementById("toc1").innerHTML );
}

function getDataFromTable(){
	var tableabc = document.getElementById("toc1");
	var row = document.getElementById("row_0");
	var lastCheckbox = row.lastChild.innerHTML.toString();
	//last id should in format 12_20
	var tempId = lastCheckbox.substring(20,lastCheckbox.indexOf('"',21))
	//get the last number from tempId should be 20 and then puls 1, reslut 21
	var numberOfCheckbox = parseInt(tempId.substring(tempId.indexOf("_")+1))+1;

	for (var i = 0; i < numberOfCheckbox ; i++){
		var checklist = document.getElementsByName("checkbox"+ i.toString());
		var res = [];
		for (j = 0 ; j < checklist.length; j++){

			res.push((checklist[j].checked == true)?true:false);

		}
		outputListArr.push(res);
	}
	//var columnId = document.getElementsByName("checkbox"+ i.toString());
	var columnName = document.getElementsByName("columnName");
	var columnList1 = document.getElementsByName("columnList1");
	var columnList2 = document.getElementsByName("columnList2");
	var columnAdd = document.getElementsByName("columnAdd");

	console.log(columnList2);
	//console.log(tableabcdf[1]);

	//build useful data table
	var keys = ['id', 'columnName','columnList1','columnList2','columnAdd'];
	for(var x = 0; x < columnName.length; x++){

		var listName = document.getElementById(columnList2[x].id).parentElement.getAttribute("name");
		if(DROPLIST1.varName==listName){
			var currentList = DROPLIST1.varData;
		}
		if(DROPLIST2.varName==listName){
			var currentList = DROPLIST2.varData;
		}
		if(DROPLIST3.varName==listName){
			var currentList = DROPLIST3.varData;
		}
		if(DROPLIST4.varName==listName){
			var currentList = DROPLIST4.varData;
		}


		var dic={}
		dic[keys[0]]=x;
		dic[keys[1]]=columnName[x].innerText;
		dic[keys[2]]=DROPLIST1.varData[columnList1[x].value];
		dic[keys[3]]=currentList[columnList2[x].value];
		//console.log(columnAdd[x]);
		dic[keys[4]]=columnAdd[x].value;

		usefulTable.push(dic);
	}


	//console.log(document.getElementById("toc1").innerHTML);
}


function initColumnInfo(lines){
	
	var keys = ['Col', 'Sample']
	for (var i=0; i< lines.length; i++) {
		row = lines[i]
		key = keys[i]
		for (var j=0; j<row.length; j++){
			if (columnInfo.length <= j){
				var dic={}
				dic[key]=row[j]
				columnInfo.push(dic)
			}
			else{
				columnInfo[j][key] = row[j]
				//document.write(j);
			}
		}
	}
}



function removeTable(id)
{
    var tbl = document.getElementById(id);
    if(tbl) tbl.parentNode.removeChild(tbl);
}


//======READ CSV FILE================
function handleFiles(files) {

	//clean table first
	//TBD

	FILE2READ=files;

    // Check for the various File API support.
    if (window.FileReader) {
        // FileReader are supported.
    	raw_filename=files[0].name;
        getAsText(files[0]);
    } else {
        alert('FileReader are not supported in this browser.');
    }
  }

function getAsText(fileToRead) {
    var reader = new FileReader();
    // Read file into memory as UTF-8      
    reader.readAsText(fileToRead);
    // Handle errors load
    reader.onload = loadHandler;
    reader.onerror = errorHandler;
  }

function loadHandler(event) {
    var csv = event.target.result;
    processData(csv);
  }

function processData(csv) {

	  var fileDisplayArea = document.getElementById('fileDisplayArea');
	  var body = document.getElementsByTagName('body')[0];
      var allTextLines = csv.split(/\r\n|\n/);
	  var table = document.getElementById("toc0");
	  var tblBody = document.createElement("tbody");

	  //clean previous input
		var tRow = document.getElementById("toc0");
		var tTr = tRow.getElementsByTagName("tr")
		if(tTr.length==2){
			document.getElementById("toc0").deleteRow(1);
			document.getElementById("toc0").deleteRow(0);
		}
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

		for (var i=0; i<3; i++) {
		  //allTextLines.length
    	  var row = document.createElement("tr");

			var str=allTextLines[i];

			if(delimiterMark==','){
				//console.log(str);
				str = replaceInsideComma(str);
				str = str.replace(/;/g,"REPLACE_MARK");

			}else {
				str = str.replace(/,/g,"REPLACE_MARK");

			}

          var data = str.split(delimiterMark);
			//console.log(data);
			if(delimiterMark==','){
				 for (var j = 0 ; j < data.length ; j++){
					 data[j] = data[j].replace(/REPLACE_MARK/g,';');
					 data[j] = data[j].replace(/INSIDE_COMMA_MARK/g,',');
				 }
			}else {
				for (var j = 0 ; j < data.length ; j++){

					data[j] = data[j].replace(/REPLACE_MARK/g,',');
				}
			}
			//---SPLIT DATA END-----

          var tarr = [];
		  if(i==0){
			  var title1 = document.createElement("td");
			  title1.appendChild(document.createTextNode("column name"));
			  row.appendChild(title1);

		  } else {
			  var title2 = document.createElement("td");
			  title2.appendChild(document.createTextNode("sample data"));
			  row.appendChild(title2);
		  }
          for (var j=0; j<data.length; j++) { //data.length

            	  var cell = document.createElement("td");
                  tarr.push(data[j]);
                  cell.appendChild(document.createTextNode(data[j]));
                  row.appendChild(cell);
          }
          lines.push(tarr);
          tblBody.appendChild(row);


      }
    table.appendChild(tblBody)
    body.appendChild(table)
  }

  function errorHandler(evt) {
    if(evt.target.error.name == "NotReadableError") {
        alert("Canno't read file !");
    }
  }


//======STEP1 BACKWARD FILE================

function step1Backward(){

	removeTable("toc1");

	var body = document.getElementsByTagName('body')[0];
	var table = document.createElement("table");
	table.id="toc0";
	table.className="toc"
	table.border=1

	body.appendChild(table);

	handleFiles(FILE2READ);

}

function droplist1Onchange(){

	var table = document.getElementsByTagName('toc1')[0];


}


function droplist2Onchange(){

	var table = document.getElementsByTagName('toc1')[0];


}

function addBlankCell(){

	var cell = document.createElement("td");
	cell.appendChild(document.createTextNode("-"));
	return cell;
}



function submitClick(cb){

	var pop1_1 = document.getElementById("pop1_1");
	var pop1_2 = document.getElementById("pop1_2");
	var pop1_3 = document.getElementById("pop1_3");

	//list in pop page
	var newList1 = document.getElementsByName("list1");
	var newList2 = document.getElementsByName("list2");

	//list in original page
	var droplist1 = document.getElementById("droplist_"+cb.getAttribute("value").substring(10)+"_1");
    var optionList1 = droplist1.options;
	var droplist2 = document.getElementById("droplist_"+cb.getAttribute("value").substring(10)+"_2");
	var optionList2 = droplist2.options;
	var list1Parent = droplist2.parentElement;

	if (newList1[0].checked == true){
		optionList1[0].selected=true;
		setDroplistUniversal(DROPLIST2,0,droplist2);
		droplist2.parentElement.setAttribute("name",DROPLIST2.varName);
	}

	if (newList1[1].checked == true){
		optionList1[1].selected=true;
		//list1Parent.setAttribute("name","dplist2");
		setDroplistUniversal(DROPLIST3,0,droplist2);
		droplist2.parentElement.setAttribute("name",DROPLIST3.varName);
	}

	if (newList1[2].checked == true){
		optionList1[2].selected=true;
		//list1Parent.setAttribute("name","dplist3");
		setDroplistUniversal(DROPLIST4,0,droplist2);
		droplist2.parentElement.setAttribute("name",DROPLIST4.varName);
	}

	for (var i = 0 ; i < newList2.length; i++){
		if (newList2[i].checked == true){
			optionList2[i].selected=true;
		}

	}

	var comment = document.getElementById("commentarea").value;
	console.log(comment);

	document.getElementById("comment_"+cb.getAttribute("value").substring(10)).value=comment;

	console.log(document.getElementById("comment_"+cb.getAttribute("value").substring(10)).value);

	releaseSub(this);
	document.getElementById('pop').style.display = "none";
}

function releaseSub(cb) {

	if (cb.checked == true){
		document.getElementById("pop3_1").disabled=false;
		document.getElementById("pop3_1").checked=true;
		document.getElementById("pop3_2").disabled=false;
		document.getElementById("pop3_3").disabled=false;
		document.getElementById("pop3_4").disabled=false;
	}else {
		document.getElementById("pop3_1").disabled=true;
		document.getElementById("pop3_1").checked=false;
		document.getElementById("pop3_2").disabled=true;
		document.getElementById("pop3_2").checked=false;
		document.getElementById("pop3_3").disabled=true;
		document.getElementById("pop3_3").checked=false;
		document.getElementById("pop3_4").disabled=true;
		document.getElementById("pop3_4").checked=false;

	}

}

function dimenstionsClick(cb){
	document.getElementById("pop2_1").nextSibling.nodeValue=DROPLIST2.varData[0];
	document.getElementById("pop2_2").nextSibling.nodeValue=DROPLIST2.varData[1];
	document.getElementById("pop2_2").style.visibility="visible";
	document.getElementById("pop2_3").nextSibling.nodeValue=DROPLIST2.varData[2];
	document.getElementById("pop2_3").style.visibility="visible";
	document.getElementById("pop2_4").nextSibling.nodeValue=DROPLIST2.varData[3];
	document.getElementById("pop2_4").style.visibility="visible";
	document.getElementById("pop2_5").nextSibling.nodeValue=DROPLIST2.varData[4];
	document.getElementById("pop2_5").style.visibility="visible";
	document.getElementById("pop2_6").nextSibling.nodeValue=DROPLIST2.varData[5];
	document.getElementById("pop2_6").style.visibility="visible";
	document.getElementById("pop2_7").nextSibling.nodeValue=DROPLIST2.varData[6];
	document.getElementById("pop2_7").style.visibility="visible";

}
function measuresClick(cb){
	document.getElementById("pop2_1").nextSibling.nodeValue=DROPLIST3.varData[0];
	document.getElementById("pop2_1").style.visibility="visible";
	document.getElementById("pop2_2").nextSibling.nodeValue=" ";
	document.getElementById("pop2_2").style.visibility="hidden";
	document.getElementById("pop2_3").nextSibling.nodeValue=" ";
	document.getElementById("pop2_3").style.visibility="hidden";
	document.getElementById("pop2_4").nextSibling.nodeValue=" ";
	document.getElementById("pop2_4").style.visibility="hidden";
	document.getElementById("pop2_5").nextSibling.nodeValue=" ";
	document.getElementById("pop2_5").style.visibility="hidden";
	document.getElementById("pop2_6").nextSibling.nodeValue=" ";
	document.getElementById("pop2_6").style.visibility="hidden";
	document.getElementById("pop2_7").nextSibling.nodeValue=" ";
	document.getElementById("pop2_7").style.visibility="hidden";

}
function attributesClick(cb){
	document.getElementById("pop2_1").nextSibling.nodeValue=DROPLIST4.varData[0];
	document.getElementById("pop2_1").style.visibility="visible";
	document.getElementById("pop2_2").nextSibling.nodeValue=DROPLIST4.varData[1];
	document.getElementById("pop2_2").style.visibility="visible";
	document.getElementById("pop2_3").nextSibling.nodeValue=" ";
	document.getElementById("pop2_3").style.visibility="hidden";
	document.getElementById("pop2_4").nextSibling.nodeValue=" ";
	document.getElementById("pop2_4").style.visibility="hidden";
	document.getElementById("pop2_5").nextSibling.nodeValue=" ";
	document.getElementById("pop2_5").style.visibility="hidden";
	document.getElementById("pop2_6").nextSibling.nodeValue=" ";
	document.getElementById("pop2_6").style.visibility="hidden";
	document.getElementById("pop2_7").nextSibling.nodeValue=" ";
	document.getElementById("pop2_7").style.visibility="hidden";

}