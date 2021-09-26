function validURL(value) {
	try {
		new URL(value.replace(/%s/, 'sound').replace(/^(https?\/\/)?/, 'https://'));
		return true;
	} catch (err) {
		return false;
	}
}

module.exports = {
	template: require('./templates/host_input.tpl'),

	fields: {
		name: 'Name',
		url: 'URL',
		responsePath: 'Response Path',
		responseMatch: 'Response Match',
		soundUrl: 'File URL Format'
	},

	parse(newValue, hosts, e) {
		hosts = { ...hosts };
		const container = e.currentTarget.closest(`.${ns}-host-input`);
		let name = container.getAttribute('data-host-name');
		let host = hosts[name] = { ...hosts[name] };
		const changedField = e.currentTarget.getAttribute('name');

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
			if ((changedField === 'url' || changedField === 'soundUrl' && newValue) && !validURL(newValue)) {
				throw new PlayerError('The value must be a valid URL.', 'warning');
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
				&& validURL(container.querySelector('[name=url]').value)
				&& (!soundUrlValue || validURL(soundUrlValue))
				&& (!headersValue || JSON.parse(headersValue))) {

				delete host.invalid;
				container.classList.remove('invalid');
			}
		} catch (err) {
			// leave it invalid
		}

		return hosts;
	},

	add() {
		let i,
			name = 'New Host';
		// eslint-disable-next-line curly
		for (i = ''; Player.config.uploadHosts[`${name}${i}`]; i = ` ${++i}`);
		const hosts = {
			[`${name}${i}`]: { invalid: true, data: { file: '$file' } },
			...Player.config.uploadHosts
		};
		Player.settings.set('uploadHosts', hosts, { bypassValidation: true, silent: true });
	},

	remove(e) {
		const hosts = Player.config.uploadHosts;
		const container = e.currentTarget.closest(`.${ns}-host-input`);
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

	setDefault(_new, _current, e) {
		const selected = e.currentTarget.closest(`.${ns}-host-input`).getAttribute('data-host-name');
		if (selected === Player.config.defaultUploadHost) {
			return selected;
		}

		Object.keys(Player.config.uploadHosts).forEach(name => {
			const checkbox = Player.$(`.${ns}-host-input[data-host-name="${name}"] input[data-property="defaultUploadHost"]`);
			checkbox && (checkbox.checked = name === selected);
		});
		return selected;
	},

	restoreDefaults() {
		Object.assign(Player.config.uploadHosts, Player.settings.findDefault('uploadHosts').default);
		Player.set('uploadHosts', Player.config.uploadHosts, { bypassValidation: true });
	}
};
