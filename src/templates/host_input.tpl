{
	// data is the host name
	const host = Player.config.uploadHosts[data];
	if (!host) {
		return '';
	}
	return `<div class="${ns}-row ${ns}-col ${ns}-host-input ${host.invalid ? 'invalid' : ''}" data-host-name="${data}">
		<div class="${ns}-row ${ns}-host-controls">
			<div class="${ns}-col-auto">
				<label>
					<input type="checkbox" data-property="defaultUploadHost" ${Player.config.defaultUploadHost === data ? 'checked': ''}>
					Default
				</label>
			</div>
			<div class="${ns}-col-auto"><a href="#" class="${ns}-heading-action ${ns}-remove-host" data-handler="settings.removeHost" data-property="uploadHosts">Remove</a></div>
		</div>
		<div class="${ns}-row">
			<div class="${ns}-col"><input type="text" data-property="uploadHosts" name="name" value="${data || ''}" placeholder="Name"></div>
			<div class="${ns}-col"><input type="text" data-property="uploadHosts" name="url" value="${host.url || ''}" placeholder="URL"></div>
			<div class="${ns}-col"><input type="text" data-property="uploadHosts" name="responsePath" value="${host.responsePath || ''}" placeholder="Response Path"></div>
			<div class="${ns}-col"><input type="text" data-property="uploadHosts" name="responseMatch" value="${host.responseMatch || ''}" placeholder="Response Match"></div>
			<div class="${ns}-col"><input type="text" data-property="uploadHosts" name="soundUrl" value="${host.soundUrl || ''}" placeholder="File URL Format"></div>
		</div>
		<div class="${ns}-row">
			<div class="${ns}-col"><textarea data-property="uploadHosts" name="data" placeholder="Data (JSON)">${JSON.stringify(host.data, null, 4)}</textarea></div>
		</div>
		<div class="${ns}-row">
			<div class="${ns}-col"><textarea data-property="uploadHosts" name="headers" placeholder="Headers (JSON)">${host.headers ? JSON.stringify(host.headers, null, 4) : ''}</textarea></div>
		</div>
	</div>`;
}