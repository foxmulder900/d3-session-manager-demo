(function(){
	var stage = d3.select('#stage'),
		bounds = stage.node().getBoundingClientRect(),
		userSessions = [];

	var colorScale = d3.scale.linear()
		.domain([0, 200000])
		.range(['#969300', '#B1F800']);

	var forceLayout = d3.layout.force()
		.nodes(userSessions)
		.size([bounds.width, bounds.height-150])
		.charge(-60)
		.chargeDistance(800)
		.on("tick", updateData);

	function updateData(){
		var userBubbles = stage.selectAll('circle')
			.data(forceLayout.nodes(), function(d){ return d.username; });

		userBubbles
			.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; })
			.style("fill", function(d){ return colorScale(new Date() - d.createdTimestamp); })
			.style("stroke", function(d){ return d.flaggedPosts > 10 ? 'red' : '#270043'; });

		userBubbles.enter().append('circle')
			.attr('r', 15)
			.on('click', removeDatum)
			.on('mouseover', showDetails)
			.on('mouseout', hideDetails);

		userBubbles.exit().remove();
		
		forceLayout.start();
	}

	function showDetails(d){
		var tooltip = stage.append("g")
			.classed('tooltip', true)
			.style("pointer-events", "none")
			.attr("transform", function() { return "translate("+d.x+","+d.y+")"; });

		tooltip.append("rect")
			.attr("width", 230)
			.attr("height", 80)
			.style("stroke", "#7D01D7")
			.style("fill", "#3B0065");

		tooltip.append("foreignObject")
			.attr('x', 10)
			.attr('y', 10)
			.attr("width", 220)
			.attr("height", 70)
			.html(buildDetails(d));
	}

	function buildDetails(d){
		var sessionAge = Math.ceil((new Date() - d.createdTimestamp)/60/60);
		return "<b>"+d.username+"</b><br>" +
			   "Session age: "+ sessionAge+" minute(s)<br>" +
			   "Flagged posts: "+ d.flaggedPosts;
	}

	function hideDetails(){
		stage.selectAll("g.tooltip").remove();
	}

	function removeDatum(d){
		hideDetails();
		userSessions.splice(userSessions.indexOf(d), 1);
	}

	function createUserSession(username){
		userSessions.push({
			username: username,
			flaggedPosts: Math.floor(Math.random()*12),
			createdTimestamp: new Date(),
			x: Math.random() * bounds.width,
			y: bounds.height - Math.random()*150
		});
	}

	d3.select('#login-button').on('click', function(){
		var input = d3.select('input[name=username]'),
			username = input.property('value');
		if(username){
			createUserSession(username);
			input.property('value','');
			updateData();
		}
	});

	d3.select('#random-button').on('click', function(){
		for(var i=0; i<10; i++){
			createUserSession(USERNAMES[Math.floor(Math.random() * USERNAMES.length)]);
		}
		updateData();
	});
})();