import React from 'react'

export default function Page(props) {
  return (
    <>
      <p id="found">200 page</p>
      <p id="props">{JSON.stringify(props)}</p>
    </>
  )
}

export const getStaticProps = () => {
  return {
    props: {
      slug: 'home',
      random: Math.random(),
    },
    revalidate: 1,
  }
}
