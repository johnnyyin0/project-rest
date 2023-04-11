# sdc-questions-n-answers
This repository consists of the backend server for the question and answer section of a front-end e-commerce website.

## Tech Stack
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white)
![Nodemon](https://img.shields.io/badge/NODEMON-%23323330.svg?style=for-the-badge&logo=nodemon&logoColor=%BBDEAD)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)

## Overview
In this project, I created the database and API endpoints for my questions and answers service for my front-end project(https://github.com/johnnyyin0/project-atelier). 

I chose to use PostgreSQL as my database management system and Node.js with Express.js as my server framework. The main goal of this project is to provide a backend solution that allows users to access and manipulate questions and answers data in a seamless and efficient manner. This involves creating a database schema that accurately models the data, implementing CRUD (Create, Read, Update, Delete) operations through RESTful API endpoints, and ensuring that the endpoints return responses in a consistent and standardized format.

To achieve this, I started by designing the database schema to capture the various entities and relationships involved in the questions and answers service. This includes tables for questions, answers, users, and other related entities. I also added necessary constraints and indexes to ensure data integrity and query performance.

Next, I created the API endpoints for each of the CRUD operations and implemented necessary validations and error handling. This involves using middleware functions to sanitize and validate user inputs, and using appropriate status codes and error messages to communicate the outcome of each operation.

In addition, I implemented pagination and sorting functionality to ensure that the endpoints can handle large datasets and return results in a meaningful order. I also added caching mechanisms to improve performance and reduce database queries.

Overall, this project provides a robust and scalable backend solution for the questions and answers service, which can be integrated with the front-end project to provide a seamless user experience.

## Installation Guide
1) Fork and clone repo

2) Install node and dependencies in terminal
```
npm install
```
3) Install PostgreSQL

4) Create database and run ETL to create tables

5) Enjoy!

## Contributors
<a href="https://github.com/HR-Team-Gandalf/sdc-questions-n-answers/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=HR-Team-Gandalf/sdc-questions-n-answers" />
</a>
