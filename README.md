# Simple Contact Form

This project provides an interface to host and manage contact form forwarders. It is based on Nextjs and uses Payload CMS as the application framework. The main features are:
 - Team creation and role based user management
 - Double opt-in forwarding-address verification
 - OpenAI integration for spam filtering of form submissions


## Getting Started

Clone the repository and install the dependencies:
```bash
npm install
```

### 1. Environment Variables & Required Services
> **Note:** To run the project you will need a MongoDB instance, credentials for OpenAI, as well as SMTP credentials for sending emails.

Create an **.env** file in the project root with the following keys:
- `DATABASE_URI` Connection string for MongoDB
- `OPENAI_API_KEY` OpenAI API key
- `PAYLOAD_SECRET` Choose a random string that will be used to encrypt user tokens
- `SMTP_HOST` SMTP endpoint
- `SMTP_USER` SMTP username
- `SMTP_PASS` SMTP password


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
