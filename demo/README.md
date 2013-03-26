#Demo application

This is a demo application for was_framework. To try it, get the latest copy from source tree:

    git clone https://github.com/defeo/was_framework.git
    
Then install all the dependencies

    cd was_framework/demo
    npm install

And start the application

    node . --port=8080 --create-database


### List of options

The application accepts the following command-line options:

  - `--port`: port number to listen on
  - `--create-database`: (re)create empty table for the application
  - `--f`: configuration file for database


### Database configuration

The database can be configured via the `conf.json` file. The default
file provided in the git repo uses SQLite. `mysql-conf.example.json`
is an example file for MySQL.

Any setting accepted by
[node-sqlite-purejs](https://npmjs.org/package/node-sqlite-purejs) or
[mysql](https://npmjs.org/package/mysql) can be used in this file.
