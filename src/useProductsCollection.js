import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getShelf } from 'shelf-cms-sdk'
import test_coll from './collection_test.json'

const q = {
  orderBy: [['firstname', 'asc']],
  limit: -1,
}

export const inferFilters = (data) => {
  const tags = new Set()
  const tags_counter = new Map()
  const map = new Map()

  // first create unique and count
  data.forEach(it => {
    it.tags.forEach(tag => {
      tags.add(tag)
      // let's count
      if(!tags_counter.has(tag)) tags_counter.set(tag, 0)
      tags_counter.set(tag, tags_counter.get(tag)+1)
    })
  });

  // delete tags that appear in all the products
  console.log('tags_counter ', tags_counter)
  for (let k of tags_counter.keys())
    if (tags_counter.get(k)==data.length)
      tags.delete(k)

  // now build the filter map
  for (const tag of tags.values()) {
    const [k, v] = tag.split('_')
    if(!map.has(k)) map.set(k, []) 
    map.get(k).push({ id: `${k}_${v}`, name: v, selected: false})
  }

  // return map
  return Array.from(map)
}

function get_data() {
  return data_test_(2)
}

export const sort = (data, strategy) => {
  let sort_fn = (a, b) => true
  // users.sort((a, b) => a.firstname.localeCompare(b.firstname))
  console.log(strategy);
  switch (parseInt(strategy)) {
    case 0: // price high
      sort_fn = (a, b) => -a.price + b.price
      break;
    case 1: // price low
      sort_fn = (a, b) => -b.price + a.price
      break;
    case 2: // popularity high
      // sort_fn = (a, b) => a.rating < b.rating
      sort_fn = (a, b) => 0
      break;
    case 3: // A-Z
      sort_fn = (a, b) => a.title.localeCompare(b.title)
      break;
    case 4: // Z-A
      sort_fn = (a, b) => b.title.localeCompare(a.title)
      break;
    case 5: // new to old
      sort_fn = (a, b) =>  -new Date(b.createdAt) + new Date(a.createdAt);
      break;
    case 6: // old to new
      sort_fn = (a, b) =>  new Date(b.createdAt) - new Date(a.createdAt);
      break;
    default:
      break;
  }

  // [].sort
  return data.sort(sort_fn)
}

export const filter = (data, filter_map) => {
  const filter_map_2 = filter_map.reduce((map, obj) => {
    // array of values
    // let vs = new Set(obj[1].map(it => it.selected ? it.id : -1))
    let vs = new Set(obj[1].map(it => it.selected ? it.name : -1))
    vs.delete(-1)
    map.set(obj[0], vs)
    return map
  }, new Map())

  const tags_to_map = tags => {
    const map = new Map()
    tags.forEach(tag => {
      const [k, v] = tag.split('_')
      if(!map.has(k)) map.set(k, []) 
      map.get(k).push(v)
    })
    return map
  }

  const filtered = data.filter(it => {
    const it_tags = tags_to_map(it.tags)

    let running = true
    for (const [k, vs] of it_tags.entries()) {
      // if previous val was false we collapse all,
      // because it is a logical AND
      if(!running) return false
      const filter_vs = filter_map_2.get(k)
      // if the category name is absent or nothing is elected we continue
      if(filter_vs===undefined || filter_vs.size==0) continue
      // otherwise let's find any, check using OR
      const any_found = vs.reduce((p, c) => filter_vs.has(c) || p, false)
      if(!any_found) return false
    }
    return true
  })

  return filtered
}

function mul(arr, n=2) {
  let res = arr
  for (let ix = 0; ix < n; ix++)
    res = [...res, ...arr]
  return res
}

const useProductsCollection = (handle=undefined, default_sort=0) => {
  const [filters, setFilters] = useState(undefined)
  const [sortOrder, setSortOrder] = useState(default_sort)
  const [error, setError] = useState(undefined)
  const [loading, setIsLoading] = useState(true)
  const all = useRef({})
  
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const validHandle = false//handle!=='debug'
        // console.log('handle ', handle);
        // console.log('validHandle ', validHandle);
        const json = validHandle ? await getShelf().products.byCollectionHandle(handle) : test_coll
        // const json = test_coll
        all.current = {
          products : mul(json.products, 1), 
          collection : json.collection, 
        }
        setFilters(inferFilters(json.products))
      } catch (err) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [getShelf(), handle])

  const onFilterChange = useCallback(
    (id, state) => { 
      setFilters(c => {
        c.forEach(([k, vs]) => {
          vs.forEach(v => {if(v.id==id) v.selected=state})
        })
        return [...c]
      })
    }, []
  )

  const onSortChanged = useCallback(
    (idx) => {
      setSortOrder(idx)
    }
  , [])

  const products_filtered_sorted = useMemo(
    () => {
      let running = all.current?.products ?? []
      if(filters) running = filter(running, filters)
      running = sort(running, sortOrder)
      return running
    }
  , [filters, sortOrder]) 

  return [ all.current.collection, 
           products_filtered_sorted, 
           loading, error, 
          { 
            sortOrder,
            filters,
            onFilterChange,
            onSortChanged
          }
        ]
}

export default useProductsCollection
