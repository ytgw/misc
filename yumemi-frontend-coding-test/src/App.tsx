import React, { useState, useEffect } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
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

function PopulationChart(): JSX.Element {
  const fetchedData = [
    {
      year: 1960,
      value: 3443176,
    },
    {
      year: 1965,
      value: 4430743,
    },
    {
      year: 1970,
      value: 5472247,
    },
    {
      year: 1975,
      value: 6397748,
    },
    {
      year: 1980,
      value: 6924348,
    },
    {
      year: 1985,
      value: 7431974,
    },
    {
      year: 1990,
      value: 7980391,
    },
    {
      year: 1995,
      value: 8245900,
    },
    {
      year: 2000,
      value: 8489974,
    },
    {
      year: 2005,
      value: 8791597,
    },
    {
      year: 2010,
      value: 9048331,
    },
    {
      year: 2015,
      value: 9126214,
    },
    {
      year: 2020,
      value: 9237337,
    },
    {
      year: 2025,
      value: 9069562,
    },
    {
      year: 2030,
      value: 8933474,
    },
    {
      year: 2035,
      value: 8750958,
    },
    {
      year: 2040,
      value: 8541016,
    },
    {
      year: 2045,
      value: 8312524,
    },
  ];
  const data = fetchedData.map((obj) => {
    return { 年度: obj.year, 人口: obj.value };
  });
  return (
    <LineChart width={600} height={300} data={data} margin={{ top: 30, right: 30, left: 100, bottom: 30 }}>
      <Line type="monotone" dataKey="人口" stroke="#8884d8" />
      <CartesianGrid stroke="#ccc" />
      <XAxis dataKey="年度" label={{ value: "年度", position: "bottom" }} />
      <YAxis label={{ value: "人口[人]", angle: -90, offset: 50, position: "left" }} />
      <Tooltip />
    </LineChart>
  );
}

function App(): JSX.Element {
  return (
    <>
      <Prefectures />
      <PopulationChart />
    </>
  );
}

export default App;
