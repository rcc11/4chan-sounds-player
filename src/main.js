'use strict';

import './globals';
import './icons';

async function doInit() {
	// Wait for 4chan X if it's installed and not finished initialising.
	if (!isChanX && (isChanX = document.documentElement.classList.contains('fourchan-x'))) {
		return;
	}

	// Require these here so every other require is sure of the 4chan X state.
	const Player = require('./player');
	const { parseFiles } = require('./file_parser');

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
	const wasChanX = isChanX;
	isChanX = true;
	if (wasChanX) {
		doInit();
	}
	Player.display.initChanX();
});

// If it's already known 4chan X is installed this can be skipped.
if (!isChanX) {
	if (document.readyState !== 'loading') {
		doInit();
	} else {
		document.addEventListener('DOMContentLoaded', doInit);
	}
}

