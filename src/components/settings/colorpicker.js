const colorpickerTemplate = require('./templates/colorpicker.tpl');

const HEIGHT = 200;
const WIDTH = 200;

module.exports = {
	initialize() {
		Player.on('menu-close', menu => menu._input && (delete menu._input._colorpicker));
	},

	create(e) {
		const parent = e.currentTarget.parentNode;
		const input = e.currentTarget.nodeName === 'INPUT' ? e.currentTarget : parent.querySelector('input');
		const preview = parent.querySelector(`.${ns}-cp-preview`);
		if (!input || input._colorpicker) {
			return;
		}

		Player.display.closeDialogs();

		// Get the color from the preview.
		const rgb = Player.colorpicker.parseRGB(window.getComputedStyle(preview).backgroundColor);

		const colorpicker = _.element(colorpickerTemplate({ HEIGHT, WIDTH, rgb }), parent);
		Player.position.showRelativeTo(colorpicker, input);

		input._colorpicker = colorpicker;
		colorpicker._input = input;

		colorpicker._colorpicker = { hsv: [ 0, 1, 1, 1 ], rgb: rgb };

		// If there's a color in the input then update the hue/saturation positions to show it.
		Player.colorpicker.updateOutput(colorpicker);
	},

	hueMove(e) {
		const colorpicker = e.currentTarget.closest(`.${ns}-colorpicker`);
		const y = Math.max(0, e.clientY - e.currentTarget.getBoundingClientRect().top);
		colorpicker._colorpicker.hsv[0] = y / HEIGHT;
		const _hue = Player.colorpicker.hsv2rgb(colorpicker._colorpicker.hsv[0], 1, 1, 1);

		colorpicker.querySelector(`.${ns}-cp-saturation`).style.background = `linear-gradient(to right, white, rgb(${_hue[0]}, ${_hue[1]}, ${_hue[2]}))`;
		e.currentTarget.querySelector('.position').style.top = Math.max(-3, (y - 6)) + 'px';

		Player.colorpicker.updateOutput(colorpicker, true);
	},

	satMove(e) {
		const colorpicker = e.currentTarget.closest(`.${ns}-colorpicker`);
		const saturationPosition = e.currentTarget.querySelector('.position');
		const x = Math.max(0, e.clientX - e.currentTarget.getBoundingClientRect().left);
		const y = Math.max(0, e.clientY - e.currentTarget.getBoundingClientRect().top);

		colorpicker._colorpicker.hsv[1] = x / WIDTH;
		colorpicker._colorpicker.hsv[2] = 1 - y / HEIGHT;
		saturationPosition.style.top = Math.min(HEIGHT - 3, Math.max(-3, (y - 6))) + 'px';
		saturationPosition.style.left = Math.min(WIDTH - 3, Math.max(-3, (x - 5))) + 'px';

		Player.colorpicker.updateOutput(colorpicker, true);
	},

	inputRGBA(e) {
		const colorpicker = e.currentTarget.closest(`.${ns}-colorpicker`);
		colorpicker._colorpicker.rgb[+e.currentTarget.getAttribute('data-color')] = e.currentTarget.value;
		Player.colorpicker.updateOutput(colorpicker);
	},

	updateOutput(colorpicker, fromHSV) {
		const order = fromHSV ? [ 'hsv', 'rgb' ] : [ 'rgb', 'hsv' ];
		colorpicker._colorpicker[order[1]] = Player.colorpicker[`${order[0]}2${order[1]}`](...colorpicker._colorpicker[order[0]]);
		const [ r, g, b, a ] = colorpicker._colorpicker.rgb;

		// Update the display.
		if (fromHSV) {
			colorpicker.querySelector(`.${ns}-rgb-input[data-color="0"]`).value = r;
			colorpicker.querySelector(`.${ns}-rgb-input[data-color="1"]`).value = g;
			colorpicker.querySelector(`.${ns}-rgb-input[data-color="2"]`).value = b;
			colorpicker.querySelector(`.${ns}-rgb-input[data-color="3"]`).value = a;
		} else {
			const [ h, s, v ] = colorpicker._colorpicker.hsv;
			const huePos = colorpicker.querySelector(`.${ns}-cp-hue .position`);
			const satPos = colorpicker.querySelector(`.${ns}-cp-saturation .position`);
			const _hue = Player.colorpicker.hsv2rgb(h, 1, 1, 1);
			colorpicker.querySelector(`.${ns}-cp-saturation`).style.background = `linear-gradient(to right, white, rgb(${_hue[0]}, ${_hue[1]}, ${_hue[2]}))`;
			huePos.style.top = (HEIGHT * h) - 3 + 'px';
			satPos.style.left = (s * WIDTH) - 3 + 'px';
			satPos.style.top = ((1 - v) * WIDTH) - 3 + 'px';
		}

		colorpicker.querySelector('.output-color').style.background = `rgb(${r}, ${g}, ${b}, ${a})`;
	},

	apply(e) {
		// Update the input.
		const colorpicker = e.currentTarget.closest(`.${ns}-colorpicker`);
		const [ r, g, b, a ] = colorpicker._colorpicker.rgb;
		const input = colorpicker._input;
		input.value = `rgb(${r}, ${g}, ${b}, ${a})`;

		// Remove the colorpicker.
		delete input._colorpicker;
		colorpicker.parentNode.removeChild(colorpicker);

		// Focus and blur to trigger the change handler.
		input.focus();
		input.blur();
	},

	parseRGB(str) {
		const rgbMatch = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
		return [ +rgbMatch[1] || 0, +rgbMatch[2] || 0, +rgbMatch[3] || 0, isNaN(+rgbMatch[4]) ? 1 : rgbMatch[4] ];
	},

	hsv2rgb(h, s, v, a) {
		const i = Math.floor((h * 6));
		const f = (h * 6) - i;
		const p = v * (1 - s);
		const q = v * (1 - f * s);
		const t = v * (1 - (1 - f) * s);
		const mod = i % 6;
		const r = [ v, q, p, p, t, v ][mod];
		const g = [ t, v, v, q, p, p ][mod];
		const b = [ p, p, t, v, v, q ][mod];

		return [
			Math.round(r * 255),
			Math.round(g * 255),
			Math.round(b * 255),
			a || 1
		];
	},

	rgb2hsv(r, g, b, a) {
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const d = max - min;
		const s = (max === 0 ? 0 : d / max);
		const v = max / 255;
		let h;

		/* eslint-disable max-statements-per-line */
		switch (max) {
			case min: h = 0; break;
			case r: h = (g - b) + d * (g < b ? 6 : 0); h /= 6 * d; break;
			case g: h = (b - r) + d * 2; h /= 6 * d; break;
			case b: h = (r - g) + d * 4; h /= 6 * d; break;
		}
		/* eslint-enable max-statements-per-line */

		return [ h, s, v, a || 1 ];
	},

	_updatePreview(e) {
		const value = e.currentTarget.value;
		const preview = e.currentTarget.parentNode.querySelector(`.${ns}-cp-preview`);
		preview.style.background = value;
	}
};
