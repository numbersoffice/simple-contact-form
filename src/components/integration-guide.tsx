import IntegrationTabs from '@/components/integration-tabs'
import { codeToHtml } from '@/lib/shiki'

export default async function IntegrationGuide({
  formId,
  baseUrl,
}: {
  formId: string
  baseUrl: string
}) {
  const submitUrl = `${baseUrl}/submit/${formId}`

  const htmlCode = `<form action="${submitUrl}" method="POST">
  <!-- Add your form fields -->
  <input name="Name" type="text" required />
  <input name="Email" type="email" required />
  <textarea name="Message" required></textarea>

  <!-- Submit button -->
  <button type="submit">Send</button>
</form>`

  const fetchCode = `// Example using fetch API
const formData = new FormData();
formData.append('Name', 'John Doe');
formData.append('Email', 'john@example.com');
formData.append('Message', 'Hello!');

// Add ?format=json to get a JSON response instead of redirect
const response = await fetch('${submitUrl}?format=json', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log(result);`

  const curlCode = `# Add ?format=json to get JSON response
curl -X POST '${submitUrl}?format=json' \\
  -F 'Name=John Doe' \\
  -F 'Email=john@example.com' \\
  -F 'Message=Hello!'`

  // Pre-render syntax highlighting on the server
  const [htmlHighlighted, fetchHighlighted, curlHighlighted] = await Promise.all([
    codeToHtml({ code: htmlCode, language: 'html' }),
    codeToHtml({ code: fetchCode, language: 'javascript' }),
    codeToHtml({ code: curlCode, language: 'bash' }),
  ])

  const tabs = [
    {
      id: 'html',
      label: 'HTML Form',
      code: htmlCode,
      highlightedHtml: htmlHighlighted,
      description:
        'Add this form to your HTML page. Users will be redirected to a success page after submission.',
    },
    {
      id: 'fetch',
      label: 'JavaScript',
      code: fetchCode,
      highlightedHtml: fetchHighlighted,
      description:
        'Use the Fetch API for programmatic submissions. Add ?format=json to receive a JSON response.',
    },
    {
      id: 'curl',
      label: 'cURL',
      code: curlCode,
      highlightedHtml: curlHighlighted,
      description: 'Test your form endpoint from the command line. Add ?format=json for JSON output.',
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Copy one of these code snippets to send submissions to your form.
      </p>

      <IntegrationTabs tabs={tabs} />

      <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md mt-2">
        <strong>Endpoint:</strong>{' '}
        <code className="bg-background px-1 py-0.5 rounded">{submitUrl}</code>
        <br />
        <strong>Method:</strong> POST
        <br />
        <strong>Content-Type:</strong> multipart/form-data or application/x-www-form-urlencoded
      </div>
    </div>
  )
}
