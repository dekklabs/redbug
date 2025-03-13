dev:
	npm run tauri:dev

build:
	npm run tauri:build

dw:
	curl -o node.tar.gz https://nodejs.org/dist/v20.11.1/node-v20.11.1-darwin-x64.tar.gz

	tar -xzf node.tar.gz
	mv node-v20.11.1-darwin-x64 src-tauri/node
