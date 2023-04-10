import { getShelf } from 'shelf-client-js-sdk'
import { useCallback, useEffect, useState } from 'react'
import { ProductData, LineItem } from 'shelf-client-js-sdk/src/js-docs-types'

const useCart = () => {
  const [cart, setCart] = useState(getShelf()?.cart?.get())
  const [ready, setReady] = useState(false)

  useEffect(
    () => {
      setReady(true)
      setCart(getShelf()?.cart?.get())
      return getShelf()?.cart?.add_sub(setCart)
    }, []
  )
  
  const reset = useCallback(
    () => getShelf().cart.reset(), []
  )
  const add = useCallback(
    /**
     * @param {string} id 
     * @param {number} count 
     * @param {number} max_count 
     * @param {ProductData} data 
     * @returns {LineItem | undefined}
     */
    (id, count, max_count, data) => 
      getShelf().cart.addLineItem(id, count, max_count, data)
      , []
  )
  const update = useCallback(
    /**
     * @param {string} id 
     * @param {number} count 
     * @param {number} max_count 
     * @param {ProductData} data 
     * @returns {LineItem | undefined}
     */
    (id, count, max_count, data) =>
    
      getShelf().cart.updateLineItem(id, count, max_count, data)
    , []
  )
  const remove = useCallback(
    /**
     * @param {string} id 
     * @returns {LineItem | undefined}
     */
    (id) => 
      getShelf().cart.removeLineItem(id)
    , []
  )
  const get = useCallback(
    /**
     * @param {string} id 
     * @returns {LineItem | undefined}
     */
    (id) => 
      getShelf().cart.getLineItem(id)
    , []
  )


  const total = useCallback(
    () => getShelf().cart.total()
    , []
  )

  const controller = {
    add, get, remove, update, reset, total
  }

  return {
    ready, cart, controller
  }
}

export default useCart