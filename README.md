# Simple Contact Form

This project provides an interface to host and manage contact form forwarders. It is based on Nextjs and uses Payload CMS as the application framework. The main features are:
 - Team creation and role based user management
 - Double opt-in forwarding-address verification
 - OpenAI integration for spam filtering of form submissions
 - Payment method management and credit refill mechanics
 - Billing integration with stripe


## Getting Started

Clone the repository and install the dependencies:
```bash
npm install
```

### 1. Environment Variables & Required Services
> **Note:** To run the project you will need a MongoDB instance, credentials for Stripe and OpenAI, as well as SMTP credentials for sending emails.

Create an **.env** file in the project root with the following keys:

Secret
- `DATABASE_URI` Connection string for MongoDB
- `STRIPE_SECRET_KEY` Stripe secret key
- `STRIPE_WEBHOOK_SIGNING_SECRET` Use signing secret from the next step
- `OPENAI_API_KEY` OpenAI API key
- `PAYLOAD_SECRET` Choose a random string that will be used to encrypt user tokens
- `SMTP_HOST` SMTP endpoint
- `SMTP_USER` SMTP username
- `SMTP_PASS` SMTP password

Public
- `NEXT_PUBLIC_STRIPE_KEY` Stripe public key
- `NEXT_PUBLIC_HOST_URL` Your app's public URL including protocoll

### 2. Set up Stripe webhooks
Create a Stripe webhook listening for the following three events:
- charge.succeeded
- payment_method.attached
- payment_method.detached

Set the endpoint URL to `PROTOCOL://YOUR_URL/api/webhook`. You can run webhooks locally using the [Stripe CLI](https://docs.stripe.com/webhooks/quickstart).
## Development

This project is under **active development**. Features and APIs will change frequently.

To start the development server run:

```bash
npm run dev
```

## License

[MIT](LICENSE)

## Images
![form management screen exposing the form id](/repo_assets/screenshot_2.jpg)
![billing dashboard with payment management options](/repo_assets/screenshot_3.jpg)
