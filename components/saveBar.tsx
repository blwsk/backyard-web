import React, { useState } from "react";
import { withRouter } from "next/router";
import { validURL } from "../lib/urls";

export const SaveBar = withRouter(({ router }) => {
  const [value, updater] = useState("");
  const [focused, updateFocused] = useState(false);

  const onChange = (e) => {
    updater(e.target.value);
  };

  const onSave = () => {
    router.push(`/save?url=${encodeURI(value)}`);
  };

  const isValidUrl = validURL(value);

  const inputError = !isValidUrl && value.length > 0 && !focused;

  const onFocus = () => {
    updateFocused(true);
  };

  const onBlur = () => {
    updateFocused(false);
  };

  const onKeyDown = (e) => {
    if (e.keyCode === 13) {
      onSave();
    }
  };

  return (
    <>
      <div className="save-bar">
        <input
          className={inputError ? "error" : ""}
          style={{
            width: `100%`,
            marginBottom: 16,
          }}
          type="text"
          placeholder="https://url-you-want-to-save.com"
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
        />
        {(value || focused) && (
          <button
            style={{ margin: 0 }}
            onClick={onSave}
            disabled={!isValidUrl}
            title={inputError ? "URL is invalid" : undefined}
          >
            Save
          </button>
        )}
      </div>
      <style jsx>{`
        .save-bar {
          width: 100%;
          textalign: center;
          height: 100px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </>
  );
});
