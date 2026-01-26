import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'

const CartTotal = ({ total, items }) => {
  const { currency, getCartAmount } = useContext(ShopContext)
  
  // If total and items are provided (from PlaceOrder), use them
  // Otherwise, use context values (from Cart page)
  const displayTotal = total !== undefined ? total : (getCartAmount() || 0)
  
  // Calculate subtotal from items if provided
  const subtotal = items && items.length > 0 
    ? items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
    : displayTotal
  
  return (
    <div className="w-full">
      <div className="text-2xl">
        <Title text1={"Cart"} text2={"Totals"} />
      </div>
      <div className="flex flex-col gap-2 mt-4 text-sm">
        <div className="flex justify-between text-stone-600">
          <p>Subtotal</p>
          <p>{currency}{subtotal.toFixed(2)}</p>
        </div>
        <hr className="border-stone-200" />
        <div className="flex justify-between text-stone-800 font-semibold">
          <span>Total</span>
          <span>{currency}{displayTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

export default CartTotal
