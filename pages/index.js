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


  const getFlowBalance = async (address) => {
    const cadence = `
      import FlowToken from 0x7e60df042a9c0868
      import FungibleToken from 0x9a0766d93b6608b7
      
      pub fun main(address: Address): UFix64{
        let account = getAccount(address)
        let path = /public/flowTokenBalance
  
        let vaultRef = account.getCapability(path)
          .borrow<&FlowToken.Vault{FungibleToken.Balance}>()
          ?? panic("Could not borrow Balance reference to the Vault")
  
        return vaultRef.balance
      }
    `;
    const args = (arg, t) => [arg(address, t.Address)];
    const balance = await fcl.query({ cadence, args });
    console.log({ balance });
  };

  const sendFlow = async (recepient, amount) => {
    const cadence = `
      import FlowToken from 0x7e60df042a9c0868
      import FungibleToken from 0x9a0766d93b6608b7
  
      transaction(recepient: Address, amount: UFix64){
        prepare(signer: AuthAccount){
          let sender = signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow Provider reference to the Vault")
  
          let receiverAccount = getAccount(recepient)
  
          let receiver = receiverAccount.getCapability(/public/flowTokenReceiver)
            .borrow<&FlowToken.Vault{FungibleToken.Receiver}>()
            ?? panic("Could not borrow Receiver reference to the Vault")
   
          receiver.deposit(from: <- sender.withdraw(amount: amount))
        }
      }
    `;
    const args = (arg, t) => [arg(recepient, t.Address), arg(amount, t.UFix64)];
    const limit = 500;
  
    const txId = await fcl.mutate({
      cadence,
      args,
      limit,
      proposer: fcl.authz,
      authorizations: [fcl.authz]
    });
    console.log("Waiting for transaction to be sealed...");
    
    console.log({ txId });
  };
  
  const AuthedState = () => {
    return (
      <div>
        <div>Address: {user?.addr ?? "No Address"}</div>
        <div>Profile Name: {greet ?? "--"}</div> {/* NEW */}
        <button onClick={sendQuery}>Send Query</button> {/* NEW */}
        <button onClick={fcl.unauthenticate}>Log Out</button>
        <button onClick={()=>{getFlowBalance("0xe980ac3a631ef292")}}>Get Balance</button>
        <button onClick={()=>{sendFlow("0xe980ac3a631ef292","133.4")}}>Send Flow</button>
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