import React, { useEffect, useState } from "react";
import "./App.css";
import ConnectButton from "./common/components/connectButton";
import { type AppDispatch, useAppSelector } from "./state/store.ts";
import { useDispatch } from "react-redux";
import { attachWallet } from "./state/services/wallet.service.ts";
import VoteCard from "./common/components/VoteCard/index..tsx";
import { fetchVoteState } from "./state/services/contract.service.ts";

function App() {
  const dispatch: AppDispatch = useDispatch();
  let isVoted = useAppSelector((s) => s.contract.isVoted);
  const candidates = useAppSelector((s) => s.contract.candidates);
  const isConnected = useAppSelector((s) => s.wallet.isConnected);
  let account = useAppSelector((s) => s.wallet.accountAddress);

  useEffect(() => {
    dispatch(attachWallet());
  }, []);

  useEffect(() => {
    if (isConnected && account) dispatch(fetchVoteState());
  }, [isConnected, account]);

  return (
    <>
      <nav style={{ display: "flex", padding: "1rem" }}>
        <div style={{ fontSize: "1.2rem", fontWeight: 600 }} className="logo">
          Renown Voting System
        </div>
        <div style={{ flex: "1" }} className="spacer"></div>
        <ConnectButton></ConnectButton>
      </nav>
      <main>
        {isVoted && (
          <h2
            style={{
              width: "fit-content",
              margin: "auto",
              marginBottom: "2rem",
            }}
          >
            You Have Already Voted
          </h2>
        )}
        <div
          className="candidates"
          style={{ display: "flex", gap: "2rem", justifyContent: "center" }}
        >
          {candidates.map((c) => {
            return <VoteCard key={c.candidateId} id={c.candidateId} />;
          })}
        </div>
      </main>
    </>
  );
}

export default App;
