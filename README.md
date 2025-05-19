# Simple Contact Form

This project provides a spam-protected, pay-as-you-go endpoint for form submissions to be delivered via email.


## Getting Started

Clone the repository and install the dependencies:
```bash
npm install
```

### Environment Variables & Required Services
> **Note:** You must have running instances of MongoDB and valid credentials for Stripe, Resend, and OpenAI.

Create an `.env` file with the following values:
- **MongoDB**: Used as the primary database. Set `DATABASE_URI`.
- **Stripe**: For billing and payments. Set `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_KEY`.
- **Resend**: For email delivery. Set `RESEND_API_KEY`.
- **OpenAI**: For AI features. Set `OPENAI_API_KEY`.
- **Payload Secret**: Used to encrypt user tokens. Set `PAYLOAD_SECRET`.
- **Host URL**: For routing. Set `NEXT_PUBLIC_HOST_URL` to your app's public URL.

## Development

This project is under **active development**. Features and APIs may change frequently.

To start the development server:

```bash
npm run dev
```

## License

[MIT](LICENSE)
