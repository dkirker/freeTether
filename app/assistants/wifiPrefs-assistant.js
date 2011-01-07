function maskTxt(txt, char) {
  var mask = "";
  for (var i=0; i<txt.length; i++)
    mask = mask + char;
  return mask;
}

function WifiPrefsAssistant() {

  this.cookie = new preferenceCookie();
  this.prefs = this.cookie.get();
  
  this.masks = ['*','•'];
  
  this.securityModel =
  {
    value: this.prefs.security,
    choices: []
  };
  
  Mojo.Log.error("@#@#@#@#@#@#@#@#@#@#@#@#@#@#@#@#@#@#@");
  Mojo.Log.error(this.prefs.passphraseVisible);
  Mojo.Log.error("@#@#@#@#@#@#@#@#@#@#@#@#@#@#@#@#@#@#@");
  
  this.passphraseModel =
  {
    value: this.prefs.passphraseVisible ? this.prefs.passphrase : maskTxt(this.prefs.passphrase,this.masks[1]),
    disabled: true,
  }
  
}

WifiPrefsAssistant.prototype.setup = function() {

  this.controller.document.body.className = 'palm-dark';
  
  this.network                  = this.controller.get('network');
  this.passphrase               = this.controller.get('passphrase');
  this.security                 = this.controller.get('security');
  
  this.securityRow              = this.controller.get('security-row');
  this.passphraseRow            = this.controller.get('passphrase-row');
  this.passphraseButton         = this.controller.get('passphraseButton');

  this.securityChangedHandler   = this.securityChanged.bindAsEventListener(this);
  this.textChanged              = this.textChanged.bindAsEventListener(this);
  
  this.controller.setupWidget(
    'network',
    {
      multiline: false,
      enterSubmits: false,
      hintText: 'Required',
      modelProperty: 'network',
      textCase: Mojo.Widget.steModeLowerCase,
      focusMode: Mojo.Widget.focusSelectMode
    },
    this.prefs
  );
  Mojo.Event.listen(this.network, Mojo.Event.propertyChange, this.textChanged);
  
  this.controller.setupWidget(
    'security',
    {
      label: 'Security',
      choices: [
          {label:'Open', value:'Open'},
          {label:'WPA2 Personal', value:'WPA2Personal'},
      ],
      modelProperty: 'security'
    },
    this.prefs
  );
  Mojo.Event.listen(this.security, Mojo.Event.propertyChange, this.securityChangedHandler);
  
  this.controller.setupWidget(
    'passphrase',
    {
      multiline: false,
      enterSubmits: false,
      textCase: Mojo.Widget.steModeLowerCase,
      focusMode: Mojo.Widget.focusSelectMode
    },
    this.passphraseModel
  );
  Mojo.Event.listen(this.passphrase, Mojo.Event.tap, this.togglePassphrase.bindAsEventListener(this));
  
  this.controller.setupWidget(
    'passphraseButton',
    {},
    {
      label : "Set Passphrase",
      disabled: false
    }
  );
  Mojo.Event.listen(this.passphraseButton, Mojo.Event.tap, this.setPassphrase.bindAsEventListener(this));
  
  this.updateSecurityWidgets();

};

WifiPrefsAssistant.prototype.updateSecurityWidgets = function() {
  if (this.prefs.security == 'Open') {
    this.passphraseRow.style.display = 'none';
    this.securityRow.className = 'palm-row last';
  } else {
    this.passphraseRow.style.display = '';
    this.securityRow.className = 'palm-row';
  }
}

WifiPrefsAssistant.prototype.securityChanged = function(event) {
  Mojo.Log.error("security changed " + this.prefs.security);
  this.cookie.put(this.prefs);
  this.updateSecurityWidgets();
}

WifiPrefsAssistant.prototype.textChanged = function(event) {
  this.cookie.put(this.prefs);
}

WifiPrefsAssistant.prototype.updatePassphrase = function(event) {

  this.passphraseModel.value = this.prefs.passphraseVisible ? this.prefs.passphrase : maskTxt(this.prefs.passphrase,this.masks[1]);
  this.controller.modelChanged(this.passphraseModel, this);    

}

WifiPrefsAssistant.prototype.togglePassphrase = function(event) {

  this.prefs.passphraseVisible = !this.prefs.passphraseVisible;
  this.updatePassphrase();
  this.cookie.put(this.prefs); 

}

WifiPrefsAssistant.prototype.setPassphrase = function(event) {

  this.controller.showDialog({
    template: 'templates/passphrase',
    assistant: new SetPassphraseAssistant(this)
  });

}

WifiPrefsAssistant.prototype.setNewPassphrase = function(pass) {
  this.prefs.passphrase = pass;
  this.updatePassphrase();
  this.cookie.put(this.prefs); 
}

WifiPrefsAssistant.prototype.activate = function(event) {
};

WifiPrefsAssistant.prototype.deactivate = function(event) {
  var tmp = prefs.get(true);
};

WifiPrefsAssistant.prototype.cleanup = function(event) {
};
