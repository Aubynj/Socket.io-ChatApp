# Socket.io-ChatApp
Building Chat Application with Socket.io and NodeJS

## Features
Socket.IO enables real-time bidirectional event-based communication. It consists of:
* Node.js server
* [Javascript client library](https://github.com/socketio/socket.io-client) for the browser (or a Node.js client)

## Final Work
Signing Page
![alt text](https://github.com/Aubynj/Socket.io-ChatApp/blob/master/public/img/image1.png)

Chat Dashboard
![alt text](https://github.com/Aubynj/Socket.io-ChatApp/blob/master/public/img/image2.png)

## Installation
Open project directory and run the command below in the terminal to install the necessary dependencies
```bash
npm install 
```
Consider the database schema. Here we are using MYSQL Database. As you get MYSQL Database working,
Run this command to create subsequent database name and tables
```bash
CREATE DATABASE chatapp;
```

```bash
CREATE TABLE users(
    user_id int AUTO_INCREMENT PRIMARY KEY,
    nickname varchar(100) not null,
    email varchar(100) not null,
    pass_word varchar(255) not null,
    date_creation varchar(100) not null
   )
```

```bash
CREATE TABLE messages(
    id int AUTO_INCREMENT PRIMARY KEY,
    user_id int,
    group_name varchar(100),
    message_body varchar(1000),
    time_sent varchar(100)
   )
```
We are done with the database structure of the project. In the project directory, a folder name model contain
the connection.js for the connection to MYSQL Database Server. Go ahead and change the require variables to the connection
Start the server with the command below. But before that, make sure [nodemon]()

```bash
nodemon server.js
```


### Authors
* John Aubyn  _Initial Work_ [Developer](http://aubynj.github.io)

### License
This project is licensed under the MIT License - see the LICENSE.md file for details

--------------
### Acknowledgement
* Inspiration
* Hardwork
* etc
