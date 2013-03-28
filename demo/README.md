#Demo application

This is a demo application for was_framework. To try it, get the latest copy from source tree:

    git clone https://github.com/defeo/was_framework.git
    
Then install all the dependencies

    cd was_framework/demo
    npm install

And start the application

    node app.js --port=8080 --create-database

or, equivalently,

    npm start


## Configuration options

The application accepts the following command-line options:

  - `--port`: port number to listen on (default 8080).
  - `--(re)create-db`: (re)create empty table for the application.
  - `--no-create-db`: undoes the effects of the previous option.
  - `--f`: configuration file for database (default `conf.json`).

Command-line options take precedence over options in the configuration file.

The configuration file must be a file executable by node (e.g. json or
javascript), exporting a configuration object. The configuration
object may contain the following fields:

  - `port`: port number
  - `(re)create-database`: (re)create empty table
  - `db`: object for configuring the database connection

The `db` object must follow the same format described at
<https://github.com/defeo/was_framework/blob/master/README.md#databases>

The git repo contains three demo configuration files. The default
`conf.json` uses SQLite, `mysql-conf.example.json` is an example file
for MySQL, `appfog-conf.js` is a configuration script for
[AppFog](https://www.appfog.com/).
