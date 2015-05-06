//3 modes: 0 = show titel with link, 1: hide link, but show titel, 2: graph not loaded.
function enableGraphChanger(mode){
	//Graph changer
	$( "#dialog" ).dialog({
    	modal: true,
      	width: 500,
      	autoOpen: false,
      	show: {
		effect: "blind",
			duration: 500
		},
		hide: {
			effect: "explode",
			duration: 500
		}
	});
	
	if(mode != 2){ //Add subtitel	
		if(mode == 1){
    		$("#titel").append(' <small> - '+ini.graph_header+'</small>');	
		}
		else{
			$("#titel").append('<small> - <a id="graph_changer" href="#">'+ini.graph_header+'</a><span class="glyphicon glyphicon-book"></span></small>');
    	}
		$( '.ui-dialog-titlebar-close')[0].style.display = 'inline';
	}
	else{ //Hide close button	
			$( '.ui-dialog-titlebar-close')[0].style.display = 'none';
	}	
    
	$( "#graph_changer" ).click(function() {
    	$( "#dialog" ).dialog( "open" );
    });
}

function changeLogo(logo, url){
console.log("hej");
	$("#logos").hide();
	$("#footer").append('<div class="col-md-2 col-md-offset-2 bottom-row-item"><p><i><small>A production by:</small></i></p><a id="logo_generic" href="'+url+'" target="_blank" class="bottom-row-brand "><img height="50px" src="'+logo+'"></a></div></div>');			
}
function selectGraph(full_ini){
	Object.keys(full_ini).forEach(function(key){
		if(key != "globalsettings"){
			$("#graphs").append('<div class="'+ key +' basicgraph" ><a id="'+key+'" href="#"><h4>'+full_ini[key].graph_header+'</h4><img src='+(full_ini[key].logo_url == "" ? "'css/images/annalogo.png'"+" id='annalogo2'" : full_ini[key].logo_url)+' class="logo"/></a></div>');
			$('#'+key+'').click( function(e) { 
				e.preventDefault(); //Prevent the link from asking for #
				url = location.href +'#?graph='+key;
				window.location.href = url; //Set the url
				location.reload(); //And reload it
			});
		}
	});
}

//Get CanvasSize, called when window is resized
function calCanvassize(){
	//Get height from window and width from sigma container
	var height = $( window ).height()-200;
    $("#sigma-container").height(height);
    var width = $('#sigma-container').width();
   	
   	//Calculate margin
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
    s.refresh();
}

//Reset view everytime we do a search
function resetView(){
	//First remove all edges that have been added and change color and label back
	s.graph.edges().forEach(function(e) {
		if(e.type == "merge_by"){
			s.graph.dropEdge(e.id);
		}
		else{ //
            e.color = e.originalColor;
            e.label = "";
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
			n.active = false;
  		}
	});
	//Set settings back to original
	$("#details_view").hide();
	$("#sigma-container").css("background-color", "#f2f0e9");
	s.settings({autoRescale: true, scalingMode:"inside"});
	//Undisable all filters
	$(":disabled").prop('disabled',false).trigger("chosen:updated");
}
	
//Reset Camera by button
function resetCamera(){
	var camera = s.camera;
    sigma.misc.animation.camera(
      camera,
      {x: canvasSize.cameraX, y: 0, angle: 0, ratio: 1},
      {duration: 250}
    );
}

