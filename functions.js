//Draw Graph
function drawGraph() {
    ////////////////////////////////////////////////////////////////////////
	//Gloablly define sigma instance
	window.s = new sigma({ 
		renderers: [
   	 		{
      		container: 'sigma-container',
      		type: 'canvas' // force it to canvas so that we can get a screenshot. Disable line to go back to webGL.
      		}
  		],
  		settings: {"labelThreshold": 15, "batchEdgesDrawing":true, "hideEdgesOnMove":true, "zoomingRatio":2, "drawEdges":false}
  	});
  	
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
		
		////////////////////////////////////////////////////////////////////////
        // When the stage is clicked, we just color each
        // node and edge with its original color.
        s.bind('clickStage', function(e) {
            performSearch();
        });
        
        //Only render edges, when you are showing many nodes.
        s.renderers[0].bind('render', function(e) {
        	var render = s.renderers[0];
        	var camera = s.cameras[0]; 
        	var nodeslength = camera.quadtree.area(camera.getRectangle(render.width, render.height)).filter(function(n){
        		return !n.hidden;
        	}).length;
        	
        	if(nodeslength > 2000){
        		s.settings({drawEdges:false});
        	}
        	else{
        		s.settings({drawEdges:true});
        	}
        });
		    		
	//Create canvasSize object
	calCanvassize();
	    		
	//Listen for resize
	var checkSize = _.debounce(function() {
		calCanvassize(); }, 1000);
	window.addEventListener('resize', checkSize);
	
	//same as resetCamera except no search performed since it is not ready yet.
	resetCamera();
	$("#ajaxloader").fadeOut( "slow");
	$("#dim").fadeOut( "slow");	
	s.refresh();
	
	createInterface();
	
	updateStatus("complete");
    });
	
}

//Meta function for constructing search interface 
function createInterface(){	

	//Since we remove spaces in the graph we should also change the window ini
	var filters = ["filter_by", "highlight_by", "color_by", "compare_by", "merge_by"];
	removeSpaces(filters);
	
	//Hide non-activated captures
	activateCapture();
	
	createMultiSelect("filter_by", window.ini["filter_by"]);
	createGroupedMultiSelect("highlight_by", window.ini["highlight_by"]);
	createSingleSelect("color_by", window.ini["color_by"]);
	createSingleSelect("compare_by", window.ini["compare_by"]);
	createSingleSelect("merge_by", window.ini["merge_by"]);
	createRadio("size_by");
	
	//Initiate search tab
	$('#menu a:last').tab('show');
}

//Create single select interfaces
function createSingleSelect(filterName, filterObject){
	//Get value for dropdown
	var selectValues = getDropdown(filterObject);
	
	if(selectValues[0] != ""){ //is filter active
		$("#"+filterName+"_container").append('<label for="'+filterName+'">'+filterObject.label+'</label><select id="'+filterName+'" class="chosen-select">');
		
		$("#"+filterName+"").append($('<option/>', { value: "", text: "" })); //Add blank first option to allow deselect
	
		//Adding tags to select...
		selectValues.map(function(value) {
			$("#"+filterName+"").append($('<option/>', { value: value, text: value }));
		});
			
		//When selecting options, automatically perform search
		$("#"+filterName+"").on('change', function(event, params) {
  		  	performSearch();
    	});
    
		$("#"+filterName+"").chosen({
			search_contains: true,
    		allow_single_deselect: true,
        	placeholder_text_single: 'Chose one entity...',
    		width: '95%'
		});
	
		showMenu(filterName);
	}
}

//Create multi select interfaces
function createMultiSelect(filterName, filterObject){ 
	var selectValues = getSearchterms(filterObject); 
	
	Object.keys(selectValues).forEach(function(gephiCol, i){
		//console.log(selectValues[filterName]);
	
		$("#"+filterName+"_container").append('<div><label for="'+filterName+'_'+gephiCol+'">'+filterObject.label[i]+'</label><select id="'+filterName+'_'+gephiCol+'" class="chosen-select" multiple="true"></div>');
		
		//Adding tags to multiselects...
		selectValues[gephiCol].map(function(value) {
			$("#"+filterName+'_'+gephiCol).append($('<option/>', { value: value, text: value }));
		});
			
		//When selecting options, automatically perform search
		$("#"+filterName+'_'+gephiCol).on('change', function(event, params) {
    		performSearch();
    	});
    
	    $("#"+filterName+'_'+gephiCol).chosen({
    		search_contains: true,
        	no_results_text: 'No results found',
        	placeholder_text_multiple: 'Chose one or more entities...',
        	width: '95%'
    	});
    });
	
	showMenu(filterName);
}

//Create grouped Multi select for e.g. Highlight
function createGroupedMultiSelect(filterName, filterObject){
	var selectValues = getSearchterms(filterObject); 
	
	//Bug in chosen makes it imposible to assign a class with the value label to the option 
	if(_.isArray(selectValues['label'])){ 
		selectValues['labelBug'] = selectValues['label'];
		delete selectValues.label;
	};
	
	if(selectValues != {}){ //Filter is enabled 	
		
		//Create two select boxes to populate
		$("#"+filterName+"_container").append('<select id="'+filterName+'_category" class="chosen-select">');
		//$("#"+filterName+"_category").append($('<option/>', { value: "", text: "" })); //Add blank first option to allow deselect
		
		$("#"+filterName+"_container").append('<select id="'+filterName+'_terms" class="chosen-select" multiple="true">');
		
			
		//Run through values for all gephiCols and populate select boxes
		Object.keys(selectValues).forEach(function(gephiCol, i){			
			//Add value to category selector
			$("#"+filterName+"_category").append($('<option/>', { value: gephiCol, text: filterObject.label[i] }));
		
			//Add value to the term selector.
			selectValues[gephiCol].map(function(value) {
				$("#"+filterName+"_terms").append($('<option/>', { value: value, text: value, class: gephiCol }));
			});
		});
		
		//When selecting category, filter visible terms
		$("#"+filterName+"_category").on('change', function(event, params) {
    		var value = $("#"+filterName+"_category").val();
    		$("#"+filterName+"_terms > option").show().each(function(){
    			if(!$(this).hasClass(value)){
    				$(this).hide();
    			}
    		});
    		$("#"+filterName+"_terms > option:selected").removeAttr("selected");
    		$("#"+filterName+"_terms").trigger("chosen:updated");
    	});
		
		//When selecting terms, automatically perform search
		$("#"+filterName+"_terms").on('change', function(event, params) {
    		performSearch();
    	});
    	
    	$("#"+filterName+"_terms").chosen({
    		search_contains: true,
        	no_results_text: 'No results found',
        	placeholder_text_multiple: 'Chose one or more entities...',
        	width: '95%',
        	display_disabled_options: false
    	});
    	
    	
    	$("#"+filterName+"_category").chosen({
			search_contains: true,
    		allow_single_deselect: true,
        	placeholder_text_single: 'Chose one entity...',
    		width: '50%'
		});
		
		$("#"+filterName+"_category").trigger('change');
		
		$("#"+filterName+"_terms").trigger("chosen:updated");
		$("#"+filterName+"_category").trigger("chosen:updated");
		
		showMenu(filterName);
		
	}
}

//Populate Group selector
function createGroupSelect_old(by, _by, select_value, i){
	$("#highlight_selector").append('<li><a id=groupSelector_'+_by.gephiCol[i]+' href="#">'+_by.label[i]+'</a></li>');
	
	$("#"+by+"_container").append('<label for="'+by+'_'+_by.gephiCol[i]+'">'+_by.label[i]+'</label><select id="'+by+'_'+_by.gephiCol[i]+'" class="chosen-select" multiple="'+ multi +'">');

		//Adding tags to multiselects...
		select_value.map(function(tag) {
			$("#"+by+'_'+_by.gephiCol[i]).append($('<option/>', { value: tag, text: tag, class: _by.gephiCol[i] }));
		});
			
		//When selecting options, automatically perform search
		$("#"+by+'_'+_by.gephiCol[i]).on('change', function(event, params) {
    		performSearch();
    	});
    
    	$("#"+by+'_'+_by.gephiCol[i]).chosen({
    		search_contains: true,
        	no_results_text: 'No results found',
        	placeholder_text_multiple: 'Chose one or more entities...',
        	width: '95%'
    });
	
	$( '#groupSelector_'+_by.gephiCol[i]+'' ).click(function(e) {
  		e.preventDefault(); //Prevent the link from asking for #
  		$("#selectHighlight").html(_by.label[i]+'<span class="caret"></span>');
  		var options = $("."+_by.gephiCol[i]+"");
  		
  		$("option[class=" +_by.gephiCol[i]+ "]").hide();
	});
	
}

//Populate navigation with radiobuttons
function createRadio(by){
	var firstLetter = function(str) {
		return str.replace(/\b[a-z]/g, function(letter){ return letter.toUpperCase(); });
	}
	
	var buttons = window.ini[by];
	buttons.forEach(function(button){
		$("#"+by+"_container").append('<label for="'+button+'" class="radio-inline"><input type="radio" name="'+by+'_options" id="'+button+'" value="'+button+'">'+firstLetter(button)+'</label>');
	});
	$("#"+by+"_container").append('<p class="text-info">The layout is usually cleaner when most connected nodes are bigger. The degree is the number of links, the indegree (outdegree) is the number of inbound links (outbound). </p>');
	
	//When selecting options, automatically perform search
	$("#"+by+"_container").on('change', function(event, params) {
    		performSearch();
    });
	
	showMenu(by);
}

//Prepare the navigation
function getSearchterms(filterObject){ 
	var selectValues = {};
	
	if(filterObject.gephiCol[0] != ""){ //IS the filter active
	
		//Run trough all Gephicol for the filter and then through nodes. Save the filter values in seperate objects for later manipulation
		for (i = 0; i < filterObject.gephiCol.length; i++) { //Run through the gephiCol of filterObject
			selectValues[filterObject.gephiCol[i]] = new Array(); //Prepare Array
			if(_.isArray(filterObject.gephiCol[i])){ //Are this Gephicol a nested array
				
				s.graph.nodes().forEach(function(n) { //Now run through all node for every filter of filterObject type
					if(n.attributes[filterObject.gephiCol[i]]){ //Is this filter in this node and not udefined
						var terms = n.attributes[filterObject.gephiCol[i]].split("|");
						selectValues[filterObject.gephiCol[i]] = selectValues[filterObject.gephiCol[i]].concat(terms);
					}
					
				});
				//Trim to make sure spaces is not a problem
				selectValues[filterObject.gephiCol[i]] = selectValues[filterObject.gephiCol[i]].map(function(value){return value.trim();});
			}
			else{		
				s.graph.nodes().forEach(function(n) { //Now run through all node for every filter of filterObject type
					if(n.attributes[filterObject.gephiCol[i]]){ //Is this filter in this node and not udefined				
						selectValues[filterObject.gephiCol[i]].push(n.attributes[filterObject.gephiCol[i]]);
					} else if(filterObject.gephiCol[i] == "id" || filterObject.gephiCol[i] == "label") {//Special case
						selectValues[filterObject.gephiCol[i]].push(n[filterObject.gephiCol[i]]);
					}
				});
			}
			
			//Prepare the list for population by sorting the list
			selectValues[filterObject.gephiCol[i]] = selectValues[filterObject.gephiCol[i]].sort(); 
			selectValues[filterObject.gephiCol[i]] = _.uniq(selectValues[filterObject.gephiCol[i]], true); //...And removing all duplicates 
		}
	}
	return selectValues;
}

//Get the ID of all nodes that are affected by filter
function getIds(gephiCol, selector, keepNeighbors, nodes){
	var Ids = [];
	var values = selector.val();
	
	if(!(_.isArray(values))) //When dealing with single select there is only one value and therefore no array.
		var values = [values];
		
	if(gephiCol == "labelBug") //Bug in Chossen
  			gephiCol = "label";
	//TODO: Not working, don't know why
	/*values = values.map(function(value){ //Take care of numbers in selector
		if(isNaN(parseInt(value))){ return value; }
		else{	console.log("hej"); console.log(parseInt(value)); 
		return parseInt(value); }
	});*/
	
	if(values[0] != null){ //Only continue if we actually applied this filter
		nodes.forEach(function(n) {
			//Make sure that the node has a value
			if(!_.isUndefined(n.attributes[gephiCol])){ 
				
				if(_.isArray(gephiCol)){ //Are this Gephicol a nested array do an extra foreach on the terms
					var terms = n.attributes[gephiCol].split("|");
				 	//Trim to make sure spaces is not a problem
					terms = terms.map(function(value){return value.trim();});

				 	terms.forEach(function(term){
				 		if(($.inArray(term, values )) > -1){
				 			Ids.push(n.id);
				 			if(keepNeighbors == true){ //Check if we should keepNeighbors and add them to the list
  								Object.keys(s.graph.neighbors(n.id)).forEach(function(neighbor){
  									Ids.push(neighbor);
  								});
  							}	
				 		}
				 	});
				}
				else if(($.inArray(n.attributes[gephiCol], values )) > -1){
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
	
	//Size by
	var gephiCols = window.ini.size_by;
	if(gephiCols[0] != ""){ //Do we need to size_by? 
		if(!(_.isEmpty(keepNodes))){ //There are still nodes to resize
			//var selector = $("#color_by");
			var value = $('input[name=size_by_options]:checked').val();
			keepNodes.forEach(degreeSize(value));
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
					
					for(var i = 0; i < unique_attributes.length; i++) { //Has to split in two so edges can be drawn	
  						to_connect = _.uniq(edges[unique_attributes[i]], false); //...And removing all duplicates			
  						console.log(to_connect);
  						to_connect.forEach(function(node_target){  	
  							console.log(to_connect);
  							//Protection against attributes with _ in their name.
  							node_target = node_target.replace(/[^A-Z0-9]/ig, "_");					
  							source = unique_attributes[i].replace(/[^A-Z0-9]/ig, "_");
  							
  							s.graph.addEdge({
								id:''+node_target+'_'+source+'',
								target:node_target,
								source:source,
								type: "merge_by"				
  							});
						});
					}
					s.settings({autoRescale: false, scalingMode:"outside"});
					s.startForceAtlas2({linLogMode:true, outboundAttractionDistribution:true, barnesHutOptimize:true, scalingRatio:20});
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
			//gephiCols.forEach(function(gephiCol, i){
				var gephiCol = $("#highlight_by_category").val();
				
				var i = $.inArray(gephiCol, window.ini.highlight_by.gephiCol); //Construct [i] value now that we are not looping

				//Label bug
				if(gephiCol == "labelBug")
					i = $.inArray("label", window.ini.highlight_by.gephiCol);				
				
				var selector = $("#highlight_by_terms");
				var Ids = getIds(gephiCol, selector, window.ini.highlight_by.keepNeighbors[i], keepNodes);
				if(Ids.length > 0){
					highlights_Ids.push(Ids);
				}
			//});
		}
		if(!(_.isEmpty(highlights_Ids))){ //only run this if we did a highlight 
			//Now color everything that has not been filtered and save the nodes			
			var keepIds = _.flatten(highlights_Ids);
			keepNodes.forEach(function(n) {
				if(($.inArray(n.id, keepIds )) > -1){
            		n.color = "rgb(255,255,255)"; //Also done by render, but not if you are in webgl
            		n.type = "highlight";	            
				}
			});
			console.log(s.renderers);
			$("#sigma-container").css("background-color", "#d9d3be");
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
				var margin = 100; 
				var canvasXStart = -window.canvasSize.marginWidth/2;
				var spreadingX = window.canvasSize.extramarginWidth/unique_attributes.length;

				var canvasYStart = window.canvasSize.marginHeight/2;
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
	s.render();
    s.refresh();
}