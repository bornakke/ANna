;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  sigma.utils.pkg('sigma.classes');

  
  /**
   * This method takes a graph and computes for each node and edges its
   * coordinates relatively to the center of the camera. Basically, it will
   * compute the coordinates that will be used by the graphic renderers.
   *
   * Since it should be possible to use different cameras and different
   * renderers, it is possible to specify a prefix to put before the new
   * coordinates (to get something like "node.camera1_x")
   *
   * @param  {?string} read    The prefix of the coordinates to read.
   * @param  {?string} write   The prefix of the coordinates to write.
   * @param  {?object} options Eventually an object of options. Those can be:
   *                           - A restricted nodes array.
   *                           - A restricted edges array.
   *                           - A width.
   *                           - A height.
   * @return {camera}        Returns the camera.
   */
  sigma.classes.camera.prototype.applyView = function(read, write, options) {
    options = options || {};
    write = write !== undefined ? write : this.prefix;
    read = read !== undefined ? read : this.readPrefix;

    var nodes = options.nodes || this.graph.nodes(),
        edges = options.edges || this.graph.edges();

    var i,
        l,
        node,
        cos = Math.cos(this.angle),
        sin = Math.sin(this.angle);

    for (i = 0, l = nodes.length; i < l; i++) {
      node = nodes[i];
      node[write + 'x'] =
        (
          ((node[read + 'x'] || 0) - this.x) * cos +
          ((node[read + 'y'] || 0) - this.y) * sin
        ) / this.ratio + (options.width || 0) / 2;
      node[write + 'y'] =
        (
          ((node[read + 'y'] || 0) - this.y) * cos -
          ((node[read + 'x'] || 0) - this.x) * sin
        ) / this.ratio + (options.height || 0) / 2;
      node[write + 'size'] =
        (node[read + 'size'] || 0) /
        Math.pow(this.ratio, this.settings('nodesPowRatio'));
    }
	if(this.settings('drawEdges')){
	    for (i = 0, l = edges.length; i < l; i++) {
    	  edges[i][write + 'size'] =
        	(edges[i][read + 'size'] || 0) /
        	Math.pow(this.ratio, this.settings('edgesPowRatio'));
    	}
    }

    return this;
  };

}).call(this);
