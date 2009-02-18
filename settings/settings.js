/*
 * parens around JSON object needed, see:
 * http://rayfd.wordpress.com/2007/03/28/why-wont-eval-eval-my-json-or-json-object-object-literal/
 */
({
	settings:
	{
		version: '0.0.1',
		site:
		{
			name: 'jsFrame Test Site',
			rewriteEnabled: true,
			basepath: 'http://localhost:8080/jsframe',
		},
		models: ['Model'],
		controllers: ['Controller', 'Pages'],
		defaultTemplate: 'default'
	}
})
