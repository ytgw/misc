import React, { useState, useEffect } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import "./App.css";
import { fetchPrefectures, fetchPopulation, type PrefectureType, type PrefPopulation } from "./api";

function Prefectures({
  checkedPrefCodes,
  setCheckedPrefCodes,
}: {
  checkedPrefCodes: number[];
  setCheckedPrefCodes: (checkedPrefCodes: number[]) => void;
}): JSX.Element {
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

function PopulationChart({ prefCodes }: { prefCodes: number[] }): JSX.Element {
  const [prefPopulations, setPrefPopulations] = useState<PrefPopulation[]>([]);

  useEffect(() => {
    fetchPopulation(prefCodes)
      .then((populations) => {
        setPrefPopulations(populations);
      })
      .catch((reason) => {
        console.log(reason);
      });
  }, [prefCodes]);

  const lineChartArray = prefPopulations.map((pref) => {
    return <Line dataKey="value" data={pref.data} key={pref.prefCode} />;
  });

  return (
    <LineChart width={600} height={300} margin={{ top: 30, right: 30, left: 100, bottom: 30 }}>
      <CartesianGrid stroke="#ccc" />
      <XAxis dataKey="year" allowDuplicatedCategory={false} label={{ value: "年度", position: "bottom" }} />
      <YAxis dataKey="value" label={{ value: "人口[人]", angle: -90, offset: 50, position: "left" }} />
      {lineChartArray}
      <Tooltip />
    </LineChart>
  );
}

function App(): JSX.Element {
  const [checkedPrefCodes, setCheckedPrefCodes] = useState<number[]>([]);
  return (
    <>
      <Prefectures checkedPrefCodes={checkedPrefCodes} setCheckedPrefCodes={setCheckedPrefCodes} />
      <PopulationChart prefCodes={checkedPrefCodes} />
    </>
  );
}

export default App;
