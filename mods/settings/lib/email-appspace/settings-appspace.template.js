module.exports = EmailAppspaceTemplate = (app) => {
  return `

      <div class="email-appspace-settings">

        <b>Network Keys:</b>

	<div class="courier">	

          public:&nbsp;${app.wallet.returnPublicKey()}
          private: <input id="privatekey" type="password" value="${app.wallet.returnPrivateKey()}" class="password" />
          address: ${app.keys.returnIdentifierByPublicKey(app.wallet.returnPublicKey()) || "no address registered"}

        </div>

	<p></p> 

        <input type="button" id="reset-account-btn" class="reset-account-btn" value="Reset Account" />

      </div>
      <style type="text/css">
	.email-appspace-debug {
	  padding: 20px;
	  font-size: 1.2em;
	}
      </style>
  `;
}
