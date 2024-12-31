<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# nest.js-snappfood

This project is a practical implementation of a food ordering platform inspired by [snappfood.ir](https://snappfood.ir). Built using the powerful **NestJS** framework, it demonstrates modern web application practices with scalability, security, and performance in mind.

## Table of Content

- [nest.js-snappfood](#nestjs-snappfood)
  - [Table of Content](#table-of-content)
  - [Technologies Used](#technologies-used)
    - [Backend](#backend)
    - [DevOps](#devops)
    - [Utilities](#utilities)
  - [Installation and Setup](#installation-and-setup)
  - [Run MySQL and phpMyAdmin using Docker](#run-mysql-and-phpmyadmin-using-docker)
    - [Run MySQL service](#run-mysql-service)
    - [Run phpMyAdmin service](#run-phpmyadmin-service)
    - [Accessing the Services](#accessing-the-services)
    - [Creating a Database Named `snappfood`](#creating-a-database-named-snappfood)
  - [Setting Up SMS.ir](#setting-up-smsir)
  - [Setting Up zarinpal.com Gateway](#setting-up-zarinpalcom-gateway)
  - [Setting Up liara.ir S3 Cloud Storage](#setting-up-liarair-s3-cloud-storage)
  - [Updating the `.env` File](#updating-the-env-file)
  - [Compile and run the project](#compile-and-run-the-project)
  - [Accessing Swagger UI](#accessing-swagger-ui)
  - [License](#license)
  - [Contributors](#contributors)

## Technologies Used

The project utilizes a modern tech stack to ensure high performance, scalability, and maintainability:

### Backend

- **[NestJS](https://nestjs.com/)**: Framework for building efficient and scalable server-side applications.
- **[TypeORM](https://typeorm.io/)**: ORM for database interactions.
- **[AWS S3 Cloud Storage](https://liara.ir/)**: Cloud object storage based on AWS S3 provided by [liara.ir](https://liara.ir).
- **[MySQL](https://www.mysql.com/)**: An open-source relational database

### DevOps

- **Environment Variables**: Configuration via `.env` files for sensitive data.

### Utilities

- **[Payment Gateway](zarinpal.com)**: Online ordering and payment process.
- **[SMS.ir API](https://www.sms.ir/)**: SMS notifications and OTPs.
- **Swagger**: Interactive API documentation.
- **Pagination**: Custom created Pagination utility inspired by `nestjs-typeorm-paginate` module.
- **Exception Filter**: Custom response logic for exceptions.
- **Response interceptor**: Custom response logic for server responses.

## Installation and Setup

In order to get this application up and running on your local machine, follow the
steps below.

1. Clone the repository from GitHub:

   ```shell
   git clone https://github.com/saeedNW/nest.js-snappfood.git
   ```

2. Navigate to the project directory:

   ```shell
   cd nest.js-snappfood
   ```

3. Install project dependencies:

   ```shell
   npm install
   ```

Note that the application default Listing port is `3000`.

## Run MySQL and phpMyAdmin using Docker

To begin using this project with MySQL, you can set up the **MySQL** database and **phpMyAdmin** using Docker containers. Follow the instructions below to get started.

### Run MySQL service

First, create a Docker network and prepare a directory to persist MySQL data:

```bash
docker network create asgard

sudo mkdir -p /opt/mysql
sudo chown <username>:wheel /opt/mysql
```

Replace `<username>` with your system username to ensure proper permissions for the MySQL data directory.

Now, run the MySQL container:

```bash
docker run -d \
    --name asgard-mysql \
    --network asgard \
    -e MYSQL_ROOT_PASSWORD="root" \
    -v /opt/mysql:/var/lib/mysql \
    -p 3306:3306 \
    mysql
```

This command starts a MySQL container with the root password set to `root` and data persistence in the `/opt/mysql` directory.

### Run phpMyAdmin service

phpMyAdmin provides a user-friendly web interface for managing your MySQL database. Run the phpMyAdmin container with the following command:

```bash
docker run -d \
    --name asgard-phpmyadmin \
    --network asgard \
    -e PMA_HOST=asgard-mysql \
    -p 8080:80 \
    phpmyadmin/phpmyadmin
```

This command starts a phpMyAdmin container connected to the MySQL container. The phpMyAdmin interface is accessible at <http://localhost:8080>.

### Accessing the Services

- **MySQL**: Connect to the MySQL server at `localhost:3306` using the root credentials (`root`/`root`).
- **phpMyAdmin**: Open your browser and navigate to <http://localhost:8080>. Use `root` as the username and `root` as the password to log in.

### Creating a Database Named `snappfood`

Follow these steps to create a database named `snappfood`:

1. Open your browser and navigate to <http://localhost:8080>.
2. Log in to phpMyAdmin using the credentials:
   - Username: `root`
   - Password: `root`
3. Once logged in, follow these steps:
   - Click on the **"New"** option in the left-hand panel.
   - In the **"Database name"** field, enter `snappfood`.
   - Choose a collation for the database (e.g., `utf8_general_ci` for UTF-8 support).
   - Click the **"Create"** button.

Your database `snappfood` is now ready for use.

## Setting Up SMS.ir

1. Visit [SMS.ir](https://www.sms.ir/) and create an account.
2. Verify your account by completing the required authentication steps.
3. Navigate to the **API Settings** section in your dashboard.
4. Generate your **API Key** for integration.

## Setting Up zarinpal.com Gateway

1. Visit [zarinpal.com](https://www.zarinpal.com/) and create an account.
2. Verify your account by completing the required authentication steps.
3. Create a new gateway and verify it
4. Use your **MERCHANT_ID** for integration.

## Setting Up liara.ir S3 Cloud Storage

1. Visit [liara.ir](https://www.liara.ir/) and create an account.
2. Navigate to cloud storage section and create a new storage
3. Navigate to keys management section under cloud storage section and create a new key for your storage to use for integration.

## Updating the `.env` File

update The `.env` file in the project root and add the following environment variables:

```env
S3_SECRET_KEY="9354f842-e5d2-44cb-906b-38be47467dc9"
S3_ACCESS_KEY="du13bnherbg54bo6"
S3_BUCKET_NAME="nestjs-snappfood"
SMS_IR_API_KEY="YOUR_API_KEY"
ZARINPAL_MERCHANT_ID="YOUR_ZARINPAL_MERCHANT_ID"
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# build production
$ npm run build

# production mode
$ npm run start:prod
```

## Accessing Swagger UI

This application provides interactive API documentation using Swagger.

To access the Swagger UI:

1. Start the application in development or production mode.
2. Open your web browser and navigate to:

   ```bash
   http://localhost:3000/api-doc
   ```

3. Use the Swagger interface to explore and test the available APIs.

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## Contributors

We would like to thank the following individuals who have contributed to the development of this application:

![avatar](https://images.weserv.nl/?url=https://github.com/erfanyousefi.png?h=150&w=150&fit=cover&mask=circle&maxage=5d)
‎ ‎ ‎ ![avatar](https://images.weserv.nl/?url=https://github.com/saeedNW.png?h=150&w=150&fit=cover&mask=circle&maxage=5d)

[**Erfan Yousefi - Supervisor and instructor of the nest.js programming course**](https://github.com/erfanyousefi/)

[**Saeed Norouzi - Back-end Developer**](https://github.com/saeedNW)
