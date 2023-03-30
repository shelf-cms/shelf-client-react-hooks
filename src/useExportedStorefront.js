import { useCallback, useEffect, 
         useMemo, useRef, 
         useState } from "react";
import { getShelf } from 'shelf-client-js-sdk'
import test_coll from './collection_test.json'

const useExportedStorefront = (handle=undefined) => {
  const [error, setError] = useState(undefined)
  const [loading, setIsLoading] = useState(true)
  const [data, setData] = useState(undefined)
  
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const validHandle = handle!=='debug'
        // console.log('handle ', handle);
        // console.log('validHandle ', validHandle);
        const json = validHandle ?
              //  await getShelf().products.byCollectionHandle(handle) : 
               await getShelf().store_fronts.byExported(handle) : 
               test_coll

        setData(json)
      } catch (err) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [getShelf(), handle])

  return [ 
    data, loading, error, 
  ]
}

export default useExportedStorefront
