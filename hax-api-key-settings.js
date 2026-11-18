import { html, LitElement } from 'lit'
import { DDDSuper } from '@haxtheweb/d-d-d/d-d-d.js'

class HaxApiKeySettings extends DDDSuper(LitElement) {
  render() {
    return html`<h1>API Key Settings</h1>`
  }
}

customElements.define('hax-api-key-settings', HaxApiKeySettings)
