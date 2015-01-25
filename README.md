
#installation Mac

brew install node

cd .../executor
npm install .

# run exemple

./bin/executor test/samples/sleeper.executor

#### planned features
- embeded (here) streams with templating
- remote execution (ssh and/or dedicated executor service)
- constraint execution (timeouts)
- io over URLs (data:, http:, ssh:, ftp:, ...)
- pipes between steps declared as URLs step:step-id

# TODO
- persist running contexts
- execution monitoring with events (progress, debug ...) 