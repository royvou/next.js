import React from 'react'
import fs from 'node:fs'
import path from 'path'

export default function Page(props) {
  return (
    <>
      <p id="fallback-blocking">fallback blocking page</p>
      <p id="props">{JSON.stringify(props)}</p>
    </>
  )
}

export const getStaticProps = async ({ params }) => {
  const { slug } = params

  if (!slug) {
    throw new Error(`missing slug value for /fallback-true/[slug]`)
  }

  const data = await fs.promises.readFile(
    path.join(process.cwd(), 'data.txt'),
    'utf8'
  )

  if (data.trim() === '200') {
    return {
      props: {
        params,
        found: true,
        hello: 'world',
        random: Math.random(),
      },
      revalidate: 1,
    }
  }

  return {
    redirect: {
      destination: '/home',
      permanent: true,
    },
    revalidate: 1,
  }
}

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}
