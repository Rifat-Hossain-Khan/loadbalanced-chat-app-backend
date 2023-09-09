# Loadbalanced Chat App Backend

![GitHub](https://img.shields.io/github/license/Rifat-Hossain-Khan/loadbalanced-chat-app-backend)
![GitHub last commit](https://img.shields.io/github/last-commit/Rifat-Hossain-Khan/loadbalanced-chat-app-backend)
![GitHub issues](https://img.shields.io/github/issues-raw/Rifat-Hossain-Khan/loadbalanced-chat-app-backend)
![GitHub stars](https://img.shields.io/github/stars/Rifat-Hossain-Khan/loadbalanced-chat-app-backend)

This is the backend component of the Loadbalanced Chat App, a real-time chat application with load balancing.
A scalable backend with pub/sub architecture using Fastify(Node js), Upstash Redis, and Socket.io. Fully dockerized and scaled with caddy.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Introduction

The Loadbalanced Chat App Backend is responsible for handling real-time chat functionality and ensuring load balancing to provide a seamless experience for users. It is built using Fastify(Node js), Upstash Redis, and Socket.io and is designed to work in conjunction with the frontend component of the chat application.

## Features

- Real-time chat functionality.
- Load balancing to distribute traffic efficiently.

### Installation

1. Clone the repository:

   ```shell
   git clone https://github.com/Rifat-Hossain-Khan/loadbalanced-chat-app-backend.git
2. Environment Veriable
   ```shell
   UPSTASH_REDIS_REST_URL=''

3. Install dependencies
   ```shell
   pnpm install
4. Run
   ```shell
   pnpm dev
4. For Build
   ```shell
   pnpm build
5. For Docker Build
    ```shell
    cmod +x ./run.sh
    ./run.sh

