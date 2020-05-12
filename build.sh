# Build the script
./node_modules/webpack/bin/webpack.js --config webpack.config.js --mode production

# Copy the header to dist
cp src/header.js dist/4chan-sounds-player.meta.js

# Prepend the header
cat src/header.js | cat - dist/4chan-sounds-player.user.min.js > tmp.build.js && mv tmp.build.js dist/4chan-sounds-player.user.min.js
