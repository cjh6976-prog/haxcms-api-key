import { html, css, LitElement } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import { DDDSuper } from '@haxtheweb/d-d-d/d-d-d.js'

const keyField = { name: 'apiKey', label: 'API key', type: 'password', required: true }
const connectionFields = [keyField, { name: 'endpoint', label: 'API endpoint', type: 'url', required: true }, { name: 'model', label: 'Model', type: 'text' }]
const defaults = ['YouTube', 'Vimeo', 'GIPHY', 'Unsplash', 'Flickr', 'Anthropic'].map(name => ({
  id: name.toLowerCase(), name, builtin: true,
  fields: name === 'Anthropic' ? connectionFields : [keyField],
}))

export class HaxApiKeySettings extends DDDSuper(LitElement) {
  static properties = {
    definitions: { state: true }, settings: { state: true }, saved: { state: true },
    selected: { state: true }, message: { state: true },
  }

  constructor() {
    super()
    this.definitions = structuredClone(defaults)
    this.settings = Object.fromEntries(defaults.map(item => [item.id, { enabled: false, values: {} }]))
    this.saved = structuredClone(this.settings)
    this.selected = 'youtube'
    this.message = ''
  }

  static styles = [super.styles, css`
    :host { display: block; color: #262626; font-family: var(--ddd-font-navigation, sans-serif); }
    * { box-sizing: border-box; }
    button, input { font: inherit; }
    button { cursor: pointer; }
    button:disabled { cursor: default; opacity: .45; }
    button:focus-visible, input:focus-visible { outline: 3px solid #005fa9; outline-offset: 3px; }
    .shell { max-width: 1120px; margin: 40px auto; border: 1px solid #ccc; background: white; }
    .breadcrumb { padding: 18px 24px; background: var(--ddd-theme-default-coalyGray, #262626); color: white; font-size: 14px; }
    header { padding: 28px 32px; border-bottom: 1px solid #ddd; }
    h1 { font-size: 28px; margin: 0 0 10px; }
    h2 { font-size: 24px; margin: 0 0 10px; }
    p { line-height: 1.6; margin: 0; }
    .muted, .hint { color: #595959; }
    .demo { margin-top: 14px; font-size: 14px; }
    .workspace { display: grid; grid-template-columns: 260px 1fr; min-height: 480px; }
    nav { padding: 16px; background: #f5f5f5; border-right: 1px solid #ddd; }
    .provider { display: flex; justify-content: space-between; width: 100%; text-align: left; padding: 14px 12px; border: 0; background: transparent; color: inherit; border-radius: 4px; gap: 8px; }
    .provider[aria-current='true'] { background: #e2edf5; box-shadow: inset 3px 0 #005fa9; font-weight: bold; }
    .provider:hover { background: #e8e8e8; }
    .status { font-size: 12px; font-weight: normal; color: #595959; }
    .add { margin-top: 20px; width: 100%; }
    main { padding: 32px; min-width: 0; }
    .type { font-size: 13px; color: #595959; margin-bottom: 8px; }
    .toggle { display: flex; gap: 10px; align-items: center; margin: 28px 0; font-weight: bold; }
    input[type='checkbox'] { width: 20px; height: 20px; accent-color: #005fa9; }
    .field { display: block; margin: 22px 0; max-width: 560px; }
    .field span { display: block; margin-bottom: 9px; font-weight: bold; }
    input:not([type='checkbox']) { width: 100%; border: 1px solid #888; border-radius: 3px; padding: 12px; background: white; color: #262626; }
    .hint { font-size: 13px; margin-top: 10px; }
    footer { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 20px 32px; border-top: 1px solid #ddd; }
    .actions { display: flex; gap: 12px; }
    button.action { padding: 10px 18px; border: 1px solid #777; border-radius: 3px; background: white; color: #262626; }
    button.primary { background: var(--ddd-theme-default-link, #005fa9); border-color: transparent; color: white; }
    .remove { margin-top: 28px; }
    dialog { width: min(480px, calc(100vw - 32px)); border: 1px solid #888; border-radius: 6px; padding: 28px; }
    dialog::backdrop { background: #0008; }
    dialog .actions { justify-content: flex-end; margin-top: 24px; }
    @media (max-width: 650px) {
      .shell { margin: 0; border: 0; }
      .workspace { grid-template-columns: 1fr; }
      nav { border-right: 0; border-bottom: 1px solid #ddd; display: flex; flex-wrap: wrap; gap: 4px; }
      .provider { width: auto; gap: 12px; }
      .add { width: auto; margin-top: 0; }
      header, main { padding: 24px; }
      footer { padding: 20px 24px; flex-wrap: wrap; }
    }
  `]

  get dirty() {
    return JSON.stringify(this.settings) !== JSON.stringify(this.saved)
  }

  updateSetting(name, value) {
    const current = this.settings[this.selected]
    const next = name === 'enabled' ? { ...current, enabled: value }
      : { ...current, values: { ...current.values, [name]: value } }
    this.settings = { ...this.settings, [this.selected]: next }
    this.message = ''
  }

  save(event) {
    event.preventDefault()
    const invalid = this.definitions.find(provider => {
      const setting = this.settings[provider.id]
      return setting && setting.enabled && provider.fields.some(field => {
        const value = (setting.values[field.name] || '').trim()
        if (field.required && !value) return true
        if (field.type !== 'url' || !value) return false
        try { return !['http:', 'https:'].includes(new URL(value).protocol) }
        catch { return true }
      })
    })
    if (invalid) {
      this.selected = invalid.id
      this.message = `Complete the required fields and enter a valid HTTP or HTTPS endpoint for ${invalid.name}.`
      return
    }
    this.saved = structuredClone(this.settings)
    this.message = 'Demo settings saved for this session.'
  }

  discard() {
    this.settings = structuredClone(this.saved)
    if (!this.settings[this.selected]) this.selected = 'youtube'
    this.message = 'Changes discarded.'
  }

  addProvider(event) {
    event.preventDefault()
    const form = event.currentTarget
    const name = new FormData(form).get('name').trim()
    if (!name) {
      form.elements.namedItem('name').setCustomValidity('Enter a provider name.')
      form.reportValidity()
      return
    }
    const id = `custom-${crypto.randomUUID()}`
    this.definitions = [...this.definitions, { id, name, builtin: false, fields: connectionFields }]
    this.settings = { ...this.settings, [id]: { enabled: false, values: {} } }
    this.selected = id
    this.message = ''
    this.renderRoot.querySelector('dialog').close()
    form.reset()
  }

  removeProvider() {
    const provider = this.definitions.find(item => item.id === this.selected)
    if (provider.builtin) return
    const remaining = { ...this.settings }
    delete remaining[this.selected]
    this.settings = remaining
    this.selected = 'youtube'
    this.message = `${provider.name} removed from the draft.`
  }

  render() {
    const visible = this.definitions.filter(provider => this.settings[provider.id])
    const provider = visible.find(item => item.id === this.selected)
    const setting = this.settings[this.selected]
    return html`
      <section class="shell" aria-label="API key settings">
        <div class="breadcrumb">System settings / API keys</div>
        <header>
          <h1>API keys & providers</h1>
          <p class="muted">Manage the services available to your HAX site.</p>
          <p class="demo">Demo mode · Settings stay in memory until you reload. Use sample credentials.</p>
        </header>
        <form novalidate @submit=${this.save}>
          <div class="workspace">
            <nav aria-label="Providers">
              ${visible.map(item => html`
                <button class="provider" type="button" aria-current=${String(item.id === this.selected)} @click=${() => { this.selected = item.id; this.message = '' }}>
                  <span>${item.name}</span><span class="status">${this.settings[item.id].enabled ? 'Enabled' : 'Disabled'}</span>
                </button>
              `)}
              <button class="action add" type="button" @click=${() => this.renderRoot.querySelector('dialog').showModal()}>+ Add provider</button>
            </nav>
            <main>
              <p class="type">${provider.builtin ? 'Built-in provider' : 'Custom provider'}</p>
              <h2>${provider.name}</h2>
              <p class="muted">Configure this connection and control its availability.</p>
              <label class="toggle"><input type="checkbox" .checked=${setting.enabled} @change=${event => this.updateSetting('enabled', event.target.checked)}> Enable ${provider.name}</label>
              ${repeat(provider.fields, field => `${provider.id}-${field.name}`, field => html`
                <label class="field">
                  <span>${field.label}${field.required && setting.enabled ? ' *' : ''}</span>
                  <input type=${field.type} name=${field.name} .value=${setting.values[field.name] || ''} ?required=${field.required && setting.enabled} autocomplete="off" spellcheck="false" @input=${event => this.updateSetting(field.name, event.target.value)}>
                </label>
              `)}
              <p class="hint">${provider.builtin ? 'Built-in provider definitions are fixed. Update credentials or disable the provider.' : 'Custom connections use an API key, endpoint, and optional model.'}</p>
              ${!provider.builtin ? html`<button class="action remove" type="button" @click=${this.removeProvider}>Remove provider</button>` : ''}
            </main>
          </div>
          <footer>
            <p role="status">${this.message || (this.dirty ? 'Unsaved changes' : 'All changes saved')}</p>
            <div class="actions">
              <button class="action" type="button" ?disabled=${!this.dirty} @click=${this.discard}>Discard</button>
              <button class="action primary" type="submit" ?disabled=${!this.dirty}>Save changes</button>
            </div>
          </footer>
        </form>
        <dialog aria-labelledby="add-title">
          <form @submit=${this.addProvider}>
            <h2 id="add-title">Add provider</h2>
            <label class="field"><span>Provider name</span><input name="name" required maxlength="80" @input=${event => event.target.setCustomValidity('')}></label>
            <div class="actions">
              <button class="action" type="button" @click=${() => this.renderRoot.querySelector('dialog').close()}>Cancel</button>
              <button class="action primary" type="submit">Add provider</button>
            </div>
          </form>
        </dialog>
      </section>
    `
  }
}

customElements.define('hax-api-key-settings', HaxApiKeySettings)
