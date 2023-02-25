import React from "react";
import "./App.css";

function Prefectures(): JSX.Element {
  const prefectures = ["東京都", "神奈川県"];

  const checkboxList = prefectures.map((name: string): JSX.Element => {
    return (
      <div key={name}>
        <label>
          <input type="checkbox" name="name" value={name} />
          {name}
        </label>
      </div>
    );
  });
  return <div>{checkboxList}</div>;
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
