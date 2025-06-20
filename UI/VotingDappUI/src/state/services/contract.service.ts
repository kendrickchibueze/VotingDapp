import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import votingContractArtifact from "../../common/web3/artifacts/contracts/Voting.sol/Voting.json";
import { ethers, type JsonRpcSigner } from "ethers";
import type { Voting } from "../../common/web3/typechain-types";
import { getSigner } from "./wallet.service.ts";
import type { RootState } from "../store.ts";

const contractAbi = votingContractArtifact.abi;
const contractAddress = "0x5a605868E1b60699Af56073Ace893aaFF0c446bB";
//create contract when i give it a wallet signer
const getContract = (signer: JsonRpcSigner) =>
  new ethers.Contract(contractAddress, contractAbi, signer) as any as Voting;

interface contractState {
  isLoading: boolean;
  isLoaded: boolean;
  errorLoading: boolean;
  isVoted: boolean;
  isVoting: boolean;
  errorVoting: boolean;
  candidates: {
    name: string;
    voteCounter: number;
    avatarUrl: string;
    candidateId: number;
  }[];
  contractAddress: string;
}

const initialState = {
  isLoading: false,
  isLoaded: false,
  errorLoading: false,
  isVoted: false,
  isVoting: false,
  errorVoting: false,
  candidates: [
    {
      name: "Peter Obi",
      avatarUrl:
        "https://media.premiumtimesng.com/wp-content/files/2022/10/78f1dc4e-142f-44e4-a328-f15724fe63d4_peter-obi.jpg",
      voteCounter: 0,
      candidateId: 1,
    },
    {
      name: "Bola Tinibu",
      avatarUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Bola_Tinubu_portrait.jpg/960px-Bola_Tinubu_portrait.jpg",
      voteCounter: 0,
      candidateId: 2,
    },
  ],
  contractAddress,
} as contractState;

export const fetchVoteState = createAsyncThunk<
  boolean,
  void,
  { state: RootState }
>("contract/fetchVoteState", async (_, { getState }) => {
  const state = getState();
  const signer = getSigner();
  if (signer == undefined || state.wallet.accountAddress == undefined)
    throw "Wallet not connected";
  const contract = getContract(signer);
  const isVoted = await contract.voters(state.wallet.accountAddress);
  return isVoted;
});

export const voteForCandidate = createAsyncThunk<
  void,
  number,
  { state: RootState }
>("contract/voteForCandidate", async (condidateId, { getState }) => {
  const state = getState();
  const signer = getSigner();
  if (signer == undefined || state.wallet.accountAddress == undefined)
    throw "Wallet not connected";
  const contract = getContract(signer);
  await contract.vote(condidateId);
});

export const updateCandidateVote = createAsyncThunk<
  { id: number; voteCount: number },
  number,
  { state: RootState }
>("contract/updateCandidateVote", async (condidateId, { getState }) => {
  const state = getState();
  const signer = getSigner();
  if (signer == undefined || state.wallet.accountAddress == undefined)
    throw "Wallet not connected";
  const contract = getContract(signer);
  const candidate = await contract.candidates(condidateId);
  const ret = {
    id: Number(candidate.id),
    voteCount: Number(candidate.voteCount),
  };
  return ret;
});

export const contractSlice = createSlice({
  name: "contract",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchVoteState.pending, (state, action) => {
        state.isLoading = true;
        state.isLoaded = false;
        state.errorLoading = false;
      })
      .addCase(fetchVoteState.fulfilled, (state, action) => {
        // state.isLoaded = false;
        state.isLoaded = true;
        state.isVoted = action.payload;
      })
      .addCase(fetchVoteState.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoaded = false;
        state.errorLoading = true;
      })
      .addCase(voteForCandidate.pending, (state, action) => {
        state.isVoting = true;
        state.errorVoting = false;
      })
      .addCase(voteForCandidate.fulfilled, (state, action) => {
        state.isVoting = false;
        state.isVoted = true;
      })
      .addCase(voteForCandidate.rejected, (state, action) => {
        state.isVoting = false;
        state.errorVoting = true;
      })
      .addCase(updateCandidateVote.pending, (state, action) => {
        state.isLoading = true;
        state.isLoaded = false;
        state.errorVoting = false;
      })
      .addCase(updateCandidateVote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoaded = true;
        const candidate = state.candidates.find(
          (x) => x.candidateId == action.payload.id
        );
        if (!candidate) return state;
        candidate.voteCounter = action.payload.voteCount;

        return state;
      })
      .addCase(updateCandidateVote.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoaded = false;
        state.errorLoading = true;
      });
  },
});

export const {} = contractSlice.actions;
export default contractSlice.reducer;
