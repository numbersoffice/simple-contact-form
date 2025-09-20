import { codeToHtml } from '@/lib/shiki'

export default async function Code({ code, language }: { code: string; language: string }) {
  const html = await codeToHtml({
    code,
    language,
  })

  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      className="[&_*]:text-[15px] [&_*]:!bg-primary [&>pre]:!m-0 [&>pre]:!p-8 overflow-hidden rounded-md"
    ></div>
  )
}
