// Update status message (for debugging)
function updateStatus(message) {
    $("#status").html(message);
}

function getIntersection(arrays){
	var result = arrays.shift().reduce(function(res, v) {
    if (res.indexOf(v) === -1 && arrays.every(function(a) {
        return a.indexOf(v) !== -1;
    })) res.push(v);
    return res;
	}, []);
	return result;
}

function getUrlParameter(sParam)
{
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
  
  //https://github.com/jacomyal/sigma.js/wiki/Graph-API
  /* Apply a size to node relative to their degree. */
  function degreeSize(option) {
    return function(node) {
      if (option === 'original')
        node.size = node.original.size;
      else if (option === 'degree')
        node.size = 1 + 2 * Math.sqrt(this.graph.degree(node.id));
      else if (option === 'indegree')
        node.size = 1 + 2 * Math.sqrt(this.graph.degree(node.id, 'in'));
      else
        node.size = 1 + 2 * Math.sqrt(this.graph.degree(node.id, 'out'));
    };
  }

function drawSelectgraph(full_ini){
	Object.keys(full_ini).forEach(function(key){
		if(key != "globalsettings"){
			$("#graphs").append('<div class="'+ key +' basicgraph" ><a id="'+key+'" href="#"><h4>'+full_ini[key].graph_header+'</h4><img src="'+full_ini[key].logo_url+'" class="logo"/></a></div>');
			$('#'+key+'').click( function(e) { 
				e.preventDefault(); //Prevent the link from asking for #
				url = location.href +'#?graph='+key;
				window.location.href = url; //Set the url
				location.reload(); //And reload it
			});
		}
	});
}

function resetCamera(){
	var camera = s.camera;
    sigma.misc.animation.camera(
      camera,
      {x: 0, y: 0, angle: 0, ratio: 1},
      {duration: 150}
    );
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
    //Then show all nodes and remove onlylabel nodes + merge_by nodes
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

function disableFilters(filters){	
	filters.forEach(function(filter){
		$("#"+filter+"").prop('disabled',true).trigger("chosen:updated");
	});
	
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
}

function drawGraph() {
    ////////////////////////////////////////////////////////////////////////
	//Gloablly define sigma instance
	window.s = new sigma('sigma-container', {settings: {}});
	
	//Parse data
    sigma.parsers.gexf(window.ini.basemap, function(graph) {
		
		//Change the id of attributes to its titel to secure compatibility with gephi
		//First build a list to compare with
		var attributesTitel = {};
		graph.model.node.forEach(function(m, i) {
			attributesTitel[m.id] = m.title;
		});
		
		graph.nodes.forEach(function(n) {
			Object.keys(n.attributes).forEach(function(old_key){
				new_key = attributesTitel[old_key].toLowerCase(); //Convert to lowercase to make it easier to work with
				new_key = new_key.replace(/ /g,"_"); //Remove spaces to make it easier to work with
				n.attributes[new_key] = n.attributes[old_key];
				if(new_key != old_key.toLowerCase()){
					delete n.attributes[old_key];
				}
			});
		});
		
		//Save the originalcolor and position for later manipulation
        graph.nodes.forEach(function(n) {
            n.originalColor = n.color;
        	n.orgX = n.x;
        	n.orgY = n.y;
        	n.orgSize = n.size;
        });

		graph.edges.forEach(function(e) {
            if(_.isUndefined(e.color)){
            	e.color = "#C0C0C0";
            }
            e.originalColor = e.color;
        });
        

		//Connect instance with the imported graph. From here S is the place to start rather than graph
		s.graph.read(graph);

		//Bind clickNode to highlight  
        s.bind('clickNode', function(e) {
            if(window.ini.details_view.gephiCol[0] != ""){ //Do we actually want to show details
            	performSearch(); //Reset view and sustain search criterias
            	var node = e.data.node;
            	node.color = "rgb(255,255,255)";
            	node.type = "highlight";
	            var neighbors = s.graph.neighbors(node.id);
            		
	            //if set in ini keep also neighboors 
    	        if(window.ini.details_view.keepNeighbors == true){
        	    	Object.keys(neighbors).forEach(function(key){
            			neighbors[key].color = "rgb(255,255,255)";
            			neighbors[key].type = "highlight";
            		});
            	}
    		
    			$("#sigma-container").css("background-color", "#d9d3be");
    			fillDetails(node,neighbors);
            
            	s.refresh();
            }
		});
		
	s.refresh();

    //Create and fill select boxes, remember selects_values for later
	window.selects_values = {};
	
	selects_values["filter_by"] = get_attributes("filter_by", true);
	selects_values["highlight_by"] = get_attributes("highlight_by", true);
	selects_values["color_by"] = get_attributes("color_by", false);
	selects_values["compare_by"] = get_attributes("compare_by", false);
	selects_values["merge_by"] = get_attributes("merge_by", false);
	
	//Create reset button
	create_reset = $("#column-2").append('<div class="reset"><button onclick="resetCamera()" type="button">reset zoom</button>');
	
	updateStatus("Database indlæst.");
    });
	
}

// Create helper method for determining neighbor nodes
sigma.classes.graph.addMethod('neighbors', function(nodeId) {
    var k,
        neighbors = {},
        index = this.allNeighborsIndex[nodeId] || {};

    for (k in index)
        neighbors[k] = this.nodesIndex[k];

    return neighbors;
});

function get_attributes(by, multi){ 
	//Since we remove spaces before we should also change the window ini
	window.ini[by].gephiCol.forEach(function(value, i){
		window.ini[by].gephiCol[i] = value.replace(/ /g,"_");
	});
		
	var select_values = [];
	var _by = window.ini[by];
	
	//Run through the filters and then through nodes and svae them to the selects_values as
	//select_values[i][] =  
	if(_by.gephiCol[0] != ""){ //IS the filter active
		for (i = 0; i < _by.gephiCol.length; i++) { //Then run through the filters of _by type
			if(multi){ //Everything but filter/highlight
				select_values[_by.gephiCol[i]] = new Array(); //Prepare Array
				s.graph.nodes().forEach(function(n) { //Now run through all node for every filter of _by type
					if(n.attributes[_by.gephiCol[i]]){ //Is this filter in this node and not udefined				
						select_values[_by.gephiCol[i]].push(n.attributes[_by.gephiCol[i]]); //Then save it
					} else if(_by.gephiCol[i] == "id" || _by.gephiCol[i] == "label") {
						select_values[_by.gephiCol[i]].push(n[_by.gephiCol[i]]); //Then save it
					}				
					//Special case: ID or nodes or label is not node attributes
					else{//Error or at least a tag that are not for everyone. TODO Remove later 
						//console.log(_by +" is not in this node, or value is udefined");
					}
				});
				//Prepare the list for population by sorting the list
				select_values[_by.gephiCol[i]] = select_values[_by.gephiCol[i]].sort(); 
				select_values[_by.gephiCol[i]] = _.uniq(select_values[_by.gephiCol[i]], true); //...And removing all duplicates 
				create_select(by, _by, select_values[_by.gephiCol[i]], i, multi);
			}
			else{ //Color_by, comapare_by Needs another simple setup. No need to run through all nodes. 
				if(!(by in select_values)){
					select_values[by] = []; //Prepare Array
				}
				select_values[by].push(_by.gephiCol[i]); //Add the names from the ini file
			}

		}
		if(!multi){ //Create selector when all is ready 
			create_select(by, _by, select_values[by], 0, false);
		}
	}
	return select_values;
}

function getIds(gephiCol, selector, keepNeighbors, nodes){
	var Ids = [];
	var values = selector.val();
	
	if(!(_.isArray(values))){ //When dealing with single select there is only one value and therefore no array.
		var values = [values];
	}
	values = values.map(function(value){ //Take care of numbers in selector
		if(isNaN(parseInt(value))){ return value;}
		else{	return parseInt(value); }
	});

	if(values[0] != null){ //Only continue if we actually applied this filter
		console.log(values);
		nodes.forEach(function(n) {
			if(!_.isUndefined(n.attributes[gephiCol])){ //Make sure that the node has a value
					//console.log(n.attributes[gephiCol]);
					//console.log(values);
				if(($.inArray(n.attributes[gephiCol], values )) > -1){
					
  					Ids.push(n.id);	
 	 				if(keepNeighbors == true){ //Check if we should keepNeighbors and add them to the list
  						Object.keys(s.graph.neighbors(n.id)).forEach(function(neighbor){
  							Ids.push(neighbor);
  						});
  					}
  				}
  			}
  			else if(gephiCol == "id" || gephiCol == "label") { //Special case
  				if(($.inArray(n[gephiCol], values )) > -1){
  					Ids.push(n.id);
  					if(keepNeighbors == true){
  						Object.keys(s.graph.neighbors(n.id)).forEach(function(neighbor){
  							Ids.push(neighbor);
  						});
  					}
  				}
  			}
		});
	}
	return Ids
}

//Populate navigation based on _by
function create_select(by, _by, select_value, i, multi){ 
	if(multi){
		$("#navigation-wrapper").append('<div class="'+ by +'" ><label for="'+by+'_'+_by.gephiCol[i]+'">'+_by.label[i]+' ('+ by +')</label><select id="'+by+'_'+_by.gephiCol[i]+'" class="chosen-select" multiple="'+ multi +'">');
	
		//Adding tags to multiselects...
		select_value.map(function(tag) {
			$("#"+by+'_'+_by.gephiCol[i]).append($('<option/>', { value: tag, text: tag }));
		});
			
		//When selecting options, automatically perform search
		$("#"+by+'_'+_by.gephiCol[i]).on('change', function(event, params) {
    		performSearch();
    	});
    
    	$("#"+by+'_'+_by.gephiCol[i]).chosen(multi_config);
	}
	else{
		$("#navigation-wrapper").append('<div class="'+ by +'" ><label for="'+by+'">'+_by.label+' ('+ by +')</label><select id="'+by+'" class="chosen-select">');
		$("#"+by+"").append($('<option/>', { value: "", text: "" })); //Add blank first option to allow deselect
	
		//Adding tags to select...
		select_value.map(function(tag) {
			$("#"+by+"").append($('<option/>', { value: tag, text: tag }));
		});
			
		//When selecting options, automatically perform search
		$("#"+by+"").on('change', function(event, params) {
    		performSearch();
    	});
    
		$("#"+by+"").chosen(single_config);
	}
}

// Make search function available
function performSearch() {
	//Filtering is the most radical so this will go first. Based on this you can then highlight_by, but we suggests the users to only 
	//Inside these two selectors you can then run color_by, compare_by, merge_by in this track 
	//Inside boxes is AND and between boxes is OR 
		
	//Reset view so that we know what we got
	resetView();
	
	var keepNodes = s.graph.nodes(); //Array with the nodes that should be affected by any filters
	var keepNodes_tmp = []; //Array to build list of keep nodes 
	
	//Filter
	var gephiCols = window.ini.filter_by.gephiCol;
	if(gephiCols[0] != ""){ //Do we need to filter
		filtered_Ids = new Array();
		gephiCols.forEach(function(gephiCol, i){
			var selector = $("#filter_by_"+gephiCol+"");
			var Ids = getIds(gephiCol, selector, window.ini.filter_by.keepNeighbors[i], keepNodes);
			if(Ids.length > 0){
				filtered_Ids.push(Ids);
			}
		});
		if(!(_.isEmpty(filtered_Ids))){ //only run this if we did a filter 
			var keepIds = getIntersection(filtered_Ids);
		
			//Now remove everything that has not been filtered and save the nodes
			keepNodes.forEach(function(n) {
				if(($.inArray(n.id, keepIds )) > -1){
					n.hidden = false;
					keepNodes_tmp.push(n);
				}
				else{
					n.hidden = true;
				}
			});
			keepNodes = keepNodes_tmp; //Construct a new keepNodes
		}
	}
	
	//Merge_by
	var gephiCols = window.ini.merge_by.gephiCol;
	if(gephiCols[0] != ""){ //Do we need to merge_by?
		if(!(_.isEmpty(keepNodes))){ //There are still nodes to rearrange
			var selector = $("#merge_by");
			var value = selector.val();			
				if(value != ""){
					var unique_attributes = getUniquetype(keepNodes, value);
					
					//Deefine objects
					var sizes = {};
					var edges = {};
				
					for(var i = 0; i < unique_attributes.length; i++) {
						sizes[unique_attributes[i]] = 0;
						edges[unique_attributes[i]] = [];
					}
			
					keepNodes.forEach(function(n){
						n.hidden = true;
						if(n.attributes[value]){
							sizes[n.attributes[value]] = sizes[n.attributes[value]]+n.size; 						
							var neighbors = s.graph.neighbors(n.id);
							Object.keys(neighbors).forEach(function(neighbor){
								if(neighbors[neighbor].attributes[value]){ //Make sure the attribute is actually set
									edges[n.attributes[value]].push(neighbors[neighbor].attributes[value]);
								}
							});
						}
					});
					
					sizes = normalize(sizes);					
					keepNodes = []; //Empty keepNodes and populate it with the new nodes we are creating
					
					for(var i = 0; i < unique_attributes.length; i++) {
						var id = unique_attributes[i].replace(/[^A-Z0-9]/ig, "_");						
						//Add label nodes
						var node = {
  							id: id,
  							attributes: {},
  							label: unique_attributes[i],
  							x: 50*i,
  							y: 0,
  							size: sizes[unique_attributes[i]],
  							hidden: false,
  							type: "merge_by"
  						}
						s.graph.addNode(node);
  						keepNodes.push(node);
					}
					for(var i = 0; i < unique_attributes.length; i++) { //Has to split in to so edges can be drawn	
  						to_connect = _.uniq(edges[unique_attributes[i]], false); //...And removing all duplicates			
  						to_connect.forEach(function(node_target){  	
  							//console.log(node_target);
  							node_target = node_target.replace(/[^A-Z0-9]/ig, "_");						
  							source = unique_attributes[i].replace(/[^A-Z0-9]/ig, "_");
  							s.graph.addEdge({
  							id:'s'+i+'',
  							target:node_target,
  							source:unique_attributes[i],
  							type: "merge_by"				
  							});
						});
					}
					s.settings({autoRescale: false, scalingMode:"outside"});
					s.startForceAtlas2({linLogMode:true, outboundAttractionDistribution:true, barnesHutOptimize:true, scalingRatio:10});
					setTimeout(function(){s.stopForceAtlas2(); },1000);
					disableFilters(["compare_by"]);
				}
			
			
		}
	}
	//Color by
	var gephiCols = window.ini.color_by.gephiCol;
	if(gephiCols[0] != ""){ //Do we need to color_by? 
		if(!(_.isEmpty(keepNodes))){ //There are still nodes to color
			var selector = $("#color_by");
			var value = selector.val();
			if(value != ""){	
				var unique_attributes = getUniquetype(s.graph.nodes(), value); //Use all nodes here instead for keep nodes to ensure same colering everytime

				var color_pallet = {};
				for(var i = 0; i < unique_attributes.length; i++) {
					color_pallet[unique_attributes[i]] = color_scheme[i];
				}
			
				keepNodes.forEach(function(n){
					if(n.attributes[value]){
						n.color = color_pallet[n.attributes[value]];
					}
					if(!n.attributes[value]){
						n.color = "rgb(47,79,79)";
					}
				});
			}
		}
	}
	
	//
	//Highlight 
	var gephiCols = window.ini.highlight_by.gephiCol;
	if(gephiCols[0] != ""){ //Do we need to highlight? 
		if(!(_.isEmpty(keepNodes))){ //There are still nodes to highlight
			highlights_Ids = new Array();
			gephiCols.forEach(function(gephiCol, i){
				var selector = $("#highlight_by_"+gephiCol+"");
				var Ids = getIds(gephiCol, selector, window.ini.highlight_by.keepNeighbors[i], keepNodes);
				if(Ids.length > 0){
					highlights_Ids.push(Ids);
				}
			});
		}
		if(!(_.isEmpty(highlights_Ids))){ //only run this if we did a highlight 
			//Todo: Different coloros for different places?
			var keepIds = _.flatten(highlights_Ids); //We should not get intersection with highlighting since that would be wierd //getIntersection(highlights_Ids);
			//Now color everything that has not been filtered and save the nodes
			keepNodes.forEach(function(n) {
				if(($.inArray(n.id, keepIds )) > -1){
					n.color = "rgb(255,255,0)";
				}
			});
		}
	}	
	
	//Compare by
	//the only one to layout so we keep it last.
	var gephiCols = window.ini.compare_by.gephiCol;
	if(gephiCols[0] != ""){ //Do we need to compare_by? 
		if(!(_.isEmpty(keepNodes))){ //There are still nodes to rearrange
			var selector = $("#compare_by");
			var value = selector.val();
			if(value != ""){
				var unique_attributes = getUniquetype(keepNodes, value);
			
				var xPostions = {};
				var yPostions = {};
				var margin = 40; 
				var canvasXStart = -window.canvasSize.width/2+margin;
				var spreadingX = (window.canvasSize.width-margin*2)/unique_attributes.length;

				var canvasYStart = window.canvasSize.height/2-margin;
				var spreadingY = -10;

				for(var i = 0; i < unique_attributes.length; i++) {
					xPostions[unique_attributes[i]] = canvasXStart + (i * spreadingX);
					yPostions[unique_attributes[i]] = canvasYStart;
					
					//Add label nodes
					s.graph.addNode({
  						id: 'n'+i+'',
  						attributes: {
  						},
  						label: unique_attributes[i],
  						x: xPostions[unique_attributes[i]],
  						y: yPostions[unique_attributes[i]],
  						size: 0,
  						type: 'onlylabel'
					});	
					yPostions[unique_attributes[i]]=yPostions[unique_attributes[i]]+spreadingY*2; //Make some distance to text
				}			
				
				
				keepNodes.forEach(function(n){
					if(n.attributes[value]){
						n.x = xPostions[n.attributes[value]];
						n.y = yPostions[n.attributes[value]];
						yPostions[n.attributes[value]] = yPostions[n.attributes[value]]+spreadingY;
						n.size = 4;
						keepNodes_tmp.push(n);
					}
					else{//(!n.attributes[value]){
						n.hidden = true;
					}
				});
				//Set rescale to force position and size of node
				s.settings({autoRescale: false, scalingMode:"outside"});
				disableFilters(["merge_by"]);
				keepNodes = keepNodes_tmp;
			}
		}
	}
	
    s.refresh();
    
    //Update status message
    if(keepNodes.length > 1 || keepNodes.length == 0){
    	updateStatus("Viser " + keepNodes.length + " resultater.");
    }
    else{
    	updateStatus("Viser 1 resultat");
    }
}