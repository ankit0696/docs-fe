import { Fragment, useEffect, useState } from 'react'
import axios from 'axios'
import { API_URL } from '@/config/index'
import qs from 'qs'
import {
  BuildingOfficeIcon,
  MinusCircleIcon,
  MinusIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function AddInvoice() {
  // fetch invoice data from api
  const [invoice, setInvoice] = useState(null)
  const [items, setItems] = useState([])
  const [shipping, setShipping] = useState()
  const [tax, setTax] = useState()
  const [subTotal, setSubTotal] = useState()
  const [total, setTotal] = useState()
  const [discount, setDiscount] = useState()
  const [itemCharges, setItemCharges] = useState([])
  const [products, setProducts] = useState([])
  const [recText, setRecText] = useState()

  // Calculating item total
  const calcItemTotal = (item) => {
    let itemTotal = 0
    itemTotal += item.rate * item.quantity
    item.item_charges.map((charge) => {
      itemTotal += charge.amount
    })
    return parseFloat(itemTotal)
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
    if (shipping > 0) {
      total += parseFloat(shipping)
    }
    if (tax > 0) {
      total += parseFloat(tax)
    }
    if (discount > 0) {
      total -= parseFloat(discount)
    }
    invoice?.attributes?.extra_charges.map((charge) => {
      total += charge.amount
    })
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
  const handleItemChargesChange = (idx, e) => {
    const { name, value } = e.target
    const list = [...itemCharges]
    list[idx][name] = value
    setItemCharges(list)
  }

  const handleRemoveItemCharges = (idx) => {
    const list = [...itemCharges]
    list.splice(idx, 1)
    setItemCharges(list)
  }

  const handleProductsChange = (idx, e) => {
    const { name, value } = e.target
    const list = [...products]
    list[idx][name] = value
    setProducts(list)
  }

  const handleRemoveProduct = (idx) => {
    const list = [...products]
    list.splice(idx, 1)
    setProducts(list)
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

  useEffect(() => {
    setSubTotal(calcSubTotal())
    setTotal(calcTotal())
  }, [items, shipping, tax, discount])

  return (
    <div className=''>
      <form className='max-w-2xl mx-auto pt-16 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8'>
        <div className='px-4 space-y-2 sm:px-0 sm:flex sm:items-baseline sm:justify-between sm:space-y-0'>
          <div className='flex sm:items-baseline sm:space-x-4'>
            <h1 className='text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl'>
              New Invoice
            </h1>
          </div>
          <div className='mt-4 sm:mt-0 sm:ml-4 '>
            <label
              htmlFor='file-upload'
              className='relative flex items-center px-4 py-2 text-sm font-medium text-white bg-rose-600 border border-transparent rounded-md shadow-sm cursor-pointer hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500'
            >
              <span>Upload Bill</span>
              <input
                id='file-upload'
                name='file-upload'
                type='file'
                className='sr-only'
              />
            </label>

            <p className='mt-2 text-sm text-gray-500'>
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
          <p className='text-sm text-gray-600'>
            Last Updated{' '}
            <time
              // todays date
              dateTime={new Date().toLocaleDateString()}
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
                  min={0}
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
                  min={0}
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
                  min={0}
                  name='discount'
                  id='discount'
                  className='mt-1 shadow-sm focus:ring-rose-500 focus:border-rose-500 block w-1/2 sm:text-sm border-gray-300 rounded-md'
                  onChange={(e) => setDiscount(e.target.value)}
                  value={discount}
                />
              </div>
              {/* Plus button to dynamic add fields for item charges which is a 
              repeatable component consisting of charge_type and amount */}
              <div className='py-4 flex items-center justify-between'>
                <label
                  htmlFor='item_charges'
                  className='block text-sm font-medium text-gray-700'
                >
                  Extra Charges (if any)
                </label>
                <button
                  type='button'
                  className='inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500'
                  onClick={() => setItemCharges([...itemCharges, ''])}
                >
                  <PlusIcon className='-ml-1 mr-2 h-5 w-5' aria-hidden='true' />
                  Add
                </button>
              </div>
              {itemCharges.map((charge, idx) => (
                <div
                  className='py-4 flex items-center justify-between'
                  key={idx}
                >
                  <button
                    type='button'
                    // className='inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500'
                    onClick={() => handleRemoveItemCharges(idx)}
                  >
                    <MinusCircleIcon
                      className='h-5 w-5 text-rose-600'
                      aria-hidden='true'
                    />
                  </button>
                  <input
                    type='text'
                    name='charge_type'
                    id='charge_type'
                    className='mt-1 shadow-sm focus:ring-rose-500 focus:border-rose-500 block w-1/3 sm:text-sm border-gray-300 rounded-md'
                    onChange={(e) => handleItemChargesChange(idx, e)}
                    placeholder='Charge Type'
                  />
                  <input
                    type='number'
                    min={0}
                    name='amount'
                    id='amount'
                    className='mt-1 shadow-sm focus:ring-rose-500 focus:border-rose-500 block w-1/3 sm:text-sm border-gray-300 rounded-md'
                    onChange={(e) => handleItemChargesChange(idx, e)}
                    placeholder='Amount'
                  />
                </div>
              ))}
              <div className='pt-4 flex items-center justify-between'>
                <dt className='font-medium text-gray-900'>Order total</dt>
                <dd className='font-medium text-rose-600'>&#8377;{total}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Products */}
        <div className='mt-6'>
          {/* Header for product containing Product	Unit price,Quantity,Category, Item Total */}
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-medium text-gray-900'>Products</h2>
            <button
              type='button'
              className='inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500'
              onClick={() => setProducts([...products, ''])}
            >
              <PlusIcon className='-ml-1 mr-2 h-5 w-5' aria-hidden='true' />
              Add Product
            </button>
          </div>
          <div className='mt-6 flex flex-col'>
            <div className='-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
              <div className='py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8'>
                <div className='shadow overflow-hidden border-b border-gray-200 sm:rounded-lg'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          Product
                        </th>
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          Unit price
                        </th>
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          Quantity
                        </th>
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          Category
                        </th>
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          Item Total
                        </th>
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {products.map((product, idx) => (
                        <tr key={idx}>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            <input
                              type='text'
                              name='product'
                              id='product'
                              className='mt-1 shadow-sm focus:ring-rose-500 focus:border-rose-500 block w-full sm:text-sm border-gray-300 rounded-md'
                              onChange={(e) => handleProductChange(idx, e)}
                              placeholder='Product Name'
                            />
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            <input
                              type='number'
                              min={0}
                              name='unit_price'
                              id='unit_price'
                              className='mt-1 shadow-sm focus:ring-rose-500 focus:border-rose-500 block w-full sm:text-sm border-gray-300 rounded-md'
                              onChange={(e) => handleProductChange(idx, e)}
                              placeholder='Unit Price'
                            />
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='text-sm text-gray-900'>
                              <input
                                type='number'
                                min={0}
                                name='quantity'
                                id='quantity'
                                className='mt-1 shadow-sm focus:ring-rose-500 focus:border-rose-500 block w-full sm:text-sm border-gray-300 rounded-md'
                                onChange={(e) => handleProductChange(idx, e)}
                                placeholder='Quantity'
                              />
                            </div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='text-sm text-gray-900'>
                              <input
                                type='text'
                                name='category'
                                id='category'
                                className='mt-1 shadow-sm focus:ring-rose-500 focus:border-rose-500 block w-full sm:text-sm border-gray-300 rounded-md'
                                onChange={(e) => handleProductChange(idx, e)}
                                placeholder='Category'
                              />
                            </div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            <input
                              type='number'
                              min={0}
                              name='item_total'
                              id='item_total'
                              className='mt-1 shadow-sm focus:ring-rose-500 focus:border-rose-500 block w-full sm:text-sm border-gray-300 rounded-md'
                              onChange={(e) => handleProductChange(idx, e)}
                              placeholder='Item Total'
                            />
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                            <button
                              type='button'
                              className='text-rose-600 hover:text-rose-900'
                              onClick={() => handleRemoveProduct(idx)}
                            >
                              <MinusCircleIcon
                                className='h-5 w-5'
                                aria-hidden='true'
                              />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit button to add invoice to DB */}
        {products.length > 0 && (
          <div className='flex justify-end py-2'>
            <button
              type='submit'
              className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500'
            >
              Submit
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
