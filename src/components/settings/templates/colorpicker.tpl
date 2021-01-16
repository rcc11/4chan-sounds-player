`<div class="${ns}-colorpicker ${ns}-dialog dialog" data-allow-click="true" style="top: 0px; left: 0px;">
	<div class="${ns}-cp-saturation" style="height: ${data.HEIGHT}px; width: ${data.WIDTH}px;">
		<div class="position" style="left: ${data.WIDTH - 3}px; top: -3px;"></div>
	</div>
	<div class="${ns}-cp-hue" style="height: ${data.HEIGHT}px">
		<div class="position"></div>
	</div>
	<div class="${ns}-output" style="text-align: right;">
		<a href="#" class="${ns}-close-colorpicker">${Icons.close}</a>
		<div class="output-color" style="background: rgb(${data.rgb[0]}, ${data.rgb[1]}, ${data.rgb[2]});"></div>

		<table>
			<tr><td>R:</td><td><input type="text" class="${ns}-rgb-input" data-color="0" value="${data.rgb[0]}"></td></tr>
			<tr><td>G:</td><td><input type="text" class="${ns}-rgb-input" data-color="1" value="${data.rgb[1]}"></td></tr>
			<tr><td>B:</td><td><input type="text" class="${ns}-rgb-input" data-color="2" value="${data.rgb[2]}"></td></tr>
			<tr><td>A:</td><td><input type="text" class="${ns}-rgb-input" data-color="3" value="${data.rgb[3]}"></td></tr>
		</table>

		<button class="${ns}-apply-colorpicker">Apply</button><br>
	</div>
</div>`