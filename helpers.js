//Get CanvasSize, called when window is resized
function calCanvassize(){
    var height = $('#sigma-container').height();
    var width = $('#sigma-container').width();
   	var marginWidth = width-(width*4/10); //remove 30%
   	var marginHeight = height-(height*2/10); //remove 20%
   	
   	//In big screens we have layout in right side so we should have less width
   	if($( window ).width() >= 1000){
	    var extramarginWidth = width-(width*1/4);
	    cameraX = 200;	
    }
    else{
	   var extramarginWidth = marginWidth;
	   cameraX = 0;
    }
    	
    window.canvasSize = { 
    	width: width, 
    	height: height,
    	marginHeight: marginHeight, 
    	marginWidth: marginWidth,
    	extramarginWidth: extramarginWidth,
    	cameraX: cameraX   				
    };
    console.log(window.canvasSize);
}

//Reset view everytime we do a search
function resetView(){
	//First remove all edges that have been added
	s.graph.edges().forEach(function(e) {
		if(e.type == "merge_by"){
			s.graph.dropEdge(e.id);
		}
		else{
            e.color = e.originalColor;
        }
    });

    //Then show all nodes and remove onlylabel node + merge_by nodes
	s.graph.nodes().forEach(function(n) {
  		if(n.type == "onlylabel" || n.type == "merge_by"){
			s.graph.dropNode(n.id);
		}
		else{
			n.type = "def";
  			n.hidden = false;
  			n.x = n.orgX;
			n.y = n.orgY;
			n.color = n.originalColor;
			n.size = n.orgSize;
  		}
	});
	//Set settings back to original
	s.settings({autoRescale: true, scalingMode:"inside"});
	//Undisable all filters
	$(":disabled").prop('disabled',false).trigger("chosen:updated");
}

//Reset Camera by button
function resetCamera(){
	resetSelected(); //Remove user selctions if any
	
	var camera = s.camera;
    sigma.misc.animation.camera(
      camera,
      {x: window.canvasSize.cameraX, y: 0, angle: 0, ratio: 1},
      {duration: 150}
    );
}

//Reset selected Node
function resetSelected(){
	//change the sigma background back
	$("#sigma-container").css("background-color", "#f2f0e9");
	//hide details view:
	$("#details_view").hide();
	s.graph.nodes().forEach(function(n) {
		if(n.type == "highlight"){
			n.type = "def";
			n.color = n.originalColor;
		}
	});
	s.refresh();
}

//Capture canvas to SVG
function captureSVG(){
	var svg = s.toSVG({
		labels: true,
  		classes: false,
  		data: true,
  		download: true
	});
	savetoserver("svg", svg);
}

//Capture canvas to png. Only works with canvas render.
function captureCanvas(){
	var canvases = $('#sigma-container').children();
	var ctx0 = canvases[0].getContext('2d');
	var ctx1 = canvases[1].getContext('2d');
	ctx0.drawImage(canvases[1], 0, 0);
	var img    = canvases[0].toDataURL();
	var html = '<img src="'+img+'"/>';
	
	var height = window.canvasSize.height+50;
	var width = window.canvasSize.width+50;
	var popupWindow = window.open("","","menubar=0,scrollbars=0,height="+height+",width="+width+"");
	console.log(window.canvasSize.marginHigth);
	popupWindow.document.write(html);
	popupWindow.document.close();
}

//Save copy to server for monitoring
function savetoserver(filetype, data){
	$.ajax({
  		type: "POST",
		url: "http://www.cadm.dk/elite/savetoserver.php",
	  	data: {filetype: filetype, data:data}
  		/*success: success,
  		dataType: dataType*/
	});
	
	//Send info to Google Analytics
	ga('send', 'event', filename, 'download');
}

//Get URL from browser location
function getUrlParameter(sParam){
    var getVar = window.location.hash;
    if(getVar == ""){
    	getVar = location.search;
    }
    var getVar = getVar.substr(getVar.indexOf("?") + 1);
    if(getVar.substring(getVar.length-1) == "/"){
		getVar = getVar.slice(0,-1);
	}
    var sURLVariables = getVar.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];
        }
        else{
        	return "";
        }
    }
}   

//Normalize values to lay within 100
function normalize(values){
	var normalize = new Array();
	Object.keys(values).forEach(function(value){
		normalize.push(values[value]);
	});
					
	var ratio = Math.max.apply( Math, normalize ) / 100;

	Object.keys(values).forEach(function(value){
		values[value] = Math.round( values[value] / ratio );
	});
	return values;
}

//Fill the detail info box
function fillDetails(node, neighbors){
	var gephiCols = window.ini.details_view.gephiCol;
	console.log(node.attributes);
	var labels = window.ini.details_view.label;
	$("#details_view").html('<strong>'+node.label+'</strong><br>');
	gephiCols.forEach(function(col, i){
		if(col == "connections"){
			var connections = Object.keys(neighbors).length;
			$("#details_view").append(''+labels[i]+': '+connections+'<br>');
		}
		else{
			$("#details_view").append(''+labels[i]+': '+node.attributes[col]+'<br>');
		}
	});
	$("#details_view").show( );
}

//Disable one or more filters
function disableFilters(filters){	
	filters.forEach(function(filter){
		$("#"+filter+"").prop('disabled',true).trigger("chosen:updated");
	});	
}

//Update status message (for debugging)
function updateStatus(state) {
	var status = $('#status');

	if(state == "complete"){
		status.removeClass("btn-info").addClass("btn-success");
		status.button(state);
		status.delay(1200).fadeTo( "slow" , 0.6)
	}
	if(state == "error"){
		status.removeClass("btn-info").addClass("btn-danger");
		status.button(state);
	}
}

//Function to extract all unique values for a specific attribute in given set of nodes   
function getUniquetype(nodes, attribute){
	var unique_attributes = [];
	nodes.forEach(function(n) { //Now run through all node and record unique type
		if(n.attributes[attribute]){ //Is this value in this node and not undefined					
				unique_attributes.push(n.attributes[attribute]); 
		}
	});
	
	//Now sort 
	if(!isNaN(unique_attributes[0])){ //Is a number
		unique_attributes = unique_attributes.sort(function(a, b){return a-b});
	}
	else{
		unique_attributes = unique_attributes.sort();
	}
	//...and remove all duplicates
	unique_attributes = _.uniq(unique_attributes, true); //...And removing all duplicates
	return unique_attributes;	
}

//Get intersections between two arrays
function getIntersection(arrays){
	var result = arrays.shift().reduce(function(res, v) {
    if (res.indexOf(v) === -1 && arrays.every(function(a) {
        return a.indexOf(v) !== -1;
    })) res.push(v);
    return res;
	}, []);
	return result;
}

//Apply a size to node relative to their degree.
function degreeSize(option) {
    return function(n) {
      if (option === 'original')
        n.size = n.orgSize
      else if (option === 'degree')
        n.size = 1 + 2 * Math.sqrt(s.graph.degree(n.id));
      else if (option === 'indegree')
        n.size = 1 + 2 * Math.sqrt(s.graph.degree(n.id, 'in'));
      else if (option === 'outdegree')
        n.size = 1 + 2 * Math.sqrt(s.graph.degree(n.id, 'out'));
    };
}

/*function edgeWeight(option) {
    return function(e) {
      if (option === 'original')
        e.size = e.orgSize
      else if (option === 'sum')
        e.size = 1 + 2 * Math.sqrt(s.graph.degree(e.id));
      else if (option === 'inversesum')
        e.size = 1 + 2 * Math.sqrt(s.graph.degree(e.id, 'in'));
      else if (option === 'outdegree')
        e.size = 1 + 2 * Math.sqrt(s.graph.degree(e.id, 'out'));
    };
}*/

//Create helper method for determining neighbor nodes
sigma.classes.graph.addMethod('neighbors', function(nodeId) {
    var k,
        neighbors = {},
        index = this.allNeighborsIndex[nodeId] || {};

    for (k in index)
        neighbors[k] = this.nodesIndex[k];

    return neighbors;
});

