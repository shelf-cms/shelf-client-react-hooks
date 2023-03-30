import { useEffect, useState } from 'react'
import { getShelf } from 'shelf-client-js-sdk'
import test_coll from './collection_test.json'

/**
 * @template T
 * @param {string} collection collection id
 * @param {string} id document id
 * @param {T} dummy_type dummy type for jsDoc
 * @returns 
 */
const useApiDocument = (collection, id, dummy_type) => {
  const [error, setError] = useState(undefined)
  const [loading, setIsLoading] = useState(true)
  /**@type {[T]} */
  const [doc, setDoc] = useState(undefined)
  
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const isDebug = id==='debug'
        const [exists, $id, $data] = isDebug ? test_coll.products[0] : await getShelf()[collection].byId(id)
        setDoc($data)
      } catch (err) {
        setError(err)
        setDoc(undefined)
      } finally {
        setIsLoading(false)
      }
    }
    // if(id && collection)
    fetchData()
  }, [collection, id])

  return {
    doc, error, loading
  }
}

export default useApiDocument