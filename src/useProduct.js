import useApiDocument from './useApiDocument'

/**@type {ProductData} */
const type = {}

/**
 * @param {string} id id
 * @returns 
 */
const useProduct = (id) => {
  return useApiDocument('products', id, type)
}

export default useProduct