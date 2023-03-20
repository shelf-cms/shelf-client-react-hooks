import { useEffect, useState } from 'react'
import { getShelf } from 'shelf-client-sdk'
import { UserData } from 'shelf-client-sdk/src/js-docs-types' 

const useUser = () => {
  
  /**@type {[user: UserData]} */
  const [user, setUser] = useState(getShelf().auth.currentUser)
  const [authenticated, setAuthenticated] = useState(getShelf().auth.isAuthenticated)
  // console.log('update ', wush.auth.currentUser, wush.auth.isAuthenticated);

  useEffect(() => {
    return getShelf().auth.add_sub(
      ([u, a]) => {
        setUser(u)
        setAuthenticated(a)
      }
    )
  }, [])

  return {
    user,
    authenticated,
    actions: {
      signin : getShelf().auth.signin_with_email_pass, 
      signup : getShelf().auth.signup, 
      signout : getShelf().auth.signout,
      update : getShelf().auth.updateCurrentUser
    }
  } 
}

export default useUser