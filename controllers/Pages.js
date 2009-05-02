var Pages = Class.create(jsFrame.controllers.Controller, {
	initialize: function()
	{
		this.name = 'Pages';
	},
	
	index: function()
	{
		this.setVar({indexClasses: 'active'});
		this.setVar({aboutClasses: 'inactive'});
		this.setVar({dataClasses: 'inactive'});
		this.setVar({version: jsFrame.settings.version});
	},
	
	about: function()
	{
		jsFrame.rendering.title = jsFrame.settings.site.name + ' - About';
		this.setVar({indexClasses: 'inactive'});
		this.setVar({aboutClasses: 'active'});
		this.setVar({dataClasses: 'inactive'});
	},
	
	data: function(params)
	{
		jsFrame.rendering.title = jsFrame.settings.site.name + ' - Data Example';
		this.setVar({indexClasses: 'inactive'});
		this.setVar({aboutClasses: 'inactive'});
		this.setVar({dataClasses: 'active'});

		if (typeof(params) != 'undefined' && typeof(params.name) != 'undefined')
		{
			this.setVar({name: decodeURIComponent(params.name)});
			this.setVar({data_form: 'display: none;'});
			this.setVar({data_display: ''});
		}
		else
		{
			this.setVar({data_form: ''});
	  		this.setVar({data_display: 'display: none;'});
		}
	},
	
	error: function(params)
	{
		jsFrame.rendering.view = 'httpcodes/' + params.errorCode;
	}
}); 

jsFrame.controllers.Pages = new Pages();