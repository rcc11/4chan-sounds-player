`<select class="${ns}-create-sound-host">
	${Object.keys(Player.config.uploadHosts).map((hostId, i) =>
		Player.config.uploadHosts[hostId] && !Player.config.uploadHosts[hostId].invalid
			? `<option value="${hostId}" ${Player.config.defaultUploadHost === hostId ? 'selected' : ''}>${hostId}</option>`
			: ''
	).join('')}
</select>`