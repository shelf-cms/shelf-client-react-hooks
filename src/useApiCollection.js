import { useCallback, useEffect, useRef, useState } from 'react'
import useTrigger from './common/useTrigger'
import { getShelf } from 'shelf-cms-sdk'

const q_default = {
  orderBy: [['updatedAt', 'desc']],
  limit: 10,
}

export const useQueryApiCollection = (colId, q=q_default, autoLoad=true) => {
  const _q = useRef(q)
  const _next = useRef(getShelf().db.col(colId).paginate2(q))
  const [error, setError] = useState(undefined)
  const [windows, setWindows] = useState([])
  const [index, setIndex] = useState(-1)
  const [loading, setIsLoading] = useState(autoLoad)
  const trigger = useTrigger()
  
  useEffect(() => {
    return getShelf().auth.add_sub(trigger)
  }, [trigger, getShelf])

  const _internal_fetch_next = useCallback(
    (from_cache=false) => {
    return new Promise((resolve, reject) => {
      setIsLoading(true)
      _next.current(from_cache)
        .then(res => {
          if(res.length) {
            setIndex(idx => idx+1)
            setWindows(ws => [...ws, res])
          }
          setIsLoading(false)
        })
        .then(resolve)
        .catch(err => {
          setError(err?.code)
          setIsLoading(false)
          reject(err)
        })
    })
  }, [])

  // A wrapped optimized pagination
  const paginate = useCallback((up, from_cache=false) => {
    if(!_next.current)  return Promise.resolve()
    const hm = up ? 1 : -1
    if(index + hm < 0) return Promise.resolve()
    if(index+hm < windows.length) {
      setIndex(index+hm)
      return Promise.resolve()
    }

    // else let's fetch
    return _internal_fetch_next(from_cache)
  }, [windows, index, _internal_fetch_next])

  const next = useCallback((from_cache=false) => paginate(true, from_cache),  [paginate])
  const prev = useCallback((from_cache=false) => paginate(false, from_cache), [paginate])

  const query = useCallback((q, from_cache=false) => {
    _q.current = q
    _next.current = getShelf().db.col(colId).paginate2(q) 
    setIndex(-1)
    setWindows([])
    return _internal_fetch_next(from_cache)
  }, [getShelf(), colId, _internal_fetch_next])

  useEffect(() => {
    if(autoLoad && index==-1) query(_q.current)
  }, [])

  return [ windows, index>=0 ? windows[index] : [], 
           loading, error, 
           { prev, next, query }
         ]
}

const text2tokens = (text, max_tokens=10) => {
  text = text?.trim()
  const tokens = text?.match(/\S+/g)?.slice(0, max_tokens) ?? []
  if (text) 
    tokens.push(text)
  return tokens
}

const search_to_where = search => {
  const tokens = text2tokens(search)
  return tokens?.length ? 
            [['search', 'array-contains-any', tokens]] : 
            undefined
}

/**
 * 
 * Modified collection for users
 * @param {*} limit 
 * @param {*} autoLoad 
 * @returns 
 */
 export const useSearchApiCollection = (colId, search='', limit=10, autoLoad=true) => {
  const q_initial = useRef({
    orderBy: [['updatedAt', 'desc']],
    limit,
    where : search_to_where(search)
  })

  const [windows, window, loading, error, 
          { prev, next, query : queryParent }] = 
          useQueryApiCollection(colId, q_initial.current, autoLoad)

  const query = useCallback(($search, $limit, from_cache=false) => {
    return queryParent({
      ...q_initial.current, 
      where : search_to_where($search),
      limit : $limit ?? limit
    }, from_cache)
  }, [queryParent, limit])

  return [windows, window, loading, error, 
          { 
            prev, next, 
            search : query, 
          }
         ]
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
          { prev, next, setQuery : setQueryParent, deleteDocument, reload, colId }] = 
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