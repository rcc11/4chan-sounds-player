'use strict';

import './globals';
import Player from './player';
import { parseFiles } from './file_parser';

async function doInit () {
	await Player.initialize();

	parseFiles(document.body);

	const observer = new MutationObserver(function (mutations) {
		mutations.forEach(function (mutation) {
			if (mutation.type === 'childList') {
				mutation.addedNodes.forEach(function (node) {
					if (node.nodeType === Node.ELEMENT_NODE) {
						parseFiles(node);
					}
				});
			}
		});
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true
	});
}

document.addEventListener('4chanXInitFinished', function () {
	if (isChanX) {
		doInit();
	}
	isChanX = true;
	Player.display.initChanX();
});

if (!isChanX) {
	document.addEventListener('DOMContentLoaded', doInit);
}

