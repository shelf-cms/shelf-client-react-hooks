import { useCallback, useEffect, 
         useMemo, useRef, 
         useState } from "react";
import { getShelf } from 'shelf-cms-sdk'
import test_coll from './collection_test.json'

const q = {
  orderBy: [['firstname', 'asc']],
  limit: -1,
}

/** 
 * @typedef {object} ProductData
 * @property {string[]} collections
 * @property {string} video
 * @property {number} price
 * @property {string} handle a unique readable identifier
 * @property {string[]} search
 * @property {string[]} tags
 * @property {string} desc
 * @property {string[]} media
 * @property {number} updatedAt
 * @property {number} qty
 * @property {string} title
 * @property {number} createdAt
 * @property {number} compareAtPrice
 */

/**
 * @typedef {Object} FilterData
 * @property {string} id id represented as {key}_{value}
 * @property {string} name value or name
 * @property {boolean} selected is it selected
 */

/**
 * @param {ProductData[]} data
 * 
 */
export const inferFilters = (data) => {
  /**@type {Set<string>} */
  const tags = new Set()
  /**@type {Map<string, number>} */
  const tags_counter = new Map()
  /**@type {Map<string, FilterData[]>} */
  const map = new Map()

  // first create unique and count
  data.forEach(
    it => {
      it.tags.filter(t => t.startsWith('filter:'))
        // .map(t => t.split('filter:').pop())
        .forEach(
          tag => {
            tags.add(tag)
            // let's count
            if(!tags_counter.has(tag)) 
              tags_counter.set(tag, 0)
            tags_counter.set(tag, tags_counter.get(tag)+1)
          }
        )
    }
  )

  // delete tags that appear in all the products
  // console.log('tags_counter ', tags_counter)
  for (let k of tags_counter.keys())
    if (tags_counter.get(k)==data.length)
      tags.delete(k)

  // now build the filter map
  for (const tag of tags.values()) {
    const [k, v] = tag.split('_')
    if(!map.has(k)) 
      map.set(k, []) 

    map.get(k).push({ 
      id: `${k}_${v}`, 
      name: v, 
      selected: false
    })
  }

  const filter_map_array = Array.from(map)
  // console.log('filter_map_array ', filter_map_array)
  // return map
  return filter_map_array
}

function get_data() {
  return data_test_(2)
}

/**
 * 
 * @param {ProductData[]} data 
 * @param {number} strategy 
 * @returns 
 */
export const sort = (data, strategy) => {
  let sort_fn = (a, b) => true
  // users.sort((a, b) => a.firstname.localeCompare(b.firstname))
  // console.log(strategy);
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
      sort_fn = (a, b) =>  -b.updatedAt + a.updatedAt
      break;
    case 6: // old to new
      sort_fn = (a, b) =>  b.updatedAt - a.updatedAt
      break;
    default:
      break;
  }

  // [].sort
  return data.sort(sort_fn)
}

/**
 * 
 * @param {ProductData[]} data 
 * @param {[string, FilterData[]][]} filter_map 
 * @returns 
 */
export const filter = (data, filter_map) => {
  
  const filtered = data.filter(
    product => {
      return filter_map.reduce(
        (prev, filter_vs) => {
          // skip a filter, that is muted
          if(filter_vs[1].every(fv => !fv.selected))
            return prev

          return prev &&
                 product?.tags.some(
                  t => filter_vs[1].some(
                      fv => fv.id===t && fv.selected
                    )
                  )
        }, true
      )
    }
  )

  return filtered
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
        const validHandle = handle!=='debug'
        // console.log('handle ', handle);
        // console.log('validHandle ', validHandle);
        const json = validHandle ?
               await getShelf().products.byCollectionHandle(handle) : 
               test_coll

        // console.log(json);

        // const json = test_coll
        all.current = {
          products : json.products,
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
          vs.forEach(v => {
            if(v.id===id) {
              // console.log(id, state)
              v.selected=state
            }
          })
        })
        return [...c]
      })
    }, []
  )

  const onSortChanged = useCallback(
    (idx) => {
      setSortOrder(idx)
    }
    , []
  )

  const products_filtered_sorted = useMemo(
    () => {
      // console.log('filters ', filters)
      let running = all.current?.products ?? []
      if(filters) 
        running = filter(running, filters)
      running = sort(running, sortOrder)
      return running
    }
    , [filters, sortOrder]
  ) 

  return [ 
    all.current.collection, 
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
