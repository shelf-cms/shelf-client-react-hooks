import { useEffect, useState } from 'react'
import { getShelf } from 'shelf-cms-sdk'
import test_coll from './collection_test.json'

const useApiDocument = (collection, id) => {
  const [error, setError] = useState(undefined)
  const [loading, setIsLoading] = useState(true)
  const [doc, setDoc] = useState(undefined)
  
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const isDebug = handle==='debug'
        const [exists, $id, $data] = isDebug ? test_coll.products[0] : await getShelf()[collection].byId(id)
        setDoc($data)
      } catch (err) {
        setError(err)
        setDoc(undefined)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [getShelf(), collection, id])

  return [
    doc, error, loading
  ]
}

export default useApiDocument