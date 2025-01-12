# WEB'OOK

## Description

Node.js-based application that allows users to subscribe to webhooks and handle incoming webhook events.

## Table of Contents

- [Description](#description)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Design Choice](#design-choice)
- [Data Flow](#data-flow)
- [Simulating Callback Response](#simulating-callback-response)

## Installation

Follow these instructions to install and set up the project.

### Prerequisites

- Node.js

### Steps

1. Clone the repository:

   ```sh
   git clone https://github.com/yourusername/project.git
   cd project
   ```

2. Install all dependencies:

   ```sh
   npm install
   ```

3. Start the development server:
   ```sh
   npm start
   ```

## Environment Setup

To set up the environment, follow these steps:

1. Create a `.env` file in the root directory of the project.
2. Add the necessary environment variables to the `.env` file. For example:
   ```env
   MONGO_URI=mongodb+srv://mongodb:mongodb@webhook.z4nox.mongodb.net/?retryWrites=true&w=majority&appName=Webhook
   PORT=8000
   JWT_SECRET=qwerty
   ```

**Note:** For now, the `.env` file is not included in `.gitignore`, so these variables do not need to be added separately.

## Design Choice

The application uses MongoDB for storage, Express for creating application server, Node.js, and Socket.io for real-time notifications.

## Data Flow

1. The user provides a source URL and a callback URL, which are saved in the database along with the current status of the webhook. The webhook also has a user reference as a foreign key, establishing a one-to-many relationship (one user can create multiple webhooks).

2. Events will have event-specific data along with a reference to the webhook (foreign key).

3. Flow:
   - A user creates a webhook.
   - The application calls the source URL and provides its endpoint as the callback URL.
   - Upon receiving data, the application checks which webhook the event is associated with, saves the data, notifies the user, and returns a response.
   - Optionally, the user's callback can be used to handle additional logic.

**Note:** Currently, we are not calling the source URL directly. Instead, we simulate the webhook response by making an API call to our endpoint using Postman or the terminal.

## Simulating Callback Response

To simulate the callback response, use the following `curl` command. Make sure to update the `Authorization` token and `webhook` ID with the values you can find on the network tab where all webhooks are listed:

```sh
curl --location --request GET 'http://localhost:8000/webhook/event' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_AUTH_TOKEN>' \
--data '{
    "webhook": "<YOUR_WEBHOOK_ID>",
    "data": {
        "message": "Payment success",
        "status": "COMPLETED"
    }
}'
```
