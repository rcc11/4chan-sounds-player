<% settingsConfig.forEach(setting => { %>
	<% if (setting.showInSettings) { %>
		<div class="<%= ns %>-setting-header" <%= setting.description ? `title="${setting.description}"` : '' %>><%= setting.title %></div>
		<% if (typeof setting.default === 'boolean') { %>
			<input type="checkbox" data-property="<%= setting.property %>" <%= _.get(data, setting.property, false) ? 'checked' : '' %>></input>
		<% } else if (Array.isArray(setting.default)) { %>
			<textarea data-property="<%= setting.property %>"><%= _.get(data, setting.property, '').join(setting.split) %></textarea>
		<% } else { %>
			<input type="text" data-property="<%= setting.property %>" value="<%= _.get(data, setting.property, '') %>"></input>
		<% } %>
	<% } %>
<% }); %>