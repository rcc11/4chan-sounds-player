`<div class="${ns}-heading lined mt-5">Download All</div>
<div class="m-2">
	<div class="${ns}-row" style="white-space: nowrap">
		<label class="${ns}-col-auto m-0 mr-3" style="height: 1.5rem;">
			<input type="checkbox" class="download-all-images m-0 mr-2" checked>
			Images
		</label>
		<label class="${ns}-col-auto m-0 mr-3" style="height: 1.5rem;">
			<input type="checkbox" class="download-all-audio m-0 mr-2" checked>
			Audio
		</label>
		<label class="${ns}-col-auto m-0 mr-3 ${ns}-ignore-downloaded" style="height: 1.5rem;">
			<input type="checkbox" class="download-all-ignore-downloaded m-0 mr-2" checked>
			<span>
				Skip Downloaded <i class="${ns}-info-circle ${ns}-popover" data-content="Skip sounds you've already downloaded.">${Icons.infoCircle}</i>
			</span>
		</label>
		<div class="${ns}-row ${ns}-align-center">
			<div class="${ns}-col mr-2">Download Concurrency</div>
			<div class="${ns}-col"><input type="number" class="download-all-concurrency" min="1" value="1" style="width: 3rem;"></div>
		</div>
		<div class="${ns}-row ${ns}-align-center">
			<div class="${ns}-col mr-2">
				Compression Level
				<i class="${ns}-info-circle ${ns}-popover" data-content="0 (none/fastest) to 9 (best/slowest). It's unlikely to achieve significant compression however.">${Icons.infoCircle}</i>
			</div>
			<div class="${ns}-col"><input type="number" class="download-all-compression" min="0" max="9" value="0" style="width: 3rem;"></div>
		</div>
		<div class="${ns}-row ${ns}-align-center">
			<div class="${ns}-col mr-2">
				Max Sounds
				<i class="${ns}-info-circle ${ns}-popover" data-content="Maximum number of sounds to download in one zip. 0 for unlimited. Useful for batching downloads to avoid memory contraints.">${Icons.infoCircle}</i>
			</div>
			<div class="${ns}-col"><input type="number" class="download-all-max-sounds" min="0" value="0" style="width: 3rem;"></div>
		</div>
	</div>
	<div class="${ns}-download-all-status" style="display: none;"></div>
	<div class="${ns}-row mt-4 ${ns}-align-center">
		<button @click="tools._handleDownload:prevent" class="${ns}-download-all-start">Download</button>
		<button @click="tools._handleDownloadCancel:prevent" class="${ns}-download-all-cancel">Cancel</button>
		<button @click="tools.saveThreadDownload:prevent" class="${ns}-download-all-save ml-2 ${ns}-popover" @click="tools.saveThreadDownload:prevent" data-content="Save the last download.">Save</button>
		<div class="${ns}-download-all-clear ml-2">
			<a href="#" @click="tools.clearDownloadBlob:prevent">Clear</a><i class="${ns}-info-circle ${ns}-popover ml-1" data-content="Clear the last download to free memory.">${Icons.infoCircle}</i>
		</div>
	</div>
</div>`