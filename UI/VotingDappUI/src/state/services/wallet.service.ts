import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {BrowserProvider, ethers, JsonRpcSigner} from "ethers";
import type {RootState} from "../store.ts";


const config:{
    provider?:BrowserProvider;
    signer?:JsonRpcSigner
} = {}

export const getSigner = () => config.signer
if((window as any).ethereum !== null){
    config.provider  = new ethers.BrowserProvider((window as any).ethereum);
    (window as any).ethereum?.on("accountsChanged", ()=>{
        window.location.reload()
    });
    (window as any).ethereum?.on("chainChanged", ()=>{
        window.location.reload()
    });
}

//attach application to wallet if its already connected
export const attachWallet = createAsyncThunk<{address:string, networkId:number} | null, void, {state:RootState}>(
    'wallet/attachWallet',
    async (_, {getState}) => {
        const state = getState();
        if (state.wallet.noMetamask || config.provider == undefined) return null
        const accounts = await config.provider.listAccounts()
        //application not connected to wallet
        if (accounts.length == 0) return null;
        config.signer = await config.provider.getSigner();
        const networkId = Number((await config.provider.getNetwork()).chainId);
        return {address: accounts[0].address, networkId};
    },
)

export const connectWallet = createAsyncThunk<{address:string, networkId:number} | null, void, {state:RootState}>(
    'wallet/connectWallet',
    async (_, {getState}) => {
        const state = getState();
        if (state.wallet.noMetamask || config.provider == undefined) return null
        config.signer = await config.provider.getSigner();

        const accounts = await config.provider.listAccounts()
        const networkId = Number((await config.provider.getNetwork()).chainId);
        return {address: accounts[0].address, networkId};
    },
)


interface walletState {
    isConnecting:boolean,
    isConnected:boolean
    errorConnecting:boolean
    accountAddress?:string,
    networkId?:number,
    noMetamask:boolean
}

const initialState = {
    isConnecting:false,
    isConnected:false,
    errorConnecting:false,
    noMetamask:(window as any).ethereum == undefined

} as walletState

export const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
    },
    extraReducers(builder){
        builder.addCase(connectWallet.pending, (state, action)=>{
            state.isConnected = false
            state.isConnecting = true;
            state.errorConnecting = false;
        }).addCase(connectWallet.fulfilled, (state, action)=>{
            const payload = action.payload
            state.isConnecting  = false;
            if(!payload) return state
            state.isConnected =true
            state.accountAddress = payload.address
            state.networkId = payload.networkId;
        }).addCase(connectWallet.rejected, (state, action)=>{
            state.isConnected = false;
            state.isConnecting = false;
            state.errorConnecting  = true;
        }).addCase(attachWallet.pending, (state, action)=>{
            state.isConnected = false
            state.isConnecting = true;
            state.errorConnecting = false;
        }).addCase(attachWallet.fulfilled, (state, action)=>{
            const payload = action.payload
            state.isConnecting  = false;
            if(!payload) return state
            state.isConnected =true
            state.accountAddress = payload.address
            state.networkId = payload.networkId;
        }).addCase(attachWallet.rejected, (state, action)=>{
            state.isConnected = false;
            state.isConnecting = false;
            state.errorConnecting  = true;
        })
    },
})

export const { } = walletSlice.actions
export default walletSlice.reducer

//slice is a part of a store that has its own store values
