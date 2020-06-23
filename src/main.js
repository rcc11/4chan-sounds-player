'use strict';

import './globals';
import Player from './player';
import { parseFiles } from './file_parser';

async function doInit() {
	// The player tends to be all black without this timeout.
	// Something with the timing of the stylesheet loading and applying the board theme.
	setTimeout(async function () {
		await Player.initialize();

		parseFiles(document.body, true);

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
	}, 0);
}

document.addEventListener('4chanXInitFinished', function () {
	if (isChanX) {
		doInit();
	}
	isChanX = true;
	Player.display.initChanX();
});

if (!isChanX) {
	if (document.readyState !== 'loading') {
		doInit();
	} else {
		document.addEventListener('DOMContentLoaded', doInit);
	}
}

