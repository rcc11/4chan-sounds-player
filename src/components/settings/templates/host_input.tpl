Object.entries(Player.config.uploadHosts).map(([ name, host ]) => `
	<div class="${ns}-row ${ns}-col ${ns}-host-input ${host.invalid ? 'invalid' : ''}" data-host-name="${name}">
		<div class="${ns}-row ${ns}-host-controls">
			<div class="${ns}-col-auto">
				<label>
					<input
						type="checkbox"
						data-property="defaultUploadHost"
						${Player.config.defaultUploadHost === name ? 'checked': ''}
					/>
					Default
				</label>
			</div>
			<div class="${ns}-col-auto">
				<a href="#" class="${ns}-heading-action" @click="settings.hosts.remove:prevent">
					Remove
				</a>
			</div>
		</div>
		<div class="${ns}-row">
			${Object.entries(Player.settings.hosts.fields).map(([ field, title ]) => `
				<div class="${ns}-col">
					<input
						type="text"
						data-property="uploadHosts"
						name="${field}"
						value="${(field === 'name' ? name : host[field]) || ''}"
						placeholder="${title}"
					/>
				</div>
			`).join('')}
		</div>
		<div class="${ns}-row">
			<div class="${ns}-col">
				<textarea data-property="uploadHosts" name="data" placeholder="Data (JSON)">${
					JSON.stringify(host.data, null, 4)
				}</textarea>
			</div>
		</div>
		<div class="${ns}-row">
			<div class="${ns}-col">
				<textarea data-property="uploadHosts" name="headers" placeholder="Headers (JSON)">${
					host.headers ? JSON.stringify(host.headers, null, 4) : ''
				}</textarea>
			</div>
		</div>
	</div>
`).join('')