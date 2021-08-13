import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import { createClient } from "urql";

const APIURL =
  "https://api.studio.thegraph.com/query/5561/zoratestsubgraph/0.1";

const tokensQuery = `
  query {
    tokens(
      orderBy: createdAtTimestamp
      orderDirection: desc
      first: 10
    ) {
      id
      tokenID
      contentURI
      metadataURI
    }
    
  }
`;

const client = createClient({
  url: APIURL,
});

export default function Home({ tokens }) {
  // console.log("props:", props);
  return (
    <>
      <h1 className="mx-auto text-2xl flex justify-center py-5">
        NFTs on Zora starting from block #: 11740517
      </h1>
      <div className="grid grid-cols-4 gap-4 px-10 py-10">
        {tokens.map((token) => {
          return (
            <div className="shadow-lg bg-transparent rounded-2xl overflow-hidden">
              <div key={token.contentURI} className="w-100% h-100%">
                {token.type === "image" && (
                  <div style={{ overflow: "hidden" }}>
                    <img
                      style={{
                        // minHeight: "320px",
                        height: "33%",
                      }}
                      src={token.contentURI}
                    />
                  </div>
                )}
                {token.type === "video" && (
                  <div className="relative">
                    <div
                      style={{
                        width: "288px",
                        height: "320px",
                        boxSizing: "border-box",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                      }}
                    >
                      <video
                        height="auto"
                        controls
                        autoPlay
                        style={{
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          display: "block",
                          objectFit: "cover",
                        }}
                      >
                        <source src={token.contentURI} />
                      </video>
                    </div>
                  </div>
                )}
                {token.type === "audio" && (
                  <audio controls>
                    <source src={token.contentURI} type="audio/ogg" />
                    <source src={token.contentURI} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                )}
                <div style={{ height: "33%" }} className="px-2 pt-2 pb-10">
                  <h3 className="text-2xl p-4 pt-6 font-semibold">
                    {token.meta.name}
                  </h3>
                </div>
              </div>
              <div style={{ height: "33%" }} className="bg-black p-10">
                <p className="text-white">Price</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

async function fetchData() {
  let data = await client.query(tokensQuery).toPromise();

  let tokenData = await Promise.all(
    data.data.tokens.map(async (token) => {
      let meta;
      try {
        const metaData = await fetch(token.metadataURI);
        let response = await metaData.json();
        meta = response;
      } catch (error) {}
      if (!meta) return;
      if (meta.mimeType.includes("mp4")) {
        token.type = "video";
      } else if (meta.mimeType.includes("wav")) {
        token.type = "audio";
      } else {
        token.type = "image";
      }
      token.meta = meta;
      return token;
    })
  );
  return tokenData;
}

export const getServerSideProps = async (ctx) => {
  const data = await fetchData();
  return {
    props: {
      tokens: data,
    },
  };
};
