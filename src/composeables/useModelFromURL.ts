import { watch } from 'vue';
import { useRoute } from 'vue-router';

import { app } from 'boot/app';
import { PortableModel } from 'src/services/engines';
import { validatePortableModel } from 'src/services/engines/utils';
import { Notify } from 'quasar';

export const useModelFromURL = () => {
  const to = useRoute();

  watch(to, () => {
    modelFromURL();
  });

  const modelFromURL = () => {
    if (!to.query.model) return;

    const modelString = atob(to.query.model as string);
    const model = JSON.parse(modelString) as unknown as PortableModel;
    if (!model) return;

    console.log('Found model in URL', model);

    const addModel = (model: PortableModel) => {
      try {
        validatePortableModel(model);

        app.engineManager.value.importModel(model);
        app.settings.value.selectedModel = app.models.value.find((m) => m.id === model.id);
      } catch (err) {

        // Try to migrate from old provider format
        if (isProviderFormat(model)) {
          const migrrated = fromProviderformat(model as unknown as PortableModel_ProviderFormat);
          addModel(migrrated);

          return
        }

        Notify.create({
          message: 'Error importing model from URL\n ' + (err as Error).message,
          type: 'negative',
        });
        console.error(err)
      }
    }

    
    type PortableModel_ProviderFormat = {
      id: string;
      name: string;
      model: string;
      advancedSettings: any;
      provider: {
        id: string;
        name: string;
        type: string;
        url: string;
        createdAt: number;
      };
    }
    const isProviderFormat = (model: PortableModel | PortableModel_ProviderFormat): model is PortableModel_ProviderFormat => {
      return (model as PortableModel_ProviderFormat).provider !== undefined;
    }
    const fromProviderformat = (model: PortableModel_ProviderFormat): PortableModel => {
      return {
        id: model.id,
        name: model.name || model.model,
        model: model.model,
        advancedSettings: model.advancedSettings || { temperature: 0.8 },
        engine: {
          id: model.provider.id,
          name: model.provider.name,
          type: model.provider.type,
          url: model.provider.url,
          createdAt: model.provider.createdAt || Date.now(),
        },
      };
    }


    addModel(model);

    /*
      ?model={"id": "12nsaknd2ms", "name": "urlTest", "model": "test", "provider": {"id": "12nsfds32f213cs", "name": "urlTest", "url": "https://test.url.com" }}
    */

    // add the model and provider if theyre new
    // const providerExists = app.models.value.find(
    //   (m) => m.provider.id === model.provider.id
    // )?.provider;
    // if (providerExists && providerExists.isClosed) return;

    // let provider = providerExists;
    // if (!providerExists) {
    //   const { id, name, url } = model.provider;
    //   provider = new OllamaProvider(id, name, url);
    // }

    // const modelExists = app.models.value.find((m) => m.id === model.id);
    // if (!modelExists) {
    //   if (!provider) throw new Error('Provider does not exist');
    //   if (provider.type === 'ollama') {
    //     app.models.value.push(
    //       new OllamaModel(
    //         model.id,
    //         provider as OllamaProvider,
    //         Date.now(),
    //         JSON.stringify(model.advancedSettings),
    //         model.model
    //       )
    //     );
    //   }
    // }
    // app.settings.value.selectedModel =
    //   app.models.value.find((m) => m.id === model.id) || app.models.value[0];
  };

  // modelFromURL()

  return {
    checkURLForModel: modelFromURL,
  };
};

export default useModelFromURL;
