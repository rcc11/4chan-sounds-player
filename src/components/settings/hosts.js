const inputTemplate = require('./templates/host_input.tpl');

module.exports = {
	template: inputTemplate,

	parse: function (newValue, hosts, e) {
		hosts = { ...hosts };
		const container = e.eventTarget.closest(`.${ns}-host-input`);
		let name = container.getAttribute('data-host-name');
		let host = hosts[name] = { ...hosts[name] };
		const changedField = e.eventTarget.getAttribute('name');

		try {
			// If the name was changed then reassign in hosts and update the data-host-name attribute.
			if (changedField === 'name' && newValue !== name) {
				if (!newValue || hosts[newValue]) {
					throw new PlayerError('A unique name for the host is required.', 'warning');
				}
				container.setAttribute('data-host-name', newValue);
				hosts[newValue] = host;
				delete hosts[name];
				name = newValue;
			}

			// Validate URL
			if (changedField === 'url' || changedField === 'soundUrl') {
				try {
					(changedField === 'url' || newValue) && new URL(newValue);
				} catch (err) {
					throw new PlayerError('The value must be a valid URL.', 'warning');
				}
			}

			// Parse the data
			if (changedField === 'data') {
				try {
					newValue = JSON.parse(newValue);
				} catch (err) {
					throw new PlayerError('The data must be valid JSON.', 'warning');
				}
			}

			if (changedField === 'headers') {
				try {
					newValue = newValue ? JSON.parse(newValue) : undefined;
				} catch (err) {
					throw new PlayerError('The headers must be valid JSON.', 'warning');
				}
			}
		} catch (err) {
			host.invalid = true;
			container.classList.add('invalid');
			throw err;
		}

		if (newValue === undefined) {
			delete host[changedField];
		} else {
			host[changedField] = newValue;
		}

		try {
			const soundUrlValue = container.querySelector('[name=soundUrl]').value;
			const headersValue = container.querySelector('[name=headers]').value;
			if (name
				&& JSON.parse(container.querySelector('[name=data]').value)
				&& new URL(container.querySelector('[name=url]').value)
				&& (!soundUrlValue || new URL(soundUrlValue))
				&& (!headersValue || JSON.parse(headersValue))) {

				delete host.invalid;
				container.classList.remove('invalid');
			}
		} catch (err) {
			// leave it invalid
		}

		return hosts;
	},

	add: function () {
		const hosts = Player.config.uploadHosts;
		const container = Player.$(`.${ns}-host-inputs`);
		let name = 'New Host';
		let i = 1;
		while (Player.config.uploadHosts[name]) {
			name = name + ' ' + ++i;
		}
		hosts[name] = { invalid: true, data: { file: '$file' } };
		if (container.children[0]) {
			_.elementBefore(inputTemplate([ name, hosts[name] ]), container.children[0]);
		} else {
			_.element(inputTemplate([ name, hosts[name] ]), container);
		}
		Player.settings.set('uploadHosts', hosts, { bypassValidation: true, bypassRender: true, silent: true });
	},

	remove: function (prop, e) {
		const hosts = Player.config.uploadHosts;
		const container = e.eventTarget.closest(`.${ns}-host-input`);
		const name = container.getAttribute('data-host-name');
		// For hosts in the defaults set null so we know to not include them on load
		if (Player.settings.findDefault('uploadHosts').default[name]) {
			hosts[name] = null;
		} else {
			delete hosts[name];
		}
		container.parentNode.removeChild(container);
		Player.settings.set('uploadHosts', hosts, { bypassValidation: true, bypassRender: true });
	},

	setDefault: function (_new, _current, e) {
		const selected = e.eventTarget.closest(`.${ns}-host-input`).getAttribute('data-host-name');
		if (selected === Player.config.defaultUploadHost) {
			return selected;
		}

		Object.keys(Player.config.uploadHosts).forEach(name => {
			const checkbox = Player.$(`.${ns}-host-input[data-host-name="${name}"] input[data-property="defaultUploadHost"]`);
			checkbox && (checkbox.checked = name === selected);
		});
		return selected;
	},

	restoreDefaults: function () {
		Object.assign(Player.config.uploadHosts, Player.settings.findDefault('uploadHosts').default);
		Player.set('uploadHosts', Player.config.uploadHosts, { bypassValidation: true });
	}
};
