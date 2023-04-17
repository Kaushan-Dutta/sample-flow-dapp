import Head from 'next/head'
import "../flow/config";
import React,{ useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";

export default function Home() {

  const [user, setUser] = useState({loggedIn: null})
  const [greet, setGreet] = useState('')
  const [update,setUpdate]=useState('');

  useEffect(() => fcl.currentUser.subscribe(setUser), [])

	// NEW
  const sendQuery = async () => {
    const profile = await fcl.query({
      cadence: `
        import Greetings from 0xProfile
        pub fun main():String{
            return(Greetings.hello());
        }
      `
    })
    console.log(profile)
    setGreet(profile ?? 'No Greet')
  }
  const executeTransaction = async () => {
    
  }

  const sendUpdate=async(e)=>{
    e.preventDefault();
    console.log(update);
    const createGreet = await fcl.mutate({
      cadence: `
          import Greetings from 0xProfile

          transaction(greet:String) {
          
            prepare(acct: AuthAccount) {
            }
            execute {
              Greetings.setGreet(greet:greet);

            }
          }
      `,
      args: (arg, t) => [arg(update, t.String)],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 999
    })
    console.log(createGreet);
  }

  const AuthedState = () => {
    return (
      <div>
        <div>Address: {user?.addr ?? "No Address"}</div>
        <div>Profile Name: {greet ?? "--"}</div> {/* NEW */}
        <button onClick={sendQuery}>Send Query</button> {/* NEW */}
        <button onClick={fcl.unauthenticate}>Log Out</button>
        
        <div className=''>
          <p></p>
          <input autoFocus="autofocus" type="text" placeholder='Send Greet' onChange={(event)=>{setUpdate(event.target.value)}} value={update} />
          <button onClick={sendUpdate}>Submit</button>
        </div>
      </div>
    )
  }

  const UnauthenticatedState = () => {
    return (
      <div>
        <button onClick={fcl.logIn}>Log In</button>
        <button onClick={fcl.signUp}>Sign Up</button>
      </div>
    )
  }

  return (
    <div>
      
      <h1>Flow App</h1>
      {user.loggedIn
        ? <AuthedState />
        : <UnauthenticatedState />
      }
    </div>
  );
}