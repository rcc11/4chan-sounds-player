{
	if (!data.tags) {
		return '<div class="entry">Loading</div>';
	}
	const tagsArr = Object.entries(data.tags);
	if (!tagsArr.length) {
		return '<div class="entry">No data</div>';
	}
	return tagsArr.map(([ name, value ]) => `<div class="entry">
		<span class="tag-name">
			${name[0].toUpperCase() + name.slice(1)}:
		</span>
		${value}
	</div>`).join('');
}