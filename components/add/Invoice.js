import { Fragment, useEffect, useState } from 'react'
import axios from 'axios'
import { API_URL } from '@/config/index'
import qs from 'qs'
import { BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Invoice({ id }) {
  // fetch invoice data from api
  const [invoice, setInvoice] = useState(null)
  const [items, setItems] = useState([])
  const [shipping, setShipping] = useState(0)
  const [tax, setTax] = useState(0)
  const [subTotal, setSubTotal] = useState(0)
  const [total, setTotal] = useState(0)
  const [discount, setDiscount] = useState(0)

  // Calculating item total
  const calcItemTotal = (item) => {
    let itemTotal = 0
    itemTotal += item.rate * item.quantity
    item.item_charges.map((charge) => {
      itemTotal += charge.amount
    })
    return itemTotal
  }

  // calculate subtotal
  const calcSubTotal = () => {
    let subTotal = 0
    items.forEach((item) => {
      subTotal += calcItemTotal(item)
    })
    return subTotal
  }

  // calculate total
  const calcTotal = () => {
    let total = 0
    total += calcSubTotal()
    total += shipping + tax
    invoice?.attributes?.extra_charges.map((charge) => {
      total += charge.amount
    })
    total -= discount
    return total
  }
  const getBill = async () => {
    const toastId = toast.loading('Fetching invoice data...', {
      autoClose: false,
    })
    try {
      const query = qs.stringify(
        {
          populate: [
            'items.category',
            'items.item_charges',
            'buyer.name',
            'bill',
            'extra_charges',
          ],
        },
        {
          encodeValuesOnly: true, // prettify url
        }
      )
      const res = await axios.get(`${API_URL}/api/bills/${id}?${query}`)
      // toast update after fetching data
      toast.update(toastId, {
        render: 'Invoice data fetched',
        type: toast.TYPE.SUCCESS,
        isLoading: false,
        autoClose: 5000,
      })

      console.log(res)
      setInvoice(res.data.data)
      console.log(res.data.data)
      setItems(res.data.data?.attributes?.items)
    } catch (err) {
      console.log(`Error: ${err}`)
      toast.update(toastId, {
        render: 'Error fetching invoice data',
        type: toast.TYPE.ERROR,
        isLoading: false,
        autoClose: 5000,
      })
    }
  }

  useEffect(() => {
    getBill()
  }, [])

  useEffect(() => {
    if (invoice) {
      setShipping(invoice?.attributes?.shipping)
      setTax(invoice?.attributes?.tax)
      setDiscount(invoice?.attributes?.discount)
      setSubTotal(calcSubTotal())
      setTotal(calcTotal())
    }
  }, [invoice])

  return (
    <div className=''>
      <div className='max-w-2xl mx-auto pt-16 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8'>
        <div className='px-4 space-y-2 sm:px-0 sm:flex sm:items-baseline sm:justify-between sm:space-y-0'>
          <div className='flex sm:items-baseline sm:space-x-4'>
            <h1 className='text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl'>
              Order #{id}
            </h1>
            <a
              href='#'
              className='hidden text-sm font-medium text-rose-600 hover:text-rose-500 sm:block'
            >
              View invoice<span aria-hidden='true'> &rarr;</span>
            </a>
          </div>
          <p className='text-sm text-gray-600'>
            Last Updated{' '}
            <time
              dateTime={invoice?.attributes?.updatedAt}
              className='font-medium text-gray-900'
            >
              {new Date(invoice?.attributes?.updatedAt).toLocaleDateString()}
            </time>
          </p>
          <a
            href='#'
            className='text-sm font-medium text-rose-600 hover:text-rose-500 sm:hidden'
          >
            View invoice<span aria-hidden='true'> &rarr;</span>
          </a>
        </div>

        {/* Billing */}
        <div className='mt-16'>
          <h2 className='sr-only'>Billing Summary</h2>

          <div className='bg-gray-100 py-6 px-4 sm:px-6 sm:rounded-lg lg:px-8 lg:py-8 lg:grid lg:grid-cols-12 lg:gap-x-8'>
            <dl className='grid grid-cols-2 gap-6 text-sm sm:grid-cols-2 md:gap-x-8 lg:col-span-7'>
              <div>
                <dt className='font-medium text-gray-900'>Vendor details</dt>
                <dd className='mt-3 text-gray-500'>
                  <span className='block'>
                    {invoice?.attributes?.vendor_name}
                  </span>
                </dd>
                <dt className='mt-4 font-medium text-gray-900'>Invoice Date</dt>
                <dd className='mt-3 text-gray-500'>
                  <span className='block'>
                    {invoice?.attributes?.invoice_date}
                  </span>
                </dd>
              </div>

              <div>
                <dt className='font-medium text-gray-900'>Buyer information</dt>
                {/* Icon for office building */}

                <div className='mt-3'>
                  <dd className='-ml-4 -mt-4 flex flex-wrap'>
                    <div className='ml-4 mt-4 flex-shrink-0'>
                      <BuildingOfficeIcon
                        className='h-6 w-6 text-gray-400'
                        aria-hidden='true'
                      />
                    </div>
                    <div className='ml-4 mt-4'>
                      <p className='text-gray-900'>
                        {invoice?.attributes.buyer.data.attributes.name}
                      </p>
                      <p className='text-gray-600'>
                        {invoice?.attributes.buyer.data.attributes.address}
                      </p>
                    </div>
                  </dd>
                </div>
              </div>
            </dl>

            <dl className='mt-8 divide-y divide-gray-200 text-sm lg:mt-0 lg:col-span-5'>
              <div className='pb-4 flex items-center justify-between'>
                <dt className='text-gray-600'>Subtotal</dt>
                <dd className='font-medium text-gray-900'>&#8377;{subTotal}</dd>
              </div>
              <div className='py-4 flex items-center justify-between'>
                <dt className='text-gray-600'>Shipping</dt>
                <dd className='font-medium text-gray-900'>&#8377;{shipping}</dd>
              </div>
              <div className='py-4 flex items-center justify-between'>
                <dt className='text-gray-600'>Tax</dt>
                <dd className='font-medium text-gray-900'>&#8377;{tax}</dd>
              </div>
              {invoice?.attributes?.extra_charges.map((charge, idx) => (
                <div
                  className='py-4 flex items-center justify-between'
                  key={idx}
                >
                  <dt className='text-gray-600'>{charge.charge_type}</dt>
                  <dd className='font-medium text-gray-900'>
                    &#8377;{charge.amount}
                  </dd>
                </div>
              ))}
              <div className='py-4 flex items-center justify-between'>
                <dt className='text-gray-600'>Discount</dt>
                <dd className='font-medium text-gray-900'>
                  - &#8377;{discount}
                </dd>
              </div>
              <div className='pt-4 flex items-center justify-between'>
                <dt className='font-medium text-gray-900'>Order total</dt>
                <dd className='font-medium text-rose-600'>&#8377;{total}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Products */}
        <div className='mt-6'>
          <h2 className='sr-only'>Products purchased</h2>

          <table className='mt-4 w-full text-gray-500 sm:mt-6'>
            <caption className='sr-only'>Products</caption>
            <thead className='sr-only text-sm text-gray-700 text-left sm:not-sr-only'>
              <tr>
                <th
                  scope='col'
                  className='sm:w-2/5 lg:w-1/3 pr-8 py-3 font-normal'
                >
                  Product
                </th>
                <th
                  scope='col'
                  className='hidden w-1/5 pr-8 py-3 font-normal sm:table-cell'
                >
                  Unit price
                </th>
                <th
                  scope='col'
                  className='hidden w-1/5 pr-8 py-3 font-normal sm:table-cell'
                >
                  Quantity
                </th>
                <th
                  scope='col'
                  className='hidden pr-8 py-3 font-normal sm:table-cell'
                >
                  Category
                </th>
                <th scope='col' className='w-0 py-3 font-normal text-right'>
                  Item Total
                </th>
              </tr>
            </thead>
            <tbody className='border-b border-gray-200 divide-y divide-gray-200 text-sm sm:border-t'>
              {items.map((product) => (
                <>
                  <tr key={product.id}>
                    <td className='py-6 pr-8'>
                      <div className='flex items-center'>
                        {/* <img
                        src={product.imageSrc}
                        alt={product.imageAlt}
                        className='w-16 h-16 object-center object-cover rounded mr-6'
                      /> */}
                        <div>
                          <div className='font-medium text-gray-900 capitalize'>
                            {product.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='hidden py-6 pr-8 sm:table-cell text-gray-800 capitalize'>
                      &#8377;{product.rate}
                    </td>
                    <td className='hidden py-6 pr-8 sm:table-cell text-gray-800 capitalize'>
                      {product.quantity}
                    </td>

                    <td className='hidden py-6 pr-8 sm:table-cell text-gray-800 capitalize'>
                      {product.category.data?.attributes.name}
                    </td>
                    <td className='py-6 font-medium text-right whitespace-nowrap text-gray-900'>
                      &#8377; {calcItemTotal(product)}
                    </td>
                  </tr>
                  {product.item_charges?.map((charge, idx) => (
                    <div
                      className='py-4 flex items-center justify-between'
                      key={idx}
                    >
                      <dt className='text-gray-600'>{charge.charge_type}</dt>
                      <dd className='font-medium '>&#8377;{charge.amount}</dd>
                    </div>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
