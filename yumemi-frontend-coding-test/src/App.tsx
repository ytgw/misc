import React, { useState, useEffect } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./App.css";
import { fetchPrefectures, fetchPopulation, type PrefectureName } from "./api";

interface DrawPopulation {
  prefCode: number;
  prefName: string;
  data: Array<{ year: number; value: number }>;
}

export function Prefectures({
  checkedPrefectures,
  setCheckedPrefectures,
}: {
  checkedPrefectures: PrefectureName[];
  setCheckedPrefectures: (checkedPrefectures: PrefectureName[]) => void;
}): JSX.Element {
  const [prefectures, setPrefectures] = useState<PrefectureName[]>([]);

  useEffect(() => {
    fetchPrefectures()
      .then((pref) => {
        setPrefectures(pref);
      })
      .catch(() => {
        alert("都道府県一覧を取得できませんでした。リロードお願いします。");
      });
  }, []);

  const checkboxList = prefectures.map((pref: PrefectureName): JSX.Element => {
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

      const newCheckedPrefectures: PrefectureName[] = [];
      for (const code of newCheckedPrefCodes) {
        const pref = prefectures.find((e) => e.prefCode === code);
        if (pref === undefined) {
          continue;
        }
        newCheckedPrefectures.push({ prefCode: pref.prefCode, prefName: pref.prefName });
      }
      setCheckedPrefectures(newCheckedPrefectures.sort((e1, e2) => e1.prefCode - e2.prefCode));
    };

    return (
      <label key={pref.prefCode} className="prefecture-checkbox">
        <input type="checkbox" name="code" value={pref.prefCode} onChange={handleChange} defaultChecked={isChecked} />
        {pref.prefName}
      </label>
    );
  });

  if (checkboxList.length === 0) {
    return <div>都道府県一覧を取得していますのでお待ちください。</div>;
  }

  return (
    <div className="prefectures">
      <div>都道府県</div>
      {checkboxList}
    </div>
  );
}

export function PopulationChart({ prefectures }: { prefectures: PrefectureName[] }): JSX.Element {
  const [fetchedPopulations, setFetchedPopulations] = useState<DrawPopulation[]>([]);

  useEffect(() => {
    const alreadyFetchedCodes = fetchedPopulations.map((e) => e.prefCode);
    const drawCodes = prefectures.map((e) => e.prefCode);
    const newFetchCodes = drawCodes.filter((drawCode) => !alreadyFetchedCodes.includes(drawCode));

    fetchPopulation(newFetchCodes)
      .then((populationData) => {
        // populationDataをfetchedPopulationsに追加する。
        const populations: DrawPopulation[] = [];
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
        setFetchedPopulations(fetchedPopulations.concat(populations).sort((e1, e2) => e1.prefCode - e2.prefCode));
      })
      .catch(() => {
        alert("人口データを取得できませんでした。");
      });
  }, [prefectures, fetchedPopulations]);

  const drawCodes = prefectures.map((e) => e.prefCode);
  const drawPopulations = fetchedPopulations.filter((e) => drawCodes.includes(e.prefCode));

  const lineChartArray = drawPopulations.map((e) => {
    const COLORS = ["red", "blue", "green", "magenta", "gray", "black"];
    const color = COLORS[e.prefCode % COLORS.length];

    return <Line type="monotone" dataKey="value" data={e.data} name={e.prefName} key={e.prefCode} stroke={color} />;
  });

  if (prefectures.length === 0) {
    return <div>人口推移グラフを表示したい都道府県をチェックしてください。</div>;
  }
  if (lineChartArray.length === 0) {
    return <div>都道府県の人口データを取得していますのでお待ちください。</div>;
  }

  return (
    <>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart margin={{ top: 50, right: 30, left: 10, bottom: 30 }}>
          <CartesianGrid stroke="#ccc" />
          <XAxis
            type="number"
            dataKey="year"
            allowDuplicatedCategory={false}
            domain={["min", "max"]}
            label={{ value: "年度", position: "bottom" }}
          />
          <YAxis type="number" dataKey="value" label={{ value: "人口数", offset: 30, position: "top" }} />
          <Legend verticalAlign="top" />
          {lineChartArray}
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>
      <div>出典：RESAS（地域経済分析システム）</div>
    </>
  );
}

function App(): JSX.Element {
  const [checkedPrefectures, setCheckedPrefectures] = useState<PrefectureName[]>([]);
  return (
    <div className="app">
      <Prefectures checkedPrefectures={checkedPrefectures} setCheckedPrefectures={setCheckedPrefectures} />
      <PopulationChart prefectures={checkedPrefectures} />
    </div>
  );
}

export default App;
