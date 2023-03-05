import { useCallback, useEffect, 
         useRef, useState } from 'react'
import { useCollection } from './useApiCollection'

/**@type {OrderData} */
const type = {}

/**
 * Modified collection for users
 * @param {string} uid user id
 * @param {number} limit limit for pagination
 * @returns 
 */
const useOrders = (uid=undefined, limit=10) => {
  const [q, setQ] = useState({ uid, limit })
  const q_initial = useRef({
    orderBy: [['updatedAt', 'asc']],
    limit: q.limit
  })

  const { pages, page, loading, error, 
          prev, next, query, colId } = 
          useCollection('orders', q_initial.current, false, type)
  
  useEffect(
    () => {
      setQ({ uid, limit })
    }, [uid, limit]
  )
  const queryByUserId = useCallback(
    /**@param {string} uid */
    (uid) => {
      setQ(qq => ({ ...qq, uid}))
    }, []
  )

  useEffect(
    () => {
      if(q.uid===undefined)
        return
      const where = [['search', 'array-contains', `uid:${q.uid}`]]
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
    queryByUserId,
    query, 
    colId 
  }
}

export default useOrders