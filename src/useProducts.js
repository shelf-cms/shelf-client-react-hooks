import { useCallback, useEffect, 
         useRef, useState } from 'react'
import { useCollection } from './useApiCollection'

/**
 * 
 * @param {string} text 
 * @param {number} max_tokens 
 * @returns 
 */
const text2tokens = (text, max_tokens=10) => {
  // console.log('text ', text);
  text = text?.trim().toLowerCase()
  const tokens = text?.match(/\S+/g)?.slice(0, max_tokens) ?? []
  if (text) 
    tokens.push(text)
  return tokens
}

/**@type {ProductData} */
const type = {}

/**
 * Modified collection for users
 * @param {string} uid user id
 * @param {number} limit limit for pagination
 * @returns 
 */
const useProducts = (search=undefined, limit=10) => {
  const [q, setQ] = useState({ search, limit })
  const q_initial = useRef({
    orderBy: [['updatedAt', 'asc']],
    limit: q.limit
  })

  const { pages, page, loading, error, 
          prev, next, query, colId } = 
          useCollection('products', q_initial.current, false, type)
  
  useEffect(
    () => {
      setQ({ search, limit })
    }, [search, limit]
  )
  const search_fn = useCallback(
    /**
     * @param {string} search 
     * @param {number} limit
     **/
    (search, limit) => {
      setQ(qq => ({ ...qq, 
                    search: search ?? qq.search, 
                    limit: limit ?? qq.limit})
      )
    }, []
  )

  useEffect(
    () => {
      // if(q.search===undefined)
        // return
      const tokens = text2tokens(q.search)
      const where = tokens?.length ? [['search', 'array-contains-any', tokens]] : undefined  
      query({
        ...q_initial.current, 
        where,
        limit : q.limit
      })
    }, [q]
  )

  return {
    pages, page, loading, error, 
    prev, next, 
    search: search_fn,
    query, 
    colId 
  }
}

export default useProducts