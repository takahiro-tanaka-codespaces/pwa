# OAuth クライアント
## クライアントID
64458382489-pkgch7eusnhdq5po9d9523c46jo4qkt7.apps.googleusercontent.com
### クライアントシークレット
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



### 直接URLをたたく
https://accounts.google.com/o/oauth2/auth?client_id={clientId}&redirect_uri={redirectUri}&scope={scope}&response_type={responseType}&approval_prompt={approvalPrompt}&access_type={accessType}


名前	値
clientId	あなたが取得したClient ID
clientSecret	あなたが取得したClient Secret
scope	‘profile email’
responseType	‘code’
approvalPrompt	‘force’
accessType	‘offline’
redirectUri	‘http://localhost:3000/auth-code’

https://accounts.google.com/o/oauth2/auth?
client_id=64458382489-pkgch7eusnhdq5po9d9523c46jo4qkt7.apps.googleusercontent.com
&response_type=code
&redirect_uri=http://localhost:3000/auth-code
&approval_prompt=force
&access_type=offline
&scope=profile email

https://accounts.google.com/o/oauth2/auth?client_id=64458382489-pkgch7eusnhdq5po9d9523c46jo4qkt7.apps.googleusercontent.com&response_type=code&redirect_uri=http://localhost:3000/auth-code&approval_prompt=force&access_type=offline&scope=profile email




GET https://login.microsoftonline.com/common/oauth2/v2.0/authorize?
client_id=6731de76-14a6-49ae-97bc-6eba6914391e
&response_type=code
&redirect_uri=http%3A%2F%2Flocalhost%2Fmyapp%2F
&response_mode=query
&scope=
https%3A%2F%2Fgraph.microsoft.com%2Fcalendars.read%20
https%3A%2F%2Fgraph.microsoft.com%2Fmail.send
&state=12345