# Simple Contact Form

This project provides an interface to host and manage contact form forwarders. It is based on Nextjs and uses Payload CMS as the application framework. The main features are:
 - Team creation and role based user management
 - Double opt-in forwarding-address verification
 - OpenAI or Anthropic (Claude) integration for spam filtering of form submissions
 - Agent-friendly: the whole flow (sign up, create forms, send submissions) is documented for AI agents on the home page and as a machine-readable `/llms.txt`


## Getting Started

Use Node.js 22.12+ (22.x) or Node.js 24+, then clone the repository and install
the locked dependencies:
```bash
npm ci
```

### 1. Environment Variables & Required Services
> **Note:** To run the project you will need a MongoDB instance, credentials for OpenAI, as well as SMTP credentials for sending emails.

Create an **.env** file in the project root with the following keys:
- `NEXT_PUBLIC_HOST_URL` The base URL where the site will be available
- `DATABASE_URI` Connection string for MongoDB
- `OPENAI_API_KEY` OpenAI API key
- `PAYLOAD_SECRET` Choose a random string that will be used to encrypt user tokens
- `SMTP_HOST` SMTP endpoint
- `SMTP_USER` SMTP username
- `SMTP_PASS` SMTP password


## Local test database

Docker Compose runs only MongoDB for local development and testing:

```bash
docker compose -f docker/compose.yaml up -d --wait
```

Use the `DATABASE_URI` from `.env.example`. MongoDB listens on `127.0.0.1:27018`
and initializes a single-node replica set so Payload transactions work. This
local-only database has no authentication and stores data in a named volume.

```bash
docker compose -f docker/compose.yaml down
```

Add `--volumes` to the shutdown command to delete the test database. Run the
application locally using npm; the Compose setup does not deploy the app.

Run the tests with:

```bash
npm test
npm run test:integration
```

Integration tests require the Compose database. They create a uniquely named
test database on port 27018, stub email delivery, and delete only that database
after running. They do not use the application's `DATABASE_URI`.

## Development

This project is under **active development**. Features and APIs will change frequently.

To start the development server run:

```bash
npm run dev
```

## License

[MIT](LICENSE)

## Images
![form management screen exposing the form id](/repo_assets/screenshot_2.png)
