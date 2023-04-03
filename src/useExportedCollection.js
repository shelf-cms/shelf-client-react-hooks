import { useCallback, useEffect, 
         useMemo, useRef, 
         useState } from "react";
import { getShelf } from 'shelf-client-js-sdk'
import test_coll from './collection_test.json'
import { CollectionExportedData } from 'shelf-client-js-sdk/src/js-docs-types'

/**
 * 
 * @param {*} handle 
 * @returns 
 */
const useExportedCollection = (handle=undefined) => {
  const [error, setError] = useState(undefined)
  const [loading, setIsLoading] = useState(true)
  /**@type {[data: CollectionExportedData]} */
  const [data, setData] = useState(undefined)
  
  useEffect(
    () => {
      async function fetchData() {
        setIsLoading(true)
        try {

          const validHandle = handle!=='debug'
          // console.log('validHandle ', validHandle);
          const json = validHandle ?
                //  await getShelf().products.byCollectionHandle(handle) : 
                await getShelf().collections.byExported(handle) : 
                test_coll


          setData(json)
        } catch (err) {
          console.error(err)
          setError(err)
        } finally {
          setIsLoading(false)
        }
      }
      fetchData()
    }, [getShelf(), handle]
  )

  return {
    data, loading, error, 
  }
}

export default useExportedCollection
