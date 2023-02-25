import React, { useState } from "react";
import "./App.css";

interface PrefectureType {
  prefCode: number;
  prefName: string;
}

function Prefectures(): JSX.Element {
  const [checkedPrefCodes, setCheckedPrefCodes] = useState<number[]>([]);
  const prefectures: PrefectureType[] = [
    { prefCode: 1, prefName: "北海道" },
    { prefCode: 13, prefName: "東京都" },
    { prefCode: 14, prefName: "神奈川県" },
  ];

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
