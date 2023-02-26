import React, { useState, useEffect } from "react";
import "./App.css";
import { API_KEY } from "./secret";

interface PrefectureType {
  prefCode: number;
  prefName: string;
}

function isPrefectureArray(array: any): array is PrefectureType[] {
  if (!(array instanceof Array)) {
    return false;
  }
  const isPrefArray = array.every((e): boolean => {
    if (typeof e.prefCode !== "number") {
      return false;
    }
    if (typeof e.prefName !== "string") {
      return false;
    }
    return true;
  });
  return isPrefArray;
}

export async function fetchPrefectures(): Promise<PrefectureType[]> {
  const response = await fetch("https://opendata.resas-portal.go.jp/api/v1/prefectures", {
    method: "GET",
    headers: { "X-API-KEY": API_KEY },
  });
  const data = await response.json();
  const prefectures = data.result;
  if (!isPrefectureArray(prefectures)) {
    throw new Error("fetched data is not prefecture array.");
  }
  return prefectures;
}

function Prefectures(): JSX.Element {
  const [checkedPrefCodes, setCheckedPrefCodes] = useState<number[]>([]);
  const [prefectures, setPrefectures] = useState<PrefectureType[]>([]);

  useEffect(() => {
    fetchPrefectures()
      .then((pref) => {
        setPrefectures(pref);
      })
      .catch((reason) => {
        console.log(reason);
      });
  }, []);

  const checkboxList = prefectures.map((pref: PrefectureType): JSX.Element => {
    const isChecked = checkedPrefCodes.includes(pref.prefCode);

    // チェック済の都道府県はcheckedPrefCodesから削除し、未チェックのものはcheckedPrefCodesに追加。
    const handleChange = (): void => {
      let newCheckedPrefCodes = checkedPrefCodes.slice();
      if (checkedPrefCodes.includes(pref.prefCode)) {
        newCheckedPrefCodes = newCheckedPrefCodes.filter((code): boolean => code !== pref.prefCode);
      } else {
        newCheckedPrefCodes.push(pref.prefCode);
      }
      console.log(newCheckedPrefCodes);
      setCheckedPrefCodes(newCheckedPrefCodes);
    };

    return (
      <label key={pref.prefCode}>
        <input type="checkbox" name="code" value={pref.prefCode} onChange={handleChange} defaultChecked={isChecked} />
        {pref.prefName}
      </label>
    );
  });

  return <>{checkboxList}</>;
}

function Graph(): JSX.Element {
  return <div>TODO</div>;
}

function App(): JSX.Element {
  return (
    <>
      <Prefectures />
      <Graph />
    </>
  );
}

export default App;
