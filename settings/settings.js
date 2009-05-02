/*
 * parens around JSON object needed, see:
 * http://rayfd.wordpress.com/2007/03/28/why-wont-eval-eval-my-json-or-json-object-object-literal/
 */
jsFrame.settings =
	{
		version: '0.0.3',
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
;
