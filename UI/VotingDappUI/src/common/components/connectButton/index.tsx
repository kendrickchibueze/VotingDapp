import { type AppDispatch, useAppSelector } from "../../../state/store.ts";
import { useDispatch } from "react-redux";
import { connectWallet } from "../../../state/services/wallet.service.ts";

export default function ConnectButton() {
  //useAppSelector would retrieve from our state automatically
  const isConnecting = useAppSelector((s) => s.wallet.isConnecting);
  const isConnected = useAppSelector((s) => s.wallet.isConnected);
  const accountAddress = useAppSelector((s) => s.wallet.accountAddress);
  const dispatch: AppDispatch = useDispatch(); //creates a dispatch function
  // and we would use the dispatch hook to dispatch that function to our store and our reducer would call that action

  return (
    <button
      disabled={accountAddress !== undefined || isConnecting}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        dispatch(connectWallet());
      }}
    >
      {accountAddress ? accountAddress : "Connect Wallet"}
    </button>
  );
}
