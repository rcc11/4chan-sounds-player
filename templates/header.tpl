<div style="flex: 0 0 auto; width: auto; max-width: 100%; margin-left: 0.25rem;">
	<% Object.keys(headerOptions).forEach(key => { %>
		<% let option = headerOptions[key][data[key]] || headerOptions[key][0]; %>
		<a class="<%= ns %>-<%= key %>-button fa <%= option.class %>" title="<%= option.title %>" href="javascript;">
			<%= option.text %>
		</a>
	<% }) %>
</div><div style="flex-basis: 0; flex-grow: 1; max-width: 100%; width: 100%; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">
	<%= Player.playing ? Player.playing.title : '4chan Sounds' %>
</div>
<div style="flex: 0 0 auto; width: auto; max-width: 100%; margin-right: 0.25rem;">
	<a class="<%= ns %>-config-button fa fa-wrench" title="Settings" href="javascript;">Settings</a>
	<a class="<%= ns %>-close-button fa fa-times" href="javascript;">X</a>
</div>