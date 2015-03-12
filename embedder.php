<html>
<head>
	<script src="js/sigma.min.js"></script>
	<script src="js/sigma.parsers.gexf.min.js"></script>
	<script type="text/javascript" src="js/jquery-1.11.2.min.js"></script>
<script>
$(document).ready(function() {
	window.s = new sigma({ 
		renderers: [
   	 		{
      		container: 'sigma-container'
      		/*type: 'canvas'*/ // force it to canvas... if it were not already?
      		}
  		],
  		settings: {}
  	});
  	
  	$.getJSON( "<?php echo $_GET['json']; ?>", function( data ) {
		s.graph.read({nodes: data.nodes, edges: data.edges});
			s.refresh();
  	});
  

});
</script>
<style>
#sigma-container, #sigma-container2{
width:800px;
height: 600px;
}
</style>
</head>
<body>
<div id='sigma-container'></div>
</body>
</html>