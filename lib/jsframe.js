var jsFrameObject = Class.create({
	initialize: function()
	{
		this.models = {};
		this.controllers = {};
		this.routing = {};
		this.rendering = {};
		// load settings.js if not already loaded
		if (typeof(this.settings) == 'undefined')
		{
  		new Ajax.Request('settings/settings.js', {
        onSuccess: function(transport) {
          // add settings to current 'this' object
          // would be nice to merge in the response object into the 'this' object
          jsFrame.settings = eval(transport.responseText).settings;
          // load models
          jsFrame.loadModels();
          // load controllers
          jsFrame.loadControllers();
          // now handle routing
          jsFrame.route();
        }
      });
    }
    // else we already have our settings
    else
  	{
  		// load models
      this.loadModels();
      // load controllers
      this.loadControllers();
      // now handle routing
      jsFrame.route();
  	}
	},
	loadModels: function()
	{
    // iterate over each model name
    jsFrame.settings.models.each(function(item)
    {
    	// if the model is not defined, request the model file
    	if (eval('typeof(jsFrame.models.' + item + ')') == 'undefined')
    	{
      	var modelPath = 'models/' + item + '.js';
      	// console.log('would do an Ajax.Request() here');
      	new Ajax.Request(modelPath, {
      		asynchronous: false,
      		onSuccess: function(transport) {
      			// load the model class
      			eval(transport.responseText);
      			// assign an object of the model class to our jsFrame models object
      			eval('jsFrame.models.' + item + ' = new ' + item + '()');
      		}
      	});
      }
    });
	},
	loadControllers: function()
	{
    // iterate over each controller name
    jsFrame.settings.controllers.each(function(item)
    {
    	// if the controller is not defined, request the controller file
    	if (eval('typeof(jsFrame.controllers.' + item + ')') == 'undefined')
    	{
      	var controllerPath = 'controllers/' + item + '.js';
      	// console.log('would do an Ajax.Request() here');
      	new Ajax.Request(controllerPath, {
      		asynchronous: false,
      		onSuccess: function(transport) {
      			// load the controller class
      			eval(transport.responseText);
      			// assign an object of the controller class to our jsFrame controllers object
      			eval('jsFrame.controllers.' + item + ' = new ' + item + '()');
      		}
      	});
      }
    });
	},
	route: function(href)
	{
		// make sure we have a url to process
		if (typeof(href) == 'undefined') { href = window.location.href; }
		
		// if the URL doesn't include our local install or is a relative url
		if (href.include(this.settings.site.basepath) != true && href.substr(0, 1) != '/')
		{
			// then the user has requested an external site, take them there
			window.location.href = href;
			return true;
		}
		
		// if mod_rewrite is enabled on the service,
		//   then we need to process a url like '.../XXX/YYY/...'
		if (this.settings.site.rewriteEnabled)
		{
			// get query path
			var s = href.replace(this.settings.site.basepath, '').split('?');
			var querypath = s[0];
			var query = {};
			// if no querypath, set it to the site root
			if (querypath == '') { querypath = '/' };
			query.path = querypath;
			if (s.length > 1)
			{
				query.params = s[1].parseQuery();
			}
		}
		// else we need to process a url like '.../index.html?controller=XXX&action=YYY...'
		else
  	{
  		var query = href.parseQuery();
  		
  		// put everything that isn't a path, controller, action, or our basepath into the params object
  		var fullbasepath = window.location.protocol + '//' + decodeURI(this.settings.site.basepath);
  		var keys = Object.keys(query).without('path', 'controller', 'action', fullbasepath);
  		if (keys.length > 0)
  		{
  			query.params = (typeof(query.params) != 'undefined' ? query.params : {});
  			// add each object to params
  			keys.each(function(item) {
  				eval('query.params.' + item + ' = query.' + item);
  			});
  		}
  		
  		// if we didn't get any values from parsing the query
  		if (Object.values(query)[0] == undefined)
  		{
  			query = {path: '/'};
  		}
  	}

  	// if we have a path
		if (typeof(query.path) != 'undefined')
		{
			// we need to compare our path against our routes
			// if the routes are not defined, request the routes file
    	if (typeof(this.routes) == 'undefined')
    	{
  			new Ajax.Request('settings/routes.js', {
  				asynchronous: false,
  				onSuccess: function(transport) {
  					jsFrame.routes = eval(transport.responseText);
  				}
  			});
			}
			
			// do regex match of query.path against jsFrame.routes objects
			for (var k = 0; k < this.routes.length; k++)
			{
				var rgx = new RegExp(this.routes[k].path, 'i');
				if (rgx.test(RegExp.escape(query.path)))
				{
					query.controller = this.routes[k].controller;
					query.action = this.routes[k].action;
					this.routing.currentQuery = this.routes[k];
					break;
				}
			}
		}
		
		// if no controller and action, throw a 404
		if (typeof(query.controller) == 'undefined' || typeof(query.action) == 'undefined')
		{
			query.controller = 'Pages';
			query.action = 'error';
			query.params = {errorCode: 404};
		}
		
		// now we have as much information as possible, call the controller based upon our query obje
		this.routing.currentController = query.controller;
		this.routing.currentAction = query.action;
		var params = (typeof(query.params) != 'undefined' ? 'query.params' : '');

		var actionCall = 'jsFrame.controllers.' + query.controller + '.' + query.action + '(' + params + ')';
		eval(actionCall);
		
		// now handle rendering
    this.render();
	},
	render: function()
	{
		// see if we don't have a template set yet
		if (typeof(this.rendering.template) == 'undefined')
		{
			// use the default from the settings
			this.rendering.template = this.settings.defaultTemplate;
		}
		
		// see if we don't have a page title set yet
		if (typeof(this.rendering.title) == 'undefined')
		{
			// use the default from the settings
			this.rendering.title = this.settings.site.name;
		}
		// set the page title now
		document.title = this.rendering.title;
		
		// make path to view file
		var viewPath = 'views';
		// if the view starts with a slash, then view is relative to 'views'
		if (typeof(this.rendering.view) == 'string' && this.rendering.view.substr(0, 1) == '/')
		{
			viewPath += this.rendering.view;
		}
		// else view is relative to 'views/controllerName/'
		else
		{
			viewPath += '/' + this.routing.currentController + '/';
			// if we don't have a designated view
			if (typeof(this.rendering.view) == 'undefined')
			{
				// use the action name as the view
				this.rendering.view = this.routing.currentAction;
			}
			viewPath += this.rendering.view;
		}
		// add .js
		viewPath += '.html';
		this.rendering.viewPath = viewPath;
		
		// get template
		new Ajax.Request('views/Templates/' + this.rendering.template + '.js', {
			asynchronous: false,
			onSuccess: function(transport) {
				jsFrame.rendering.templateObj = new Template(transport.responseText);
				// get view
				new Ajax.Request(jsFrame.rendering.viewPath, {
					asynchronous: false,
					onSuccess: function(transport) {
						var tmpl = new Template(transport.responseText);
						jsFrame.rendering.viewContent = tmpl.evaluate(jsFrame.rendering);
						// write the content to the body!
						document.body.innerHTML = jsFrame.rendering.templateObj.evaluate(jsFrame.rendering);
						
						// add click observers on links
						$$('a').each(function(item)
						{
  						item.observe('click', function(event) {
                var element = event.element();
                element.addClassName('active');
                Event.stop(event);
                jsFrame.route(element.href);
                return false;
              });
            });
            
            // add submit observers on forms
            $$('form').each(function(item)
            {
            	item.observe('submit', function(event) {
            		var element = event.element();
            		element.getInputs('text').each(function(item) {
            			item.value = encodeURIComponent(item.value);
            		});
            	});
            });
						
						// cleanup after ourselves
						jsFrame.rendering = {};
						jsFrame.routing = {};
					},
					onFailure: function(transport) {
						jsFrame.rendering.viewContent = '<h2>Error ' + transport.status + '</h2><p>Could not load view <code>' + jsFrame.rendering.view + '</code></p>';
					}
				});
			},
			onFailure: function(transport) {
				jsFrame.rendering.viewContent = '<h2>Error ' + transport.status + '</h2><p>Could not load template <code>' + jsFrame.rendering.template + '</code></p>';
			}
		});
	}
});


// to make our life easier, from: http://simonwillison.net/2006/Jan/20/escape/
RegExp.escape = function(text) {
  if (!arguments.callee.sRE) {
    /*
    var specials = [
      '/', '.', '*', '+', '?', '|',
      '(', ')', '[', ']', '{', '}', '\\'
    ];
    */
    // for now only escape '/'
    var specials = [
    	'/'
    ];
    arguments.callee.sRE = new RegExp(
      '(\\' + specials.join('|\\') + ')', 'g'
    );
  }
  return text.replace(arguments.callee.sRE, '\\$1');
}

var jsFrame = new jsFrameObject();