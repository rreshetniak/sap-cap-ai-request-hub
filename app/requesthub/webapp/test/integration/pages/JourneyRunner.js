sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"com/portfolio/requesthub/test/integration/pages/RequestsList.gen",
	"com/portfolio/requesthub/test/integration/pages/RequestsObjectPage.gen"
], function (JourneyRunner, RequestsListGenerated, RequestsObjectPageGenerated) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('com/portfolio/requesthub') + '/test/flp.html#app-preview',
        pages: {
			onTheRequestsListGenerated: RequestsListGenerated,
			onTheRequestsObjectPageGenerated: RequestsObjectPageGenerated
        },
        async: true
    });

    return runner;
});

