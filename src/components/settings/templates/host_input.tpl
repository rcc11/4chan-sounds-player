!data[1] ? '' : `
<div class="${ns}-row ${ns}-col ${ns}-host-input ${data[1].invalid ? 'invalid' : ''}" data-host-name="${data[0]}">
	<div class="${ns}-row ${ns}-host-controls">
		<div class="${ns}-col-auto">
			<label>
				<input
					type="checkbox"
					data-property="defaultUploadHost"
					${Player.config.defaultUploadHost === data[0] ? 'checked': ''}
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
		${Object.entries(Player.settings.hosts.fields).map(([ field, name ]) => `
			<div class="${ns}-col">
				<input
					type="text"
					data-property="uploadHosts"
					name="${field}"
					value="${(field === 'name' ? data[0] : data[1][field]) || ''}"
					placeholder="${name}"
				/>
			</div>
		`).join('')}
	</div>
	<div class="${ns}-row">
		<div class="${ns}-col">
			<textarea data-property="uploadHosts" name="data" placeholder="Data (JSON)">${
				JSON.stringify(data[1].data, null, 4)
			}</textarea>
		</div>
	</div>
	<div class="${ns}-row">
		<div class="${ns}-col">
			<textarea data-property="uploadHosts" name="headers" placeholder="Headers (JSON)">${
				data[1].headers ? JSON.stringify(data[1].headers, null, 4) : ''
			}</textarea>
		</div>
	</div>
</div>`