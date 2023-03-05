import useApiDocument from './useApiDocument'

/**@type {OrderData} */
const type = {}

/**
 * @param {string} id id
 * @returns 
 */
const useOrder = (id) => {
  return useApiDocument('orders', id, type)
}

export default useOrder