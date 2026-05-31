"use client";

import Image from "next/image";
import { useState } from "react";

export default function HomeHero() {
  const [imgError, setImgError] = useState(false);

  return (
    <div style={{ textAlign: "center", padding: "0.5rem 0 0.25rem" }}>
      {/* タイトル */}
      <h1
        style={{
          fontSize: "1.6rem",
          fontWeight: 800,
          color: "#d4719c",
          letterSpacing: "0.08em",
          lineHeight: 1.2,
        }}
      >
        さやごはん帳
      </h1>
      <p
        style={{
          fontSize: "0.8rem",
          color: "#c49ab5",
          marginTop: "0.3rem",
          letterSpacing: "0.05em",
        }}
      >
        作れたごはんを、少しずつ増やす
      </p>

      {/* ヒーロー画像バナー */}
      {!imgError && (
        <div
          style={{
            marginTop: "1rem",
            borderRadius: "1.25rem",
            overflow: "hidden",
            background: "linear-gradient(160deg, #fdf2f8 0%, #fff8fb 100%)",
            boxShadow: "0 3px 18px rgba(212,113,156,0.13)",
            position: "relative",
            height: "168px",
          }}
        >
          <Image
            src="/images/recipe-home-hero.png"
            alt="さやごはん帳 - さや、薫、霞がキッチンで料理している"
            fill
            style={{ objectFit: "contain", objectPosition: "center bottom" }}
            priority
            onError={() => setImgError(true)}
          />
        </div>
      )}

      {/* 画像がない場合のやさしいプレースホルダー */}
      {imgError && (
        <div
          style={{
            marginTop: "1rem",
            borderRadius: "1.25rem",
            background: "linear-gradient(160deg, #fdf2f8 0%, #fff8fb 100%)",
            boxShadow: "0 3px 18px rgba(212,113,156,0.1)",
            height: "168px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            color: "#e8a9c7",
            fontSize: "2.5rem",
          }}
        >
          🍳🥕🍱
        </div>
      )}
    </div>
  );
}
