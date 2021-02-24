`<div class="${ns}-colorpicker ${ns}-dialog dialog" data-allow-click="true" style="top: 0px; left: 0px;">
	<div class="${ns}-cp-saturation" @pointdrag="colorpicker.satMove" style="height: ${data.HEIGHT}px; width: ${data.WIDTH}px;">
		<div class="position" style="left: ${data.WIDTH - 3}px; top: -3px;"></div>
	</div>
	<div class="${ns}-cp-hue" @pointdrag="colorpicker.hueMove" style="height: ${data.HEIGHT}px">
		<div class="position"></div>
	</div>
	<div class="${ns}-output" style="text-align: right;">
		<a href="#" class="${ns}-close-colorpicker" @click="display.closeDialogs():prevent">${Icons.close}</a>
		<div class="output-color" style="background: rgb(${data.rgb[0]}, ${data.rgb[1]}, ${data.rgb[2]});"></div>

		<table>
			${['R','G','B','A'].map((n, i) => `
				<tr>
					<td>${n}:</td>
					<td>
						<input
							type="text"
							class="${ns}-rgb-input"
							@change="colorpicker.inputRGBA"
							data-color="${i}"
							value="${data.rgb[i]}"
						/>
					</td>
				</tr>
			`).join('')}
		</table>

		<button @click="colorpicker.apply:prevent:stop">Apply</button><br>
	</div>
</div>`