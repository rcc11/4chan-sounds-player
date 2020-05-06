#<%= ns %>-container {
	position: fixed;
	background: <%= data.colors.background %>;
	border: 1px solid <%= data.colors.border %>;
	display: relative;
	min-height: 200px;
	min-width: 100px;
}
.<%= ns %>-show-settings .<%= ns %>-player {
	display: none;
}
.<%= ns %>-setting {
	display: none;
}
.<%= ns %>-settings {
	display: none;
	padding: .25rem;
}
.<%= ns %>-show-settings .<%= ns %>-settings {
	display: block;
}
.<%= ns %>-settings .<%= ns %>-setting-header {
	font-weight: 600;
	margin-top: 0.25rem;
}
.<%= ns %>-settings textarea {
	border: solid 1px <%= data.colors.border %>;
	min-width: 100%;
	min-height: 4rem;
	box-sizing: border-box;
}
.<%= ns %>-title {
	cursor: grab;
	text-align: center;
	border-bottom: solid 1px <%= data.colors.border %>;
	padding: .25rem 0;
}
html.fourchan-x .<%= ns %>-title a {
	font-size: 0;
	visibility: hidden;
	margin: 0 0.15rem;
}
html.fourchan-x  .<%= ns %>-title .fa-repeat.fa-repeat-one::after {
	content: '1';
	font-size: .5rem;
	visibility: visible;
	margin-left: -1px;
}
.<%= ns %>-image-link {
	text-align: center;
	display: flex;
	justify-items: center;
	justify-content: center;
	border-bottom: solid 1px <%= data.colors.border %>;
}
.<%= ns %>-playlist-view .<%= ns %>-image-link {
	height: 125px !important;
}
.<%= ns %>-expanded-view .<%= ns %>-image-link {
	height: auto ;
	min-height: 125px;
}
.<%= ns %>-image-link .<%= ns %>-video {
	display: none;
}
.<%= ns %>-image-link.<%= ns %>-show-video .<%= ns %>-video {
	display: block;
}
.<%= ns %>-image-link.<%= ns %>-show-video .<%= ns %>-image {
	display: none;
}
.<%= ns %>-image, .<%= ns %>-video {
	height: 100%;
	width: 100%;
	object-fit: contain;
}
.<%= ns %>-audio {
	width: 100%;
}
.<%= ns %>-list-container {
	overflow: auto;
}
.<%= ns %>-expanded-view .<%= ns %>-list-container {
	display: none;
}
.<%= ns %>-list {
	display: grid;
	list-style-type: none;
	padding: 0;
	margin: 0;
}
.<%= ns %>-list-item {
	list-style-type: none;
	padding: 0.15rem 0.25rem;
	white-space: nowrap;
	cursor: pointer;
}
.<%= ns %>-list-item.playing {
	background: <%= data.colors.playing %> !important;
}
.<%= ns %>-list-item:nth-child(n) {
	background: <%= data.colors.odd_row %>;
}
.<%= ns %>-list-item:nth-child(2n) {
	background: <%= data.colors.even_row %>;
}
.<%= ns %>-footer {
	padding: .15rem .25rem;
	border-top: solid 1px <%= data.colors.border %>;
}
.<%= ns %>-expander {
	position: absolute;
	bottom: 0px;
	right: 0px;
	height: .75rem;
	width: .75rem;
	cursor: se-resize;
	background: linear-gradient(to bottom right, rgba(0,0,0,0), rgba(0,0,0,0) 50%, <%= data.colors.expander %> 55%, <%= data.colors.expander %> 100%)
}
.<%= ns %>-expander:hover {
	background: linear-gradient(to bottom right, rgba(0,0,0,0), rgba(0,0,0,0) 50%, <%= data.colors.expander_hover %> 55%, <%= data.colors.expander_hover %> 100%)
}