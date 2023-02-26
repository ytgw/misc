import React, { useState, useEffect } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import "./App.css";
import { fetchPrefectures, fetchPopulation, type PrefectureType, type PrefPopulation } from "./api";

function Prefectures({
  checkedPrefectures,
  setCheckedPrefectures,
}: {
  checkedPrefectures: PrefectureType[];
  setCheckedPrefectures: (checkedPrefectures: PrefectureType[]) => void;
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
    const checkedPrefCodes = checkedPrefectures.map((e) => e.prefCode);
    const isChecked = checkedPrefCodes.includes(pref.prefCode);

    // チェック済の都道府県はcheckedPrefCodesから削除し、未チェックのものはcheckedPrefCodesに追加。
    const handleChange = (): void => {
      let newCheckedPrefCodes = checkedPrefCodes.slice();
      if (checkedPrefCodes.includes(pref.prefCode)) {
        newCheckedPrefCodes = newCheckedPrefCodes.filter((code): boolean => code !== pref.prefCode);
      } else {
        newCheckedPrefCodes.push(pref.prefCode);
      }

      const newCheckedPrefectures: PrefectureType[] = [];
      for (const code of newCheckedPrefCodes) {
        const pref = prefectures.find((e) => e.prefCode === code);
        if (pref === undefined) {
          continue;
        }
        newCheckedPrefectures.push({ prefCode: pref.prefCode, prefName: pref.prefName });
      }
      setCheckedPrefectures(newCheckedPrefectures);
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

function PopulationChart({ prefectures }: { prefectures: PrefectureType[] }): JSX.Element {
  const [prefPopulations, setPrefPopulations] = useState<PrefPopulation[]>([]);

  useEffect(() => {
    const prefCodes = prefectures.map((e) => e.prefCode);
    fetchPopulation(prefCodes)
      .then((populations) => {
        setPrefPopulations(populations);
      })
      .catch((reason) => {
        console.log(reason);
      });
  }, [prefectures]);

  const lineChartArray = prefPopulations.map((pref, index) => {
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
    const color = COLORS[index % COLORS.length];
    let prefName: string;
    const foundPref = prefectures.find((e) => e.prefCode === pref.prefCode);
    if (foundPref === undefined) {
      prefName = pref.prefCode.toString();
    } else {
      prefName = foundPref.prefName;
    }
    return (
      <Line type="monotone" dataKey="value" data={pref.data} name={prefName} key={pref.prefCode} stroke={color} />
    );
  });

  return (
    <LineChart width={600} height={300} margin={{ top: 30, right: 30, left: 100, bottom: 30 }}>
      <CartesianGrid stroke="#ccc" />
      <XAxis dataKey="year" allowDuplicatedCategory={false} label={{ value: "年度", position: "bottom" }} />
      <YAxis dataKey="value" label={{ value: "人口[人]", angle: -90, offset: 50, position: "left" }} />
      <Legend verticalAlign="top" />
      {lineChartArray}
      <Tooltip />
    </LineChart>
  );
}

function App(): JSX.Element {
  const [checkedPrefectures, setCheckedPrefectures] = useState<PrefectureType[]>([]);
  return (
    <>
      <Prefectures checkedPrefectures={checkedPrefectures} setCheckedPrefectures={setCheckedPrefectures} />
      <PopulationChart prefectures={checkedPrefectures} />
    </>
  );
}

export default App;
