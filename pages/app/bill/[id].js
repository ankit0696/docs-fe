import Invoice from '@/components/add/Invoice'
import Layout from '@/components/Layout'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

export default function ViewBillPage() {
  const router = useRouter()
  const { id } = router.query
  if (!id) return null
  return (
    <Layout heading='View Bill'>
      <Invoice id={id} />
    </Layout>
  )
}
