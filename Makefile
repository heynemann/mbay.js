test: kill-test
	@cd test && python -m SimpleHTTPServer &
	@open http://localhost:8000/index.html

kill-test:
	@ps aux | egrep SimpleHTTPServer | egrep -v egrep | awk ' { print $$2 } ' | xargs kill -9

compile:
	@java -jar lib/compiler.jar --js src/mbay.js --js_output_file src/mbay.min.js
