var Controller = Class.create({
	initialize: function()
	{
		this.name = 'Controller';
	},
	setVar: function(v)
	{
		var key = Object.keys(v)[0];
		var value = Object.values(v)[0];
		if (typeof(jsFrame.rendering.vars) == 'undefined')
		{
			jsFrame.rendering.vars = {};
		}
		jsFrame.rendering.vars[key] = value;
	}
});