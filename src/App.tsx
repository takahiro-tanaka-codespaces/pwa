import React from 'react';
import axios from 'axios';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <div className="App">
      <h1>PWAアプリ</h1>
      <QueryClientProvider client={queryClient}>
        <Authorized  unauthorized={<Unauthorized />}>
          <UserInfo />
          <SignOut />
        </Authorized>
      </QueryClientProvider>
    </div>
  );
}

const authInfoKey = "authInfo";

const authParams = {
  clientId: "64458382489-pkgch7eusnhdq5po9d9523c46jo4qkt7.apps.googleusercontent.com",
  clientSecret: "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",
  scope: "profile email",
  responseType: "code",
  approvalPrompt: "force",
  accessType: "offline",
  // redirectUri: "https://localhost:3000/auth_code",
  redirectUri: "https://takahiro-tanaka-codespaces.github.io/pwa/auth_code",
  grantType: "authorization_code",
} as const;

type AuthInfo = Readonly<{
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  id_token: string;
  expires_in: number;
}>;

function setAuthInfo(a: AuthInfo): void {
  window.localStorage.setItem(authInfoKey, JSON.stringify(a));
}

function getAuthInfo(): AuthInfo | null {
  const item = window.localStorage.getItem(authInfoKey);
  if (item !== null) {
    return JSON.parse(item) as AuthInfo;
  } else {
    return null;
  }
}

function deleteAuthInfo(): void {
  window.localStorage.removeItem(authInfoKey);
}

function requestCodeFlow(): void {
  const params = {
    client_id: authParams.clientId,
    redirect_uri: authParams.redirectUri,
    scope: authParams.scope,
    response_type: authParams.responseType,
    approval_prompt: authParams.approvalPrompt,
    access_type: authParams.accessType,
  };
  const query = new URLSearchParams(params).toString();
  window.location.href = `https://accounts.google.com/o/oauth2/auth?${query}`;
}

function getCode(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("code");
}

async function getAuthToken(code: string): Promise<AuthInfo> {
  const params = {
    code,
    client_id: authParams.clientId,
    client_secret: authParams.clientSecret,
    redirect_uri: authParams.redirectUri,
    grant_type: authParams.grantType,
    access_type: authParams.accessType,
  };
  const res = await axios.post(
    `https://www.googleapis.com/oauth2/v4/token`,
    params
  );
  return res.data as Promise<AuthInfo>;
}

async function signOut(authInfo: AuthInfo | undefined): Promise<void> {
  try {
    if (authInfo !== undefined) {
      const res = await axios.get(
        `https://accounts.google.com/o/oauth2/revoke`,
        {
          params: {
            token: authInfo.access_token,
          },
        }
      );
      if (res.status !== 200) {
        return Promise.reject(Error(`Failed to sign out`));
      }
    }
  } finally {
    deleteAuthInfo();
    window.location.href = "/";
  }
  return;
}

async function getUserInfo(
  authInfo: AuthInfo
): Promise<Record<string, string>> {
  const res = await axios.get("https://www.googleapis.com/oauth2/v1/userinfo", {
    params: {
      access_token: authInfo.access_token,
    },
  });
  return res.data;
}

type AuthorizedContext = Readonly<{
  authInfo?: AuthInfo;
}>;

// 認可情報を保存するContextの生成
const AuthorizedContext = React.createContext<AuthorizedContext>({});

function Authorized({
  unauthorized,
  children,
}: Readonly<{
  unauthorized?: React.ReactElement;
  children?: React.ReactNode;
}>): React.ReactElement | null {

  // LocalStorageから認可情報取得
  const authInfo = getAuthInfo();
  
  React.useEffect(() => {
    // Googleのログイン画面からアプリにリダイレクトした時の処理
    // if (window.location.pathname === "/auth_code") {
    if (window.location.href === authParams.redirectUri) {
	  // codeの取得
      const code = getCode();
      if (code != null) {
	    // アクセストークンの取得
        getAuthToken(code)
          .then((token) => {
		    // LocalStorageに保存
            setAuthInfo(token);
			// トップページ移動
            window.location.href = "/";
          })
          .catch((err) => console.log(err));
      }
    }
  });

  if (authInfo === null) {
    // 未ログインの場合の画面を表示する
    return unauthorized ?? null;
  } else {
    // ログイン済みの場合の画面を表示する
	// Contextを使って認可情報を子コンポーネントでも使用できるようにする
    return (
      <AuthorizedContext.Provider value={{ authInfo }}>
        {children}
      </AuthorizedContext.Provider>
    );
  }
}

function Unauthorized(): React.ReactElement {
  return (
    <div>
      <div>ログインしていません。</div>
      <button onClick={() => requestCodeFlow()}>ログイン</button>
    </div>
  );
}

function UserInfo(): React.ReactElement {
  // Contextから認可情報を取得する
  const { authInfo } = React.useContext(AuthorizedContext);

  // useQueryを使ってユーザ情報を取得するGoogle APIを実行する
  const query = useQuery(["email"], () =>
    authInfo == null
      ? Promise.reject(Error(`No AuthInfo`))
      : getUserInfo(authInfo)
  );

  if (query.isError) {
    // APIがエラーの場合
    return <div>Failed to get the email</div>;
  } else if (query.isSuccess) {
    // ユーザー情報取得に成功した場合
    return (
      <div>
        {Object.keys(query.data).map((k: string) => (
          <div>
            {k}: {query.data[k]}
          </div>
        ))}
      </div>
    );
  } else {
    return <div>Loading</div>;
  }
}

function SignOut(): React.ReactElement {
  const { authInfo } = React.useContext(AuthorizedContext);
  return (
    <button
      onClick={() => {
        signOut(authInfo);
      }}
    >
      Sign Out
    </button>
  );
}

export default App;
