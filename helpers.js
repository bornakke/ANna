// Update status message (for debugging)
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

function getIntersection(arrays){
	var result = arrays.shift().reduce(function(res, v) {
    if (res.indexOf(v) === -1 && arrays.every(function(a) {
        return a.indexOf(v) !== -1;
    })) res.push(v);
    return res;
	}, []);
	return result;
}