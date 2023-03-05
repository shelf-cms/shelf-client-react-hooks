import { useEffect, useState } from "react"
import { getShelf } from 'shelf-cms-sdk'

const useUser = () => {
  const [user, setUser] = useState([getShelf().auth.currentUser, getShelf().auth.isAuthenticated])
  // console.log('update ', wush.auth.currentUser, wush.auth.isAuthenticated);

  useEffect(() => {
    return getShelf().auth.add_sub(setUser)
  }, [])
  
  return [user[0], user[1], { 
                  signin : getShelf().auth.signin_with_email_pass, 
                  signup : getShelf().auth.signup, 
                  signout : getShelf().auth.signout,
                  update : getShelf().auth.updateCurrentUser
                } ]  
}

export default useUser