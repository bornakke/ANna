sigma.canvas.nodes.onlylabel = function() { };
sigma.webgl.nodes.onlylabel = {addNode: function() {}, render: function() {}, initProgram: function(){}};
//sigma.webgl.edges.def = sigma.webgl.edges.fast;
//sigma.webgl.nodes.highlight =  sigma.canvas.nodes.highlight;

/**
   * Override the default node renderer. It renders the node as a simple disc.
   *
   * @param  {object}                   node     The node object.
   * @param  {CanvasRenderingContext2D} context  The canvas context.
   * @param  {configurable}             settings The settings function.
   */
  sigma.canvas.nodes.highlight = function(node, context, settings) {
    var prefix = settings('prefix') || '';

    context.fillStyle = '#FFFFFF'
    context.shadowColor = '#FFFF00';
    context.shadowBlur = node[prefix + 'size']*2;
	context.strokeStyle = '#FFFFFF';
    context.beginPath();  
    context.arc(
      node[prefix + 'x'],
      node[prefix + 'y'],
      node[prefix + 'size'],
      0,
      Math.PI * 2,
      true
    );

    context.closePath();
    context.fill();
	context.stroke();
    
    context.shadowBlur = 0;
  };
  
 
sigma.canvas.labels.onlylabel = function(node, context, settings) {
    var fontSize,
        prefix = settings('prefix') || '',
        size = node[prefix + 'size'];

    fontSize = (settings('labelSize') === 'fixed') ?
      settings('defaultLabelSize') :
      settings('labelSizeRatio') * size;

    context.font = (settings('fontStyle') ? settings('fontStyle') + ' ' : '') +
      fontSize + 'px ' + settings('font');
    context.fillStyle = (settings('labelColor') === 'node') ?
      (node.color || settings('defaultNodeColor')) :
      settings('defaultLabelColor');
    context.textAlign="center"; 
	
	context.save();      


	 // Translate to near the center to rotate about the center
     context.translate(node[prefix + 'x'],node[prefix + 'y']);
     // Then rotate...
     context.rotate(Math.PI / 4);
     // Then translate back to draw in the right place!
     context.translate(-node[prefix + 'x'],-node[prefix + 'y']);
     
     context.fillText(
      node.label,
      Math.round(node[prefix + 'x'] + size + 3),
      Math.round(node[prefix + 'y'] + fontSize / 3)
    	);
    
      context.restore();
};
//sigma.webgl.labels.onlylabel = sigma.canvas.labels.onlylabel;