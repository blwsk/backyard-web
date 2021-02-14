import Header from "../components/header";
import Wrapper from "../components/wrapper";
import { useState, useEffect, useRef } from "react";
import {
  useAuthedCallback,
  useGraphql,
  useGraphqlMutation,
} from "../lib/requestHooks";
import { jsonFetcherFactory, gqlFetcherFactory } from "../lib/fetcherFactories";
import requireAuth from "../lib/requireAuth";
import gql from "gql-tag";
import { PhoneNumber } from "twilio/lib/interfaces";
import { TWILIO_PHONE_NUMBER } from "../lib/twilioConstants";
import { validURL, getHostname } from "../lib/urls";
import Button from "../components/ui/Button";
import TextInput from "../components/ui/TextInput";
import Icon from "../components/ui/Icon";
import Link from "next/link";
import { useRouter } from "next/router";

const CopiedAlert = ({ onTimeout, className }) => {
  const [show, updateShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      updateShow(false);
      onTimeout();
    }, 1000);

    return () => clearTimeout(t);
  }, []);

  return (
    show && (
      <div className={className}>
        <span className="bg-black text-white py-1 px-2 rounded">Copied</span>
      </div>
    )
  );
};

const ValidatePhoneNumber = ({
  invalidateSettingsData,
}: {
  invalidateSettingsData: () => void;
}) => {
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
        phoneNumber: phoneValue,
      }),
    },
    jsonFetcherFactory
  );

  return (
    <div>
      <TextInput
        className="mt-2 mr-2"
        value={phoneValue}
        onChange={(e) => updatePhoneValue(e.target.value)}
        disabled={hasSentPin || error}
        placeholder="1234567890"
      />
      <Button
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
      </Button>
      {error && <div className="color-red">❌ Pin failed to send.</div>}
      {hasSentPin &&
        (!hasConfirmedPin ? (
          <>
            <br />
            <TextInput
              className="mt-2 mr-2"
              value={pinValue}
              onChange={(e) => updatePinValue(e.target.value)}
            />
            <Button
              onClick={() => {
                doConfirm()
                  .then((res) => {
                    void res;
                    updateHasConfirmedPin(true);

                    /**
                     * Refresh userMetadata query after 2 seconds
                     */
                    setTimeout(() => invalidateSettingsData(), 1000);
                  })
                  .catch((err) => {
                    void err;
                    updatePinConfirmationError(true);
                  });
              }}
              disabled={hasConfirmedPin || pinConfirmationError}
            >
              Confirm pin
            </Button>
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

type PhoneNumberProps = {
  phoneNumber: PhoneNumber | null;
  invalidateSettingsData: () => void;
};

const PhoneNumberSetting = ({
  phoneNumber,
  invalidateSettingsData,
}: PhoneNumberProps) => {
  const [requestState, setRequestState] = useState<
    "loading" | "succeeded" | "failed"
  >(null);

  const doDelete = useGraphqlMutation({
    query: gql`
      mutation($userId: String!) {
        deletePhoneNumber(userId: $userId) {
          userId
        }
      }
    `,
    variables: {},
  });

  return (
    <div>
      <h4>Save content via SMS</h4>
      {phoneNumber ? (
        <div>
          <span>
            Your phone number is verified ✅. Send messages to the Backyard
            phone number{", "}
          </span>
          <a href={`tel:${TWILIO_PHONE_NUMBER}`}>{TWILIO_PHONE_NUMBER}</a>
          <span>{", to add content."}</span>
        </div>
      ) : (
        <div>
          <span>
            Verify your phone number, then send messages to the Backyard phone
            number{", "}
          </span>
          <a href={`tel:${TWILIO_PHONE_NUMBER}`}>{TWILIO_PHONE_NUMBER}</a>
          <span>{", to add content."}</span>
        </div>
      )}
      <div className="pt-4">
        {phoneNumber ? (
          <div>
            <TextInput className="mt-2 mr-2" readOnly value={phoneNumber} />
            {requestState === null && (
              <Button
                onClick={() => {
                  setRequestState("loading");
                  doDelete()
                    .then(() => {
                      setRequestState("succeeded");

                      setTimeout(() => {
                        invalidateSettingsData();
                        setRequestState(null);
                      }, 1000);
                    })
                    .catch(() => {
                      setRequestState("failed");
                    });
                }}
              >
                Delete
              </Button>
            )}
            {requestState === "loading" && <span>Loading...</span>}
            {requestState === "failed" && (
              <span className="text-red-600">Error.</span>
            )}
            {requestState === "succeeded" && <span>Success.</span>}
          </div>
        ) : (
          <ValidatePhoneNumber
            invalidateSettingsData={invalidateSettingsData}
          />
        )}
      </div>
    </div>
  );
};

const emailIngestAddressDomain = "save.backyard.wtf";

const CreateEmailIngestAddress = ({
  invalidateSettingsData,
}: {
  invalidateSettingsData: () => void;
}) => {
  const [requestState, setRequestState] = useState<
    "loading" | "succeeded" | "failed"
  >(null);
  const [emailIngestAddress, updateEmailIngestAddress] = useState<string>("");

  const doCreate = useGraphqlMutation({
    query: gql`
      mutation($userId: String!, $emailIngestAddress: String!) {
        createEmailIngestAddress(
          userId: $userId
          emailIngestAddress: $emailIngestAddress
        ) {
          userId
          emailIngestAddress
        }
      }
    `,
    variables: {
      emailIngestAddress: `${emailIngestAddress}@${emailIngestAddressDomain}`,
    },
  });

  return (
    <div>
      {requestState === null && (
        <div>
          <TextInput
            value={emailIngestAddress}
            onChange={(e) => updateEmailIngestAddress(e.target.value)}
            className="mr-2 text-right"
          />
          <span className="mr-2">{"@"}</span>
          <TextInput
            value={emailIngestAddressDomain}
            readOnly
            disabled
            className="mr-2"
          />
          <Button
            onClick={() => {
              setRequestState("loading");
              doCreate()
                .then(() => {
                  setRequestState("succeeded");

                  invalidateSettingsData();
                })
                .catch(() => {
                  setRequestState("failed");
                });
            }}
          >
            Create
          </Button>
        </div>
      )}
      {requestState === "loading" && <div>Loading...</div>}
      {requestState === "failed" && (
        <div>
          <div className="text-red-600">Something went wrong.</div>
          <Button
            onClick={() => {
              setRequestState(null);
              invalidateSettingsData();
            }}
          >
            Try again
          </Button>
        </div>
      )}
    </div>
  );
};

type EmailIngestProps = {
  emailIngestAddress: string | null;
  invalidateSettingsData: () => void;
};

const EmailIngestSetting = ({
  emailIngestAddress,
  invalidateSettingsData,
}: EmailIngestProps) => {
  const ref = useRef<HTMLTextAreaElement>();
  const [copied, updateCopied] = useState(false);

  const [deleteStatus, setDeleteState] = useState<
    "loading" | "succeeded" | "failed"
  >(null);

  const doDelete = useGraphqlMutation({
    query: gql`
      mutation($userId: String!) {
        deleteEmailIngestAddress(userId: $userId) {
          userId
        }
      }
    `,
    variables: {},
  });

  return (
    <div>
      <h4>Add content with email</h4>
      <div>
        Create an email address to use when subscribing to newsletters. New
        posts will automatically be added.
      </div>
      <div className="pt-4">
        {emailIngestAddress ? (
          <div>
            <div className="relative">
              <textarea
                ref={(current) => (ref.current = current)}
                className="form-input bg-gray-100 dark:bg-gray-900 dark:border-gray-900 full-width"
                id="email"
                style={{ marginTop: 8, marginRight: 8, width: "100%" }}
                readOnly
                value={emailIngestAddress}
                onFocus={() => {
                  try {
                    navigator.clipboard
                      .writeText(emailIngestAddress)
                      .then(() => {
                        updateCopied(true);
                        ref.current.blur();
                      });
                  } catch (error) {
                    void error;
                  }
                }}
              />
              {copied && (
                <CopiedAlert
                  className="absolute inset-0 flex items-center justify-center"
                  onTimeout={() => updateCopied(false)}
                />
              )}
            </div>
            <Button
              onClick={() =>
                doDelete()
                  .then(() => invalidateSettingsData())
                  .catch(() => {
                    setDeleteState("failed");
                  })
              }
            >
              Delete
            </Button>
            {deleteStatus === "failed" && (
              <div className="text-red-600">Something went wrong.</div>
            )}
          </div>
        ) : (
          <CreateEmailIngestAddress
            invalidateSettingsData={invalidateSettingsData}
          />
        )}
      </div>
    </div>
  );
};

const RssFeed = ({
  feedUrl,
  id,
  invalidateSettingsData,
}: {
  feedUrl: string;
  id: string;
  invalidateSettingsData: () => void;
}) => {
  const [deleteState, update] = useState<"loading" | "error">(null);

  const doDelete = useGraphqlMutation({
    query: gql`
      mutation($userId: String!, $feedId: String!) {
        deleteRssSubscription(userId: $userId, feedId: $feedId) {
          id
        }
      }
    `,
    variables: {
      feedId: id,
    },
  });

  return (
    <tr className="">
      <td className="border-0 flex items-center space-x-2 py-1">
        <span>{getHostname(feedUrl).hostname}</span>
        <a href={feedUrl} target="_blank">
          <Icon name="external-link" size="md" />
        </a>
      </td>
      <td className="border-0 text-right py-1">
        <Button
          size="small"
          variant="secondary"
          onClick={() => {
            update("loading");
            doDelete()
              .catch(() => update("error"))
              .finally(() => invalidateSettingsData());
          }}
        >
          <Icon name="trash" size="md" />
        </Button>
        {deleteState === "loading" && (
          <span className="spin p-1">
            <Icon name="loader" size="md" />
          </span>
        )}
        {deleteState === "error" && <span className="text-red-500">Error</span>}
      </td>
    </tr>
  );
};

const RssSubscriptions = ({
  rssFeeds,
  invalidateSettingsData,
}: {
  rssFeeds: { feedUrl: string; id: string }[];
  invalidateSettingsData: () => void;
}) => {
  const [feedUrl, updateUrl] = useState<string>("");
  const [subscribeState, update] = useState<"loading" | "error">(null);

  const doSubscribe = useGraphqlMutation({
    query: gql`
      mutation($userId: String!, $feedUrl: String!) {
        createRssSubscription(userId: $userId, feedUrl: $feedUrl) {
          id
          feedUrl
        }
      }
    `,
    variables: {
      feedUrl,
    },
  });

  return (
    <div>
      <h4>Subscribe to RSS feeds</h4>
      <div>
        Whenever new posts are added to these feeds, they'll appear in your
        saved content.
      </div>
      <div className="pt-4">
        <div className="bg-gray-200 dark:bg-gray-900 rounded p-3">
          {rssFeeds.length > 0 ? (
            <table className="table-fixed w-full my-0">
              <thead>
                <tr className="">
                  <th className="border-0 w-4/5 pt-1 pb-2">Feed URL</th>
                  <th className="border-0 w-1/5 pt-1 pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {rssFeeds.map(({ feedUrl, id }) => (
                  <RssFeed
                    key={id}
                    feedUrl={feedUrl}
                    id={id}
                    invalidateSettingsData={invalidateSettingsData}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <div>None! Save one 👇</div>
          )}
        </div>
        <div className="mt-6 flex flex-col md:flex-row">
          <TextInput
            className=" flex-grow mb-2 md:mb-0 md:mr-2"
            value={feedUrl}
            onChange={(e) => updateUrl(e.target.value)}
            disabled={subscribeState === "loading"}
            placeholder="https://example.com/rss"
          />
          <Button
            onClick={() => {
              update("loading");
              doSubscribe()
                .then(() => update(null))
                .catch(() => update("error"))
                .finally(() => invalidateSettingsData());
            }}
            disabled={subscribeState === "loading" || !validURL(feedUrl)}
          >
            Subscribe
          </Button>
          {subscribeState === "loading" && <span>Loading...</span>}
          {subscribeState === "error" && (
            <span className="text-red-500">Error</span>
          )}
        </div>
      </div>
    </div>
  );
};

const SettingsForm = ({
  settingsData,
  invalidateSettingsData,
}: {
  settingsData: { userMetadata?: UserMetadata };
  invalidateSettingsData: () => void;
}) => {
  const {
    userMetadata: { phoneNumber, emailIngestAddress, rssSubscriptions },
  } = settingsData;

  const {
    query: { tab },
  } = useRouter();

  return (
    <div>
      <div>
        <Link href="?tab=sms">
          <Button
            variant="selectable"
            current={tab === "sms" || !tab}
            grouped
            first
          >
            SMS
          </Button>
        </Link>
        <Link href="?tab=email">
          <Button variant="selectable" current={tab === "email"} grouped>
            Email
          </Button>
        </Link>
        <Link href="?tab=rss">
          <Button variant="selectable" current={tab === "rss"} grouped>
            RSS
          </Button>
        </Link>
        <Link href="?tab=more">
          <Button variant="selectable" current={tab === "more"} grouped last>
            More info
          </Button>
        </Link>
      </div>
      <div className="my-10">
        {tab === "sms" ? (
          <PhoneNumberSetting
            phoneNumber={phoneNumber}
            invalidateSettingsData={invalidateSettingsData}
          />
        ) : tab === "email" ? (
          <EmailIngestSetting
            emailIngestAddress={emailIngestAddress}
            invalidateSettingsData={invalidateSettingsData}
          />
        ) : tab === "rss" ? (
          <RssSubscriptions
            rssFeeds={rssSubscriptions}
            invalidateSettingsData={invalidateSettingsData}
          />
        ) : tab === "more" ? (
          <Guide />
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};

const Guide = () => (
  <div>
    <h3>Other ways to save</h3>
    <ul>
      <li>
        <span style={{ marginRight: 8 }}>
          Drag this bookmarklet onto your bookmark bar:
        </span>
        <span
          dangerouslySetInnerHTML={{
            __html: `
        <a  href="javascript:(function hey(){ window.open('https://backyard.wtf/save?url=' + encodeURIComponent(window.location.href), '_blank'); })()">
          <pre style="display:inline;">Save</pre>
        </a>
      `,
          }}
        />
      </li>
      <li>
        Send links, images, files, and text to{" "}
        <a href={`tel:${TWILIO_PHONE_NUMBER}`}>{TWILIO_PHONE_NUMBER}</a> via SMS
        🔜
      </li>
      <li>Drag-and-drop a file to upload it 🆕</li>
    </ul>
  </div>
);

interface UserMetadata {
  emailIngestAddress?: string;
  phoneNumber?: string;
  rssSubscriptions: { id: string; feedUrl: string }[];
}

const Settings = () => {
  const { data, mutate } = useGraphql<{
    data: { userMetadata?: UserMetadata };
  }>({
    query: gql`
      query($userId: String!) {
        userMetadata(userId: $userId) {
          emailIngestAddress
          phoneNumber
          rssSubscriptions {
            id
            feedUrl
          }
        }
      }
    `,
    variables: {
      // userId will be provided in the serverless function
    },
  });

  return (
    <div>
      <Header />
      <Wrapper>
        <h1>Settings</h1>
        {data ? (
          <SettingsForm
            settingsData={data.data}
            invalidateSettingsData={mutate}
          />
        ) : (
          <div>Loading...</div>
        )}
      </Wrapper>
    </div>
  );
};

export default requireAuth(Settings);
