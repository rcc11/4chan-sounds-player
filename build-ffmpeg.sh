# Wrap ffmpeg-webm so it works as a userscript require
echo '(function (self) { let module = {};' > dist/ffmpeg-webm.js
cat node_modules/ffmpeg.js/ffmpeg-webm.js >> dist/ffmpeg-webm.js
echo 'self.ffmpeg=module.exports;})(self);' >> dist/ffmpeg-webm.js