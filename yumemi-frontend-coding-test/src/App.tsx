import React, { useState, useEffect } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import "./App.css";
import { fetchPrefectures, fetchPopulation, type PrefectureType } from "./api";

interface PrefecturePopulation {
  prefCode: number;
  prefName: string;
  data: Array<{ year: number; value: number }>;
}

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
  const [fetchedPopulations, setFetchedPopulations] = useState<PrefecturePopulation[]>([]);

  useEffect(() => {
    const alreadyFetchedCodes = fetchedPopulations.map((e) => e.prefCode);
    const drawCodes = prefectures.map((e) => e.prefCode);
    const newFetchCodes = drawCodes.filter((drawCode) => !alreadyFetchedCodes.includes(drawCode));

    fetchPopulation(newFetchCodes)
      .then((populationData) => {
        // populationDataをfetchedPopulationsに追加する。
        const populations: PrefecturePopulation[] = [];
        for (const data of populationData) {
          const pref = prefectures.find((drawPref) => drawPref.prefCode === data.prefCode);
          if (pref === undefined) {
            continue;
          }
          populations.push({ prefCode: data.prefCode, prefName: pref.prefName, data: data.data });
        }
        if (populations.length === 0) {
          // 無限ループ防止。
          return;
        }
        setFetchedPopulations(fetchedPopulations.concat(populations));
      })
      .catch((reason) => {
        console.log(reason);
      });
  }, [prefectures, fetchedPopulations]);

  const drawCodes = prefectures.map((e) => e.prefCode);
  const drawPopulations = fetchedPopulations.filter((e) => drawCodes.includes(e.prefCode));

  const lineChartArray = drawPopulations.map((e, index) => {
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
    const color = COLORS[index % COLORS.length];

    return <Line type="monotone" dataKey="value" data={e.data} name={e.prefName} key={e.prefCode} stroke={color} />;
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
