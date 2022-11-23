import React from 'react'
import Head from 'next/head'
import Sidebar from '@/components/Sidebar'
import { ToastContainer } from 'react-toastify'

export default function Layout({
  title = '',
  keywords = '',
  description = '',
  heading = '',
  children,
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
        <main className='flex-grow'>
          <ToastContainer
            position='top-center'
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={true}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme='light'
          />
          <Sidebar heading={heading}>{children}</Sidebar>
          {/* Add Toast container here */}
        </main>
        {/*  Site footer */}
      </div>
    </>
  )
}
