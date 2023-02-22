import  { getShelf } from 'shelf-cms-sdk'
import { useCallback, useEffect, useState } from "react"

const useCart = () => {
  const [cart, setCart] = useState(getShelf().cart.get())

  useEffect(() => {
    return getShelf().cart.add_sub(setCart)
  }, [getShelf()])
  
  const reset = useCallback(() => getShelf().cart.reset(), [getShelf()])
  const add = useCallback((id, count, max_count, data) => {
    getShelf().cart.addLineItem(id, count, max_count, data)
  }, [getShelf()])
  const update = useCallback((id, count, max_count) => {
    getShelf().cart.updateLineItem(id, count, max_count)
  }, [getShelf()])
  const remove = useCallback((id) => {
    console.log(getShelf().cart)
    getShelf().cart.removeLineItem(id)
  }, [getShelf()])
  const get = useCallback((id) => {
    getShelf().cart.getLineItem(id)
  }, [getShelf()])

  const total = useCallback(getShelf().cart.total, [getShelf()])

  const controller = {
    add, get, remove, update, reset, total
  }

  return [cart, controller]
}

export default useCart