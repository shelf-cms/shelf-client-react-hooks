import { useCallback, useEffect, useRef, useState } from 'react'
import useTrigger from './common/useTrigger'
import { getShelf } from 'shelf-cms-sdk'


/**
 * 
 * @param {string} what id
 * @param {any[][]} list list of lists
 * @returns {any[][]}
 */
const delete_from_collection = what => list => {
  let wx = -1
  let ix = -1
  let br = false
  for (wx=0; wx < list.length; wx++) {
    for (ix = 0; ix < list[wx].length; ix++) {
      const id = list[wx][ix][0]
      if(id===what) {
        br=true; break
      }
    }
    if(br) break
  }

  if(!br)
    return list
    
  // console.log('list1 ', list);
  list = [...list]    
  list[wx] = [...list[wx]]
  list[wx].splice(ix, 1)
  // console.log('wx ', wx, 'ix ', ix);
  // console.log('list ', list);
  return list
}


/**
 * @template T
 * @param {string} colId 
 * @param {object} q query
 * @param {boolean} autoLoad 
 * @param {T} dummy_type 
 * @returns 
 */
export const useCollection = 
  (colId, q=undefined, autoLoad=true, dummy_type) => {

  const _q = useRef(q)
  const _hasEffectRan = useRef(false)
  /**@type {() => Promise<[string, T[]][]>} */
  const _next = useRef(getShelf().db.col(colId).paginate2(q))
  const [error, setError] = useState(undefined)
  /**@type {[[string, T][][]]} */
  const [pages, setPages] = useState([])
  const [index, setIndex] = useState(-1)
  const [loading, setIsLoading] = useState(autoLoad)
  const trigger = useTrigger()
  
  // console.log('windows ',  windows);

  useEffect(
    () => getShelf().auth.add_sub(trigger)
    , [trigger]
  )

  const _internal_fetch_next = useCallback(
    /**
     * @param {boolean} is_new_query 
     */
    async (is_new_query=false) => {
      setIsLoading(true)
      try {
        const res = await _next.current()
        if(is_new_query) {
          setIndex(0)
          setPages([[...res]])
        } else {
          setIndex(idx => idx+1)
          setPages(ws => [...ws, [...res]])
        }

      } catch (err) {
        setError(err?.code)
        // throw err
      } finally {
        setIsLoading(false)
      }
    }, []
  )

  // A wrapped optimized pagination
  const paginate = useCallback(
    /**
     * @param {boolean} up paginate up or down
     * @returns 
     */
    (up) => {
      if(!_next.current) return Promise.resolve()
      const hm = up ? 1 : -1
      if(index + hm < 0) return Promise.resolve()
      if(index+hm < pages.length) {
        setIndex(index+hm)
        return Promise.resolve()
      }
      // else let's fetch
      return _internal_fetch_next()
    }, [pages, index, _internal_fetch_next]
  )

  const next = useCallback(
    () => paginate(true)
    , [paginate]
  )
  const prev = useCallback(
    () => paginate(false)
    , [paginate]
  )

  const deleteDocument = useCallback(
    /**@param {string} docId */
    async (docId) => {
      try {
        await getShelf()[colId].delete(docId)
        setPages(delete_from_collection(docId))
        return docId
      } catch (err) {
        setError(err)
        setIsLoading(false)
        throw err
      }
    }, [colId]
  )

  const query = useCallback(
    /**
     * @param {object} q query object
     * @param {boolean} from_cache 
     */
    (q, from_cache=false) => {
      _q.current = q
      _next.current = getShelf().db.col(colId).paginate2(q, from_cache) 
      return _internal_fetch_next(true)
    }, [colId, _internal_fetch_next]
  )

  useEffect(
    () => {
      if(autoLoad && index==-1 && !_hasEffectRan.current) {
        query(_q.current)
      }
    }, []
  )

  return { pages, page: index>=0 ? pages[index] : [], 
           loading, error, 
           prev, next, query, 
           deleteDocument, 
           colId 
        }
}

const text2tokens = (text, max_tokens=10) => {
  // console.log('text ', text);
  text = text?.trim().toLowerCase()
  const tokens = text?.match(/\S+/g)?.slice(0, max_tokens) ?? []
  if (text) 
    tokens.push(text)
  return tokens
}

/**
 * Modified collection with modified search query
 * 
 * @template T
 * @param {string} colId 
 * @param {number} limit 
 * @param {boolean} autoLoad 
 * @param {T} dummy_type 
 */
export const useCommonCollection = 
  (colId, limit=10, autoLoad=true, dummy_type) => {

  const q_initial = useRef(initial_query ?? {
    orderBy: [['updatedAt', 'desc']],
    limit
  })

  const { pages, page, loading, error, 
          prev, next, query : queryParent, deleteDocument } = 
          useCollection(colId, q_initial.current, autoLoad, dummy_type)

  const query = useCallback(
    (q, from_cache=false) => {
      const tokens = text2tokens(q.search)
      const where = tokens?.length ? [['search', 'array-contains-any', tokens]] : undefined
      return queryParent({
        ...q_initial.current, 
        where,
        ...q
      }, from_cache)
    }, [queryParent]
  )

  return { pages, page, loading, error, 
          prev, next, 
            query, 
            deleteDocument, 
            colId 
          }
}


const search2Where = terms => {
  const tokens = text2tokens(q.search)
  return tokens?.length ? [['search', 'array-contains-any', tokens]] : undefined
}

/**
 * Modified collection with modified search query
 * 
 * @param {string} colId 
 * @param {number} initial_limit 
 * @param {boolean} autoLoad 
 * @returns {UseCollectionReturn}
 */
 export const useCommonCollectionWithSearch = 
  (colId, initial_limit=10, autoLoad=true) => {

  const q_initial = useRef({
    orderBy: [['updatedAt', 'desc']],
    limit: initial_limit
  })

  const { pages, page, loading, error, 
          prev, next, query, deleteDocument } = 
          useCollection(colId, q_initial.current, autoLoad)

  const search = useCallback(
    (q, from_cache=false) => {
      const { search, ...rest_q } = q
      return query({
        ...q_initial.current, 
        where: search2Where(search),
        ...rest_q
      }, from_cache)

    }, [query]
  )

  return { pages, page, loading, error, 
           prev, next, 
           query, 
           search,
           deleteDocument, 
           colId 
          }
}

/**
 * Modified collection for users
 * @param {*} limit 
 * @param {*} autoLoad 
 * @returns 
 */
export const useUsers = (limit=10, autoLoad=true) => {
  const q_initial = useRef({
    orderBy: [['updatedAt', 'asc']],
    limit
  })

  const [windows, window, loading, error, 
          { prev, next, setQuery : setQueryParent, deleteDocument, colId }] = 
          useCollection('users', q_initial.current, autoLoad)

  const [query, setQuery] = useState( { limit, search: undefined } )

  useEffect(() => {
    const tokens = text2tokens(query.search)
    const where = tokens?.length ? [['search', 'array-contains-any', tokens]] : undefined
    setQueryParent({
      ...q_initial.current, 
      where,
      limit : query.limit
    })
  }, [query])

  return [windows, window, loading, error, 
          { prev, next, 
            setQuery, 
            deleteDocument, 
            reload, colId }]
}
