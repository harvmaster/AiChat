import { watch } from 'vue'
import { useRoute } from 'vue-router'

import { app } from 'boot/app'
import { OpenModel } from 'src/services/models'
import { OllamaModel, OllamaProvider } from 'src/services/models/ollama'

export const useModelFromURL = () => {
  const to = useRoute()

  watch(to, () => {
    modelFromURL()
  })

  const modelFromURL = () => {
    if (!to.query.model) return
    
    const modelString = atob(to.query.model as string)
    const model = JSON.parse(modelString) as unknown as OpenModel
    if (!model) return
    
    console.log('Found model in URL', model)

    /*
      ?model={"id": "12nsaknd2ms", "name": "urlTest", "model": "test", "provider": {"id": "12nsfds32f213cs", "name": "urlTest", "url": "https://test.url.com" }}
    */

    // add the model and provider if theyre new
    const providerExists = app.models.value.find(m => m.provider.id === model.provider.id)?.provider
    if (providerExists && providerExists.isClosed) return

    let provider = providerExists
    if (!providerExists) {
      const { id, name, url} = model.provider
      provider = new OllamaProvider(id, name, url )
    }

    const modelExists = app.models.value.find(m => m.id === model.id)
    if (!modelExists) {
      if (!provider) throw new Error('Provider does not exist')
      if (provider.type === 'ollama') {
        app.models.value.push(new OllamaModel(model.id, provider as OllamaProvider, Date.now(), JSON.stringify(model.advancedSettings), model.model))
      }
    }
    app.settings.value.selectedModel = app.models.value.find(m => m.id === model.id) || app.models.value[0]
  }

  // modelFromURL()

  return {
    checkURLForModel: modelFromURL
  }

}

export default useModelFromURL