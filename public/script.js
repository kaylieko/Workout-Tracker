document.addEventListener("DOMContentLoaded", bindButtons);

var appURL = "http://flip3.engr.oregonstate.edu:4486";

/* Populate with new values from database */
var req = new XMLHttpRequest();
req.open("GET", appURL +"/getReq", true);
req.addEventListener("load", function(){
    	if (req.status < 400){
        	var response = JSON.parse(req.responseText);
       		var newTable = document.body.appendChild(buildTable(response));
    	} else {
        	console.log("Error in network request");
    	}
});
req.send(null); //send JSON string formatted object


/* Write some client-side JS to have that 
submit button send a GET request to the server-side code.*/
function bindButtons(){
   document.getElementById("submitNew").addEventListener("click", function(event){
	/* Ensure that the name field holds value */
    	if (document.getElementById("name").value == ""){
		alert ("Cannot submit without exercise name");
		
	}
        else {
		var req = new XMLHttpRequest();
        	var payload = {};
               	payload.name = document.getElementById("name").value;
               	payload.reps = document.getElementById("reps").value;		
        	payload.weight = document.getElementById("weight").value;
        	var lbs  = document.getElementsByName("units"); //get list of radio buttons
        	for (var i = 0; i < lbs.length; i++) {		//loop through list of radio buttons
            		if (lbs[i].checked) {			//if the radio button is checked
                		payload.units = Number(lbs[i].value);//hold its value 
                		break;  
           		} 
        	}
		payload.date = document.getElementById("date").value;
       
		/* Request data via a POST (app.post('/insert')) */
        	req.open("POST", appURL + "/insert", true);
        	req.setRequestHeader("Content-type", "application/json");
		/* Add Event listener for the response */
        	req.addEventListener("load", function(){
            		if (req.status >= 200 && req.status < 400){
                		var response = JSON.parse(req.responseText);
                		var newTable = document.body.appendChild(buildTable(response));
                		document.body.removeChild(document.getElementById("workOuts"));
				//console.log("Success! client side code talking to server side code");
            		} 
			else {
                		console.log("Error in network request");
           		}
		});

		/* send the request with the data entered in the form */
        	req.send(JSON.stringify(payload));
        	event.preventDefault();
	}
    });
}

/* Use that database response that you get back (still a static query) 
to build a table using the DOM */
function buildTable(response) {

  	var newTable = document.createElement("table");
  	var headRow = document.createElement("tr");
	
  	newTable.appendChild(headRow);	
  	newTable.id = "workOuts";
	
	/* Loop through the header row and put the name on each head columns
	The header should list all the columns 
	id should not be displayed in the header or in the table itself. */
  	values = ["Name", "Reps", "Weight", "lbs", "Date"];
  	for (var i = 0; i < values.length; i++) {
    		var heading = document.createElement("th");
    		heading.textContent = values[i];
        	headRow.appendChild(heading);
  	}
	
	/* Loop through the table body */
  	for (var i = 0; i < response.length; i++) {
      		var row = document.createElement("tr");
      		var id = response[i]["id"];
      		columns = ["name", "reps", "weight", "lbs", "date"];
      		for (var j = 0; j <= 4; j++) {
          		var cell = document.createElement("td");
         		cell.textContent = response[i][columns[j]];
          		cell.style.textAlign = "center";
          		cell.style.border = "1px solid black";
          		row.appendChild(cell);
      		}

	/* https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute */
	/* http://stackoverflow.com/questions/3919291/when-to-use-setattribute-vs-attribute-in-javascript */
	/* http://www.allsolution24.com.bd/webdesign/tutorial/jsref/met_element_setattribute.html */

	/* Every row should have a form holding the edit and delete buttons.*/
      	var newForm = document.createElement("form");
      	newForm.setAttribute("method","post");

	/* Add a delete button */
	var deleteRow = document.createElement("input");
      	deleteRow.setAttribute("type", "button");
     	deleteRow.setAttribute("name", "delete");
      	deleteRow.setAttribute("value", "Delete");
      	deleteRow.setAttribute("onclick", "deleteEntry(this)");  	
      	newForm.appendChild(deleteRow); 

	/* The form provided above should also have an input of type="hidden" 
	which holds the id of the row so you can easily pass that 
	information to the server to delete or edit the row. */
	var hidden = document.createElement("input");
     	hidden.setAttribute("type", "hidden");
      	hidden.setAttribute("name", "id");
      	hidden.setAttribute("value", id);
      	newForm.appendChild(hidden);

	/* Add a edit button (Append the ID to the form) */
 	var editRow = document.createElement("input");
      	editRow.setAttribute("type", "button");
      	editRow.setAttribute("name", "edit");
      	editRow.setAttribute("value", "Edit");
      	editRow.setAttribute("onclick", "editEntry(this)");  
      	newForm.appendChild(editRow);

      	row.appendChild(newForm); //Add form to row     
        newTable.appendChild(row);//Add row to table

  	}

  	return newTable;
}

function editEntry(editButton) {
        window.location=appURL +"/edit?id="+ editButton.previousElementSibling.value;	
}


/* Hook the delete button up to a request, send it to the server */
/* Hitting the delete button should immediately remove the row from the table and from the database.*/
function deleteEntry(deleteButton) {
    	var req = new XMLHttpRequest();
    	var payload = {};
    	payload.id = deleteButton.nextElementSibling.value;

	/* Request data via a POST (app.post(/'delete')) */	
    	req.open("POST", appURL+"/delete", true);
    	req.setRequestHeader("Content-type", "application/json");
    	req.addEventListener("load", function(){
        	if (req.status >= 200 && req.status < 400){
            		var response = JSON.parse(req.responseText);
            		var newTable = document.body.appendChild(buildTable(response));
            		document.body.removeChild(document.getElementById("workOuts"));
        	}
		else {
            		console.log("Error in network request");
        	}
	});
    	req.send(JSON.stringify(payload));
    	event.preventDefault();
}




