import { withPayload } from '@payloadcms/next/withPayload'
import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
})

const withPayloadConfig = withPayload(nextConfig, { devBundleServerPackages: false })
const combinedConfig = withMDX(withPayloadConfig)

export default combinedConfig
