# Engines & Models

Engines are the providers of the AI model

Engines store the information multiple models may use and often communicate to the same endpoint.
For instance, Ollama models that are all for the same URL do not need different Engines and so having a shared engine means the user does not have to individually set the URL for the Model endpoint, and instead creates the idea of grouped models.

Grouping models does not limit the user to using only a single instance of an engine. A user can create multiple Ollama engines that point to different endpoints.
The engines can also be created for services like OpenAI which require authentication such as Tokens. Because the user is likely to use the same token for gpt 3.5 and gpt 4, it would be cumbersome for the user to need to set the token for each. So instead we use the engine to share the token between them.

## Creating an engine

- Create a folder with the respective name
- Create the Engine following either the OpenEngine or ClosedEngine Interface
- Create the Model with the respective interface (OpenModel or ClosedModel)
- Add the Engine to the EngineManager -> createEngine() switch statement
