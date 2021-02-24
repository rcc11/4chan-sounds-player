`<div class="${ns}-col ${ns}-align-center">
	<select ${data.attrs}>
		${Object.keys(data.setting.options).map(k => `<option value="${k}" ${data.value === k ? 'selected' : ''}>
			${data.setting.options[k]}
		</option>`).join('')}
	</select>
</div>`