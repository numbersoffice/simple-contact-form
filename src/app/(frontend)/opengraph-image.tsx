import { ImageResponse } from 'next/og'
import { readFile } from 'fs/promises'
import { join } from 'path'

// Route segment config + metadata for the generated image.
export const alt = 'Simple Contact Form'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
  // Read the logo from disk and inline it as a data URL so it renders inside ImageResponse.
  const logo = await readFile(join(process.cwd(), 'public/images/scf_logo.png'))
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`

  // The logo is 408x208 (≈1.96:1). Render it at half the canvas width so there is
  // plenty of whitespace around it on the 1200x630 preview.
  const logoWidth = 600
  const logoHeight = Math.round(logoWidth * (208 / 408))

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
        }}
      >
        <img src={logoSrc} width={logoWidth} height={logoHeight} alt={alt} />
      </div>
    ),
    { ...size },
  )
}
