data[1] ? `<div class="${ns}-row ${ns}-col ${ns}-host-input ${data[1].invalid ? 'invalid' : ''}" data-host-name="${data[0]}">
	<div class="${ns}-row ${ns}-host-controls">
		<div class="${ns}-col-auto">
			<label>
				<input type="checkbox" data-property="defaultUploadHost" ${Player.config.defaultUploadHost === data ? 'checked': ''}>
				Default
			</label>
		</div>
		<div class="${ns}-col-auto"><a href="#" class="${ns}-heading-action ${ns}-remove-host" data-handler="settings.hosts.remove" data-property="uploadHosts">Remove</a></div>
	</div>
	<div class="${ns}-row">
		<div class="${ns}-col"><input type="text" data-property="uploadHosts" name="name" value="${data[0] || ''}" placeholder="Name"></div>
		<div class="${ns}-col"><input type="text" data-property="uploadHosts" name="url" value="${data[1].url || ''}" placeholder="URL"></div>
		<div class="${ns}-col"><input type="text" data-property="uploadHosts" name="responsePath" value="${data[1].responsePath || ''}" placeholder="Response Path"></div>
		<div class="${ns}-col"><input type="text" data-property="uploadHosts" name="responseMatch" value="${data[1].responseMatch || ''}" placeholder="Response Match"></div>
		<div class="${ns}-col"><input type="text" data-property="uploadHosts" name="soundUrl" value="${data[1].soundUrl || ''}" placeholder="File URL Format"></div>
	</div>
	<div class="${ns}-row">
		<div class="${ns}-col"><textarea data-property="uploadHosts" name="data" placeholder="Data (JSON)">${JSON.stringify(data[1].data, null, 4)}</textarea></div>
	</div>
	<div class="${ns}-row">
		<div class="${ns}-col"><textarea data-property="uploadHosts" name="headers" placeholder="Headers (JSON)">${data[1].headers ? JSON.stringify(data[1].headers, null, 4) : ''}</textarea></div>
	</div>
</div>` : ''