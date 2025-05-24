import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

const roadmapItems = [
  {
    title: 'Improved documentation',
    description: 'Add more detailed documentation for usage.',
    target: 'Q2 2025',
    status: 'in-progress',
  },
  {
    title: 'Receiving submissions via text',
    description: 'Allow form submissions to be sent and received as SMS/text messages.',
    target: 'Q3 2025',
    status: 'upcoming',
  },
  {
    title: 'Google Sheets integration',
    description: 'Automatically forward and store form submissions in a connected Google Sheet.',
    target: 'Q4 2025',
    status: 'upcoming',
  },
  {
    title: 'Replace OpenAI with self-hosted LLM',
    description:
      'Integrate a self-hosted LLM to replace OpenAI for spam detection to improve privacy.',
    target: 'Q1 2026',
    status: 'upcoming',
  },
  {
    title: 'Self-hosting improvements',
    description:
      'Improve the self-hosting experience with a docker-compose option and additional documentation.',
    target: 'Q2 2026',
    status: 'upcoming',
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
          Completed
        </Badge>
      )
    case 'in-progress':
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          In Progress
        </Badge>
      )
    case 'upcoming':
      return <Badge variant="secondary">Upcoming</Badge>
    default:
      return <Badge variant="secondary">Upcoming</Badge>
  }
}

export default function RoadmapPage() {
  return (
    <div className="px-6 pb-32 pt-24">
      <section className="relative mx-auto mt-16 max-w-3xl space-y-12">
        <h1 className="text-5xl max-w-[550px] text-center mx-auto font-bold">Roadmap</h1>
      </section>

      <section className="relative mx-auto mt-16 max-w-3xl space-y-6 md:space-y-12">
        {/* vertical line */}
        {/* <Separator orientation="vertical" className="absolute left-0 top-0 h-full w-px bg-muted" /> */}
        <div className="absolute top-0 h-full w-px border-l-[1px] border-dashed border-[rgba(0,0,0,0.15)]" />

        {roadmapItems.map((item) => (
          <div key={item.title} className="relative pl-6">
            <Card className="gap-2">
              <CardHeader className="flex flex-col-reverse md:flex-row justify-between space-y-0">
                <CardTitle className="text-2xl">{item.title}</CardTitle>
                {/* <Badge variant="secondary">{item.target}</Badge> */}
                {getStatusBadge(item.status)}
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </section>

      <div className="mx-auto mt-16 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-1 text-sm">
          <ChevronLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
