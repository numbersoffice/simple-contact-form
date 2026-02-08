export function htmlForm(url: string) {
  return `<form action="${url}" method="POST">

    <!-- Add your form fields -->
    <input name="Email" type="email" required>
    <input name="Message" type="text" required>

    <!-- Add submit button -->
    <button type="submit">Submit Form</button>

</form>`
}

export function reactForm(url: string) {
  return `export default function ContactForm() {

  // Function to handle submission
  async function handleSubmit(e) {
    e.preventDefault();

    // Add ?format=json to get JSON response instead of redirect
    const res = await fetch("${url}?format=json", {
      method: "POST",
      body: new FormData(e.target),
    });

    // Handle response
    const data = await res.json();

    if (data.success) {
      // Handle success
    } else {
      // Handle error
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="Name" type="text" required />
      <input name="Email" type="email" required />
      <button type="submit">Submit</button>
    </form>
  );
}`
}

export function goForm(url: string) {
  return `package main

import (
    "bytes"
    "fmt"
    "io"
    "mime/multipart"
    "net/http"
)

func main() {
    var buf bytes.Buffer
    writer := multipart.NewWriter(&buf)

    // Add form fields
    writer.WriteField("Email", "Test@test.com")
    writer.WriteField("Message", "Hello world!")

    writer.Close()

    // Add ?format=json to get JSON response instead of redirect
    req, err := http.NewRequest("POST", "${url}?format=json", &buf)
    if err != nil {
        panic(err)
    }
    req.Header.Set("Content-Type", writer.FormDataContentType())

    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()
    body, _ := io.ReadAll(resp.Body)
    fmt.Println(string(body))
}`
}