function activateCapture(){
	Object.keys(globalsettings.captures).forEach(function(key){
		if(globalsettings.captures[key]){
			$('#'+key+'').removeClass('hide');
		}
	});
	
	$( "#savetoCanvasModal" ).dialog({
    	modal: true,
      	width: 900,
      	autoOpen: false,
      	show: {
        	effect: "blind",
        	duration: 500
      	},
      	hide: {
        	effect: "explode",
        	duration: 500
      	}
   	});
	
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

function changeRender(type){
    for(i in s.renderers) {
            s.renderers[i].clear();
            s.killRenderer(i);
    }
	s.addRenderer({container: 'sigma-container', type: type});
	s.render();
	s.refresh();
}

//Capture canvas to png. Only works with canvas render.
function captureCanvas(){
	
	$("#ajaxloader").fadeIn( "fast");
	$("#dim").fadeIn( "fast");	
	
	//TODO: If sentencen which makes that only changes render if not canvas is set already.
	changeRender("canvas");
	
	
	setTimeout(function () {
	var canvases = $('#sigma-container').children();
	
	var ctx0 = canvases[3].getContext('2d');
	var ctx1 = canvases[4].getContext('2d');
	
	ctx0.drawImage(canvases[4], 0, 0);
	var img    = canvases[3].toDataURL();
	var html = '<img width="900px" src="'+img+'"/>';

	var height = canvasSize.height+50;
	var width = canvasSize.width+50;

	$( "#savetoCanvasModal" ).empty();	
	$( "#savetoCanvasModal" ).append(html);
	$( "#savetoCanvasModal" ).dialog( "open" );

	savetoserver("png", img);
	//Set the render back. 
	changeRender("webgl");

 	}, 2500);	
}

function createEmbed(){
	$("#ajaxloader").fadeIn( "fast");
	$("#dim").fadeIn( "fast");	
	
	//Create json
	var nodes = s.graph.nodes();
    var edges = s.graph.edges();
	var graph = {};
	graph['nodes'] = nodes;
	graph['edges'] = edges;
	
	savetoserver("json", JSON.stringify(graph));

}

//Save copy to server for monitoring
var savetoserver = function savetoserver(filetype, data){

	if (document.location.hostname != "localhost"){ //We cannot make contact if we are on a localhost
		var location = window.location.href;
    	location = location.substring(0, location.lastIndexOf('/'));
		requestlocation = location+"/savetoserver.php";
		
		$.ajax({
  		type: "POST",
		url: requestlocation,
	  	data: {filetype: filetype, data:data}
	  	}).done(function(response) {    		
  			//Send info to Google Analytics
  			ga('send', 'event', filetype, location+"/"+response);
  			
  			
  			if(filetype == "json"){
				
				var url = window.location.href;
				url = url.substring(0, url.lastIndexOf('/'));
				url = url + '/embedder.php?json=' + encodeURIComponent(response);
	
				var html = '<textarea cols="100" readonly><iframe width="820" height="620" src="'+url+'" frameborder="0" allowfullscreen></iframe></textarea>';

				$( "#savetoCanvasModal" ).empty();	
				$( "#savetoCanvasModal" ).dialog('option', 'title', 'Embed kode genereret');
				$( "#savetoCanvasModal" ).html(html);
				$( "#savetoCanvasModal" ).dialog( "open" );
			
				$("#embed").val( iframe );
				$("#embed").fadeTo( "fast" , 1);
				updateStatus("embed");
  			
  				console.log(response);
			}
  		});
	}
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
       //Uncomment if you get problem
       // if (sParameterName[0] == sParam) 
        //{
            return sParameterName[1];
        //}
        //else{
    //    	return "";
      //  }
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
	var container = ini.details_view;
	container.forEach(function(info, i){
		if(i == 0){
			$("#details_view").html('<strong>'+node.attributes[info.gephiCol]+'</strong><br>');
		}
		else if(info.gephiCol == "connections"){
			var connections = Object.keys(neighbors).length;
			$("#details_view").append(''+info.label+': '+connections+'<br>');
		}
		else{
			if(node.attributes[info.gephiCol] != "" & node.attributes[info.gephiCol] !== undefined ){
				$("#details_view").append(''+info.label+': '+node.attributes[info.gephiCol]+'<br>');
			}
		}
	});
	$("#details_view").show( );
}

//Remove spaces from window ini file 
function removeSpaces(filters){	
	filters.forEach(function(filter){
		ini[filter].forEach(function(line, i){
			if(!_.isArray(line.gephiCol)){
				
				ini[filter][i].gephiCol = line.gephiCol.replace(/ /g,"_");
			}
		});
	});
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
	if(state == "embed"){
		status.removeClass("btn-info").addClass("btn-success");
		status.button(state);
		status.fadeTo( "fast" , 1);
		status.button(state);
		
		$('#embed').delay(20000).fadeTo( "slow" , 0, function(){
			status.button("complete");
			status.delay(1200).fadeTo( "slow" , 0.6);
		});
	}
}

//Show menu
function showMenu(by){
	var id = $("#"+by+"_container").parent().attr('id');
	$("#"+by+"_container").removeClass('hide')
	$("#"+id+"_menu").removeClass('hide');
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

//Returns dropdown for singleSelect filter 
function getDropdown(_by){
	
	var dropdown = [];
	for (i = 0; i < _by.length; i++) { //Then run through the filters of _by type
		dropdown.push(_by[i].gephiCol);
	}
	return dropdown;
}

//Get intersections between two arrays
function getIntersection(arrays){
	console.log(arrays);
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

function capFirstletter(str){
			return str.replace(/\b[a-z]/g, function(letter){ return letter.toUpperCase(); });
}

//Functions that runs through and translates all buttons etc.
//Should probably be run a little earlier
function translate(){
	var translations = globalsettings.translation;
	Object.keys(translations).forEach(function(key){
		if(key.indexOf('_') === -1){
			$("#"+key+"Label").text(translations[key]);
		}
		if(key == "savetoCanvasModal"){
			//console.log($( "#ui-id-1" ));
			$( "#ui-id-1" ).text(translations[key]);
		}
		else{ //Status texts
			var arrayKey = key.split("_");
			$("#status").data( arrayKey[1]+"-text", translations[key]);
		}
	});
}

//Create helper method for determining neighbor nodes
sigma.classes.graph.addMethod('neighbors', function(nodeId) {
    var k,
        neighbors = {},
        index = this.allNeighborsIndex[nodeId] || {};

    for (k in index)
        neighbors[k] = this.nodesIndex[k];

    return neighbors;
});

sigma.classes.graph.addMethod('neighborEdges', function(nodeId1, nodeId2) {
	var k;
	var neighbors = {};
	var index = this.allNeighborsIndex[nodeId1][nodeId2] || {};

	return index;
});