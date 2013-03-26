Demo application
================

This is a demo application for was_framework. To try it, get the latest copy from source tree:

    git clone https://github.com/defeo/was_framework.git
    
Then install all the dependencies

    cd was_framework/demo
    npm install

And start the application

    node . --port=8080 --create-database


### List of options

The application accepts the following command-line options:

  - port: port number to listen on
  - create-database: (re)create empty table for the application
  - mysql: use mysql instead of sqlite


### Database configuration

The database can be configured via a `.json` file. Two example files are already 
included: `sqlite-conf.json` and `mysql-conf.json`. Edit them to suit your needs.
