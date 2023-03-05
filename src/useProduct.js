import { useEffect, useState } from 'react'
import { getShelf } from 'shelf-cms-sdk'
import test_coll from './collection_test.json'

/**
 * 
 * @param {string} handle 
 * @returns {[product: ProductData, error: any, loading: boolean]}
 */
const useProduct = ( handle=0 ) => {
  const [error, setError] = useState(undefined)
  const [loading, setIsLoading] = useState(true)
  const [product, setProduct] = useState(undefined)
  
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const isDebug = handle==='debug'
        const json = isDebug ? test_coll.products[0] : await getShelf().products.byHandle(handle)
        setProduct(json[2])
      } catch (err) {
        setError(err)
        setProduct(undefined)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [handle])

  return [
    product, error, loading
  ]
}

export default useProduct