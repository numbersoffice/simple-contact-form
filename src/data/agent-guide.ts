import { htmlForm } from './form-code'

/**
 * Single source of truth for the "use Simple Contact Form as an agent" guide.
 *
 * The same structured steps are rendered two ways:
 *  - as a visible section on the home page (see the home page component)
 *  - as a machine-readable /llms.txt document (see app/llms.txt/route.ts)
 *
 * Keeping one definition avoids the home page and the docs drifting apart.
 */

export interface CodeSnippet {
  code: string
  language: string
}

export interface AgentStep {
  /** Short imperative title, e.g. "Create an account". */
  title: string
  /** Plain-language explanation of the step. */
  body: string
  /** Zero or more copy-pasteable snippets demonstrating the step. */
  snippets?: CodeSnippet[]
}

const PLACEHOLDER = {
  token: 'YOUR_TOKEN',
  team: 'TEAM_ID',
  recipient: 'RECIPIENT_ID',
  form: 'FORM_ID',
}

/**
 * Returns the ordered steps an agent follows to go from no account to a working
 * form whose ID it can drop straight into whatever it is building.
 */
export function getAgentSteps(baseUrl: string): AgentStep[] {
  return [
    {
      title: 'Create an account',
      body:
        'POST your email and a password (min. 8 characters). Generate a unique, strong password and ' +
        'report it back to the user so they can save it — the API never returns the password, so it cannot ' +
        'be recovered if lost. A verification email is sent to that address. The account cannot be used until ' +
        'the email is verified — this deliberate gate prevents automated bulk sign-ups.',
      snippets: [
        {
          language: 'bash',
          code: `curl -X POST ${baseUrl}/api/register \\
  -F 'email=you@example.com' \\
  -F 'password=a-strong-password'`,
        },
      ],
    },
    {
      title: 'Verify the email address',
      body:
        'Open the verification link delivered to the inbox. Logging in is blocked until the address is confirmed, ' +
        'so an agent needs access to that inbox (or a human in the loop) to continue. There is intentionally no API to skip this.',
    },
    {
      title: 'Log in to get an auth token',
      body:
        'Exchange the verified credentials for a JWT. Send it as the `Authorization: JWT <token>` header on every ' +
        'authenticated request below.',
      snippets: [
        {
          language: 'bash',
          code: `curl -X POST ${baseUrl}/api/app-users/login \\
  -H 'Content-Type: application/json' \\
  -d '{"email":"you@example.com","password":"a-strong-password"}'
# -> { "token": "<JWT>", "user": { ... } }`,
        },
      ],
    },
    {
      title: 'Create a team',
      body:
        'A team is the workspace that owns your forms and recipients. The account that creates it becomes its owner automatically.',
      snippets: [
        {
          language: 'bash',
          code: `curl -X POST ${baseUrl}/api/teams \\
  -H 'Authorization: JWT ${PLACEHOLDER.token}' \\
  -H 'Content-Type: application/json' \\
  -d '{"name":"My Project"}'
# -> { "doc": { "id": "${PLACEHOLDER.team}", ... } }`,
        },
      ],
    },
    {
      title: 'Add a recipient',
      body:
        'Recipients are the inboxes that form submissions are forwarded to. A confirmation email (double opt-in) is sent to ' +
        'the address; if it matches your own account email it is confirmed automatically.',
      snippets: [
        {
          language: 'bash',
          code: `curl -X POST ${baseUrl}/api/recipients \\
  -H 'Authorization: JWT ${PLACEHOLDER.token}' \\
  -H 'Content-Type: application/json' \\
  -d '{"email":"you@example.com","team":"${PLACEHOLDER.team}"}'
# -> { "doc": { "id": "${PLACEHOLDER.recipient}", ... } }`,
        },
      ],
    },
    {
      title: 'Create a form and read back its form ID',
      body:
        'Forms accept arbitrary fields, so the same endpoint creates contact forms, feedback forms, waitlists, surveys — any form. ' +
        'A unique `formId` is generated for you; copy it straight into whatever you are building.',
      snippets: [
        {
          language: 'bash',
          code: `curl -X POST ${baseUrl}/api/forms \\
  -H 'Authorization: JWT ${PLACEHOLDER.token}' \\
  -H 'Content-Type: application/json' \\
  -d '{"name":"Contact form","team":"${PLACEHOLDER.team}","recipients":["${PLACEHOLDER.recipient}"]}'
# -> { "doc": { "formId": "${PLACEHOLDER.form}", ... } }`,
        },
      ],
    },
    {
      title: 'Optional: enable AI spam filtering',
      body:
        'Provide your own LLM API key to filter spam before it reaches your inbox. The key is stored on the team and is ' +
        'detected automatically: a key starting with `sk-ant-` uses Anthropic (Claude), otherwise OpenAI is used. ' +
        'First set the key on the team, then enable the filter on the form with a prompt describing a genuine submission.',
      snippets: [
        {
          language: 'bash',
          code: `# 1. Store your Anthropic API key on the team
curl -X PATCH ${baseUrl}/api/teams/${PLACEHOLDER.team} \\
  -H 'Authorization: JWT ${PLACEHOLDER.token}' \\
  -H 'Content-Type: application/json' \\
  -d '{"openaiKey":"sk-ant-..."}'

# 2. Turn the filter on for the form
curl -X PATCH ${baseUrl}/api/forms/${PLACEHOLDER.form} \\
  -H 'Authorization: JWT ${PLACEHOLDER.token}' \\
  -H 'Content-Type: application/json' \\
  -d '{"spamFilterEnabled":true,"spamFilterPrompt":"This is a contact form. Filter out spam, promotions, and automated submissions."}'`,
        },
      ],
    },
    {
      title: 'Send submissions to the form',
      body:
        'Anyone can POST submissions to the form endpoint — no auth required. Fields are arbitrary and emailed to every ' +
        'recipient. Add `?format=json` for a JSON response instead of a redirect, or drop the HTML form straight into a page.',
      snippets: [
        {
          language: 'bash',
          code: `curl -X POST '${baseUrl}/submit/${PLACEHOLDER.form}?format=json' \\
  -F 'Name=Ada Lovelace' \\
  -F 'Email=ada@example.com' \\
  -F 'Message=Hello!'`,
        },
        {
          language: 'html',
          code: htmlForm(`${baseUrl}/submit/${PLACEHOLDER.form}`),
        },
      ],
    },
  ]
}

/**
 * Renders the agent guide as an llms.txt document — the emerging convention for
 * exposing site usage to AI agents in a single machine-readable file.
 */
export function buildAgentGuideMarkdown(baseUrl: string): string {
  const steps = getAgentSteps(baseUrl)

  const body = steps
    .map((step, i) => {
      const snippets = (step.snippets ?? [])
        .map((s) => `\n\n\`\`\`${s.language}\n${s.code}\n\`\`\``)
        .join('')
      return `### ${i + 1}. ${step.title}\n\n${step.body}${snippets}`
    })
    .join('\n\n')

  return `# Simple Contact Form

> Simple Contact Form turns any HTML or programmatic form into spam-protected email
> submissions — no backend required. This file documents how an AI agent can create
> an account and build forms entirely over the HTTP API.

## Notes for agents

- Base URL: ${baseUrl}
- Auth: log in (step 3) to receive a JWT, then send it as the \`Authorization: JWT <token>\` header.
- Email verification is mandatory and cannot be skipped — it keeps automated sign-ups from abusing the service.
- Forms accept arbitrary fields, so this works for contact forms or any other kind of form.
- The REST API is provided by Payload CMS; create/update/find use \`POST\`/\`PATCH\`/\`GET\` on \`/api/<collection>\`.

## Create and use a form (end to end)

${body}
`
}
