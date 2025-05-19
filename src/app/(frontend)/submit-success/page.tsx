import Link from 'next/link'

export default async function SubmitSuccess({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const returnUrl = params.return_url as string

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div>
        <div className="flex flex-col gap-2 bg-gray-100 p-8 rounded-md">
          <h1 className="text-2xl font-semibold">Success</h1>
          <p>We have received your submission.</p>
          <a href={returnUrl} className="text-blue-500 group inline-flex items-center w-fit">
            <span className="transform transition-transform duration-300 group-hover:-translate-x-1">
              {'<-'}
            </span>
            <span className="ml-1">Return to site</span>
          </a>
        </div>
        <p className="text-center mt-2 text-sm text-gray-300">
          Powered by{' '}
          <Link className="underline" href="/">
            Simple Contact Form
          </Link>
        </p>
      </div>
    </div>
  )
}
