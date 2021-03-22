`<div class="${ns}-heading lined">Download All</div>
<div style="margin: 0 .25rem">
	<div class="${ns}-row">
		<label class="${ns}-col-auto ${ns}-align-center" style="margin-right: .25rem">
			<input type="checkbox" class="${ns}-download-all-images" checked> Images
		</label>
		<label class="${ns}-col-auto ${ns}-align-center" style="margin-right: .25rem">
			<input type="checkbox" class="${ns}-download-all-audio" checked> Audio
		</label>
		<label class="${ns}-col-auto ${ns}-align-center ${ns}-ignore-downloaded" ${Player.tools.threadDownloadBlob ? '' : 'style="display: none"'}>
			<input type="checkbox" class="${ns}-download-all-ignore-downloaded"> Ignore Downloaded
			<i class="${ns}-info-circle ${ns}-popover" data-content="Don't include sounds you've already downloaded.">${Icons.infoCircle}</i>
		</label>
	</div>
	<div class="${ns}-download-all-status" ${Player.tools.threadDownloadBlob ? '' : 'style="display: none"'}>
		Complete!<br/>
		<a href="#" @click="tools.saveThreadDownload:prevent">Save</a></span>
	</div>
	<div class="${ns}-row" style="margin-top: .5rem">
		<button @click="tools._handleDownload" class="${ns}-download-all-start">Download</button>
		<button @click="tools._handleCancel" class="${ns}-download-all-cancel" style="display: none;">Cancel</button>
	</div>
</div>`