import Header from "../components/header";
import Wrapper from "../components/wrapper";
import { useState } from "react";
import { useAuthedCallback, useAuthedSWR } from "../lib/requestHooks";
import { jsonFetcherFactory, gqlFetcherFactory } from "../lib/fetcherFactories";
import requireAuth from "../lib/requireAuth";
import gql from "gql-tag";
import { mutate } from "swr";

const userMetadataQuery = gql`
  query UserMetadataForUser($userId: String!) {
    userMetadataForUser(userId: $userId) {
      phoneNumber
    }
  }
`;

const ValidatePhoneNumber = () => {
  const [phoneValue, updatePhoneValue] = useState("");
  const [hasSentPin, updateHasSentPin] = useState(false);
  const [error, updateError] = useState(false);

  const [pinValue, updatePinValue] = useState("");
  const [hasConfirmedPin, updateHasConfirmedPin] = useState(false);
  const [pinConfirmationError, updatePinConfirmationError] = useState(false);

  const doVerify = useAuthedCallback(
    "/api/sms/verify",
    {
      method: "POST",
      body: JSON.stringify({
        phoneNumber: phoneValue,
      }),
    },
    jsonFetcherFactory
  );

  const doConfirm = useAuthedCallback(
    "/api/sms/confirm",
    {
      method: "POST",
      body: JSON.stringify({
        pin: pinValue,
      }),
    },
    jsonFetcherFactory
  );

  return (
    <div>
      <label htmlFor="phone">
        <b>Phone number</b>
      </label>
      <br />
      <input
        type="text"
        id="phone"
        style={{ marginTop: 8, marginRight: 8 }}
        value={phoneValue}
        onChange={(e) => updatePhoneValue(e.target.value)}
        disabled={hasSentPin || error}
      />
      <button
        onClick={() => {
          doVerify()
            .then((res) => {
              void res;
              updateHasSentPin(true);
            })
            .catch((err) => {
              void err;
              updateError(true);
            });
        }}
        disabled={hasSentPin || error}
      >
        Verify
      </button>
      {error && <div className="color-red">❌ Pin failed to send.</div>}
      {hasSentPin &&
        (!hasConfirmedPin ? (
          <>
            <br />
            <input
              type="text"
              style={{ marginTop: 8, marginRight: 8 }}
              value={pinValue}
              onChange={(e) => updatePinValue(e.target.value)}
            />
            <button
              onClick={() => {
                doConfirm()
                  .then((res) => {
                    void res;
                    updateHasConfirmedPin(true);

                    /**
                     * Refresh userMetadata query after 2 seconds
                     */
                    setTimeout(() => mutate(userMetadataQuery), 2000);
                  })
                  .catch((err) => {
                    void err;
                    updatePinConfirmationError(true);
                  });
              }}
              disabled={hasConfirmedPin || pinConfirmationError}
            >
              Confirm pin
            </button>
          </>
        ) : (
          <div style={{ marginTop: 8 }}>
            ✅ Your phone number has been confirmed.
          </div>
        ))}
      {pinConfirmationError && (
        <div className="color-red" style={{ marginTop: 8 }}>
          ❌ Pin confirmation failed.
        </div>
      )}
    </div>
  );
};

const SettingsForm = ({ data }) => {
  const {
    userMetadataForUser: { phoneNumber },
  } = data.data;

  return (
    <div>
      {phoneNumber ? (
        <div>
          <label htmlFor="phone">
            <b>Phone number</b>
            <br />
            <small>(verified ✅)</small>
          </label>
          <br />
          <input
            type="text"
            id="phone"
            style={{ marginTop: 8, marginRight: 8 }}
            readOnly
            value={phoneNumber}
          />
        </div>
      ) : (
        <ValidatePhoneNumber />
      )}
    </div>
  );
};

const Settings = () => {
  const { data, error, isValidating } = useAuthedSWR(
    userMetadataQuery,
    gqlFetcherFactory
  );

  void error, isValidating;

  return (
    <div>
      <Header />
      <Wrapper>
        <h1>Settings</h1>
        {data && <SettingsForm data={data} />}
      </Wrapper>
    </div>
  );
};

export default requireAuth(Settings);
