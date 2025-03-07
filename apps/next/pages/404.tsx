
import nextPages from 'app/bundles/nextPages'
import Head from 'next/head'

export default function Custom404(props:any) {
  return (
    <>
      <Head>
        <title>Protofy</title>
      </Head>
      {nextPages["notFound"].component()}
    </>
  )
}
