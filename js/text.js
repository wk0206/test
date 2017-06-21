 
function handleFiles(files) {
    // Check for the various File API support.
    if (window.FileReader) {
        // FileReader are supported.
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
      var lines = [];
      var table = document.createElement("table");
      var tblBody = document.createElement("tbody");
      
      for (var i=0; i<2; i++) { //allTextLines.length
    	  var row = document.createElement("tr");
          var data = allTextLines[i].split(';');
          var tarr = [];
          for (var j=0; j<data.length; j++) { //data.length
            	  var cell = document.createElement("td");    
                  tarr.push(data[j]); 
                  cell.appendChild(document.createTextNode(data[j])); 
                  row.appendChild(cell);
          }
          lines.push(tarr); 
          tblBody.appendChild(row);
      }
    console.log(lines);
    table.appendChild(tblBody)
    body.appendChild(table)
    alert(lines)
    fileDisplayArea.innerHTML=table;
  }

  function errorHandler(evt) {
    if(evt.target.error.name == "NotReadableError") {
        alert("Canno't read file !");
    }
  }

/*function() {
		var fileInput = document.getElementById('fileInput');
		var fileDisplayArea = document.getElementById('fileDisplayArea');
		var csvDisplayArea = document.getElementById("dvCSV"); 
		
		
		fileInput.addEventListener('change', function(e) {
		//	var file = fileInput.files[0];
			//var textType = ".csv/";
			alert(fileInput) 
			//if (file.type.match(textType)) {
				var reader = new FileReader(); 
				reader.onload = function(e) {
					
					var table = "<table />";
					alert(e.target.result) 
			          var rows = e.target.result.split("\n");
			          alert(rows) 
			          for (var i = 0; i < 2; i++) { //rows.length
			              var row = "<tr />";
			              var cells = rows[i].split(",");
			              for (var j = 0; j < cells.length; j++) {
			                  var cell = "<td />";
			                  cell.html(cells[j]);
			                  alert(cells[j]) 
			                  row.append(cell);
			              }
			              table.append(row);
			              alert(table) 
			          }
			          csvDisplayArea.html('');
			          csvDisplayArea.append(table);
			      }
			      reader.readAsText(fileInput[0].files[0]);
			      alert(fileInput[0].files[0])
		});
}
*/