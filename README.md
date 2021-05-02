# [Anonymous Message Board](https://www.freecodecamp.org/learn/information-security/information-security-projects/anonymous-message-board)
[![Run on Repl.it](https://repl.it/badge/github/panda4817/anonymous-message-board)](https://repl.it/@Panda4817/anonymous-message-board)

A freecodecamp project for the information security certificate. An anonymous message board implementation using NodeJS, ExpressJS server, MongoDB database and Pug template engine for the frontend. I have written all 10 functional tests using Chai and Mocha. I have added security features using helmet and password hashing using BCrypt.

## Usage on local machine

- Add `NODE_ENV=test` to `.env`
- Add `DB=<your database connection variable>` to `.env`
- Add `PORT=8080` to `.env`
- run `npm install && npm start` to run all 10 functional tests and start node server
- Open `localhost:8080` on browser to see frontend