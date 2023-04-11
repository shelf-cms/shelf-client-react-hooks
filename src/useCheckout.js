import { useEffect, useState } from 'react'
import { getShelf } from 'shelf-client-js-sdk'
// import demo from './assets/checkout.json'
import { Session } from 'shelf-client-js-sdk/src/checkout'
import useTrigger from './common/useTrigger'

/**
 * @typedef {object} CheckoutError
 * @property {'address-invalid' | 'email-invalid' | string} message
 */

/**
 * @typedef {object} CheckoutStatus
 * @property {string} CheckoutStatus.name
 * 
 * @enum {CheckoutStatus}
 */
export const Status = {
  init : { name: 'init' },
  ready : { name: 'ready' },
  created : { name: 'created' },
  final : { name: 'final' },
}

const useCheckout = () => {
  /**@type {[session: Session]} */
  const [session, setSession] = useState({})
  const trigger = useTrigger()

  useEffect(
    () => {
      const s = getShelf().checkout?.session
      setSession(s ?? {})
      const sub = s?.add_sub(trigger)
      return sub
    }, []
  )

  return session
}

export default useCheckout