import Footer from '@/components/home/footer'
import Head from 'next/head'

export default function Home({
  title = 'IIT Patna Billing',
  keywords = '',
  description = '',
}) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name='keywords' content={keywords} />
        <meta name='description' content={description} />
      </Head>
      <div className='overflow-hidden'>
        {/*  Page content */}
        <main className='flex-grow'>{/* Toast Container */}</main>
        <Footer />
        {/*  Site footer */}
      </div>
    </>
  )
}
