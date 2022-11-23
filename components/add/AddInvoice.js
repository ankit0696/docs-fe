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

export default function AddInvoice() {
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
  const addBill = async () => {
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

  // fetch buyer data from api
  const [buyer, setBuyer] = useState([])
  const fetchBuyer = async () => {
    const toastId = toast.loading('Fetching buyer data...', {
      autoClose: false,
    })
    try {
      const res = await axios.get(`${API_URL}/api/buyers/`)
      // toast update after fetching data
      toast.update(toastId, {
        render: 'Buyer data fetched',
        type: toast.TYPE.SUCCESS,
        isLoading: false,
        autoClose: 5000,
      })
      setBuyer(res.data.data)
    } catch (err) {
      console.log(`Error: ${err}`)
      toast.update(toastId, {
        render: 'Error fetching buyer data',
        type: toast.TYPE.ERROR,
        isLoading: false,
        autoClose: 5000,
      })
    }
  }

  useEffect(() => {
    fetchBuyer()
  }, [])

  return (
    <div className=''>
      <form className='max-w-2xl mx-auto pt-16 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8'>
        <div className='px-4 space-y-2 sm:px-0 sm:flex sm:items-baseline sm:justify-between sm:space-y-0'>
          <div className='flex sm:items-baseline sm:space-x-4'>
            <h1 className='text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl'>
              New Order
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
              // todays date
              dateTime={new Date().toISOString()}
              className='font-medium text-gray-900'
            >
              {new Date().toLocaleDateString()}
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
                <div className='pb-4'>
                  <label
                    htmlFor='vendor_name'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Vendor Details
                    {/* Required field */}
                    <span className='text-rose-600' aria-hidden='true'>
                      *
                    </span>
                  </label>
                  <input
                    type='text'
                    name='vendor_name'
                    id='vendor_name'
                    required
                    className='mt-1 shadow-sm focus:ring-rose-500 focus:border-rose-500 block w-full sm:text-sm border-gray-300 rounded-md'
                  />
                </div>

                <div className='pb-4'>
                  <label
                    htmlFor='invoice_date'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Invoice Date
                    {/* Required field */}
                    <span className='text-rose-600' aria-hidden='true'>
                      *
                    </span>
                  </label>
                  <input
                    type='date'
                    name='invoice_date'
                    id='invoice_date'
                    required
                    className='mt-1 shadow-sm focus:ring-rose-500 focus:border-rose-500 block w-full sm:text-sm border-gray-300 rounded-md'
                  />
                </div>
              </div>

              <div>
                <dt className='font-medium text-gray-900'>
                  Buyer information
                  {/* Required field */}
                  <span className='text-rose-600' aria-hidden='true'>
                    *
                  </span>
                </dt>
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
                      {/* Input as dropdown for buyer information, need to fetch from API */}
                      <select
                        id='buyer'
                        name='buyer'
                        required
                        className='mt-1 shadow-sm focus:ring-rose-500 focus:border-rose-500 block w-full sm:text-sm border-gray-300 rounded-md'
                      >
                        <option value=''>Select Buyer</option>
                        {buyer.map((buyer) => (
                          <option key={buyer.id} value={buyer.id}>
                            {buyer.attributes.name}
                          </option>
                        ))}
                      </select>

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
                <label
                  htmlFor='shipping'
                  className='block text-sm font-medium text-gray-700'
                >
                  Shipping
                </label>
                <input
                  type='number'
                  name='shipping'
                  id='shipping'
                  className='mt-1 shadow-sm focus:ring-rose-500 focus:border-rose-500 block w-1/2 sm:text-sm border-gray-300 rounded-md'
                  onChange={(e) => setShipping(e.target.value)}
                  value={shipping}
                />
              </div>
              <div className='py-4 flex items-center justify-between'>
                <label
                  htmlFor='tax'
                  className='block text-sm font-medium text-gray-700'
                >
                  Tax
                </label>
                <input
                  type='number'
                  name='tax'
                  id='tax'
                  className='mt-1 shadow-sm focus:ring-rose-500 focus:border-rose-500 block w-1/2 sm:text-sm border-gray-300 rounded-md'
                  onChange={(e) => setTax(e.target.value)}
                  value={tax}
                />
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
                <label
                  htmlFor='discount'
                  className='block text-sm font-medium text-gray-700'
                >
                  Discount
                </label>
                <input
                  type='number'
                  name='discount'
                  id='discount'
                  className='mt-1 shadow-sm focus:ring-rose-500 focus:border-rose-500 block w-1/2 sm:text-sm border-gray-300 rounded-md'
                  onChange={(e) => setDiscount(e.target.value)}
                  value={discount}
                />
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
      </form>
    </div>
  )
}
