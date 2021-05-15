{
    if (!data.tags) {
        return '<div class="entry">Loading</div>';
    }
    if (!data.tags.length) {
        return '<div class="entry">No data</div>';
    }
    return data.tags.map(([ name, value ]) => `<div class="entry">
        <span class="tag-name">
            ${name[0].toUpperCase() + name.slice(1)}:
        </span>
        ${value}
    </div>`).join('');
}