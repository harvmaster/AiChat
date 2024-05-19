import { PortableModel } from "./types"

export const validatePortableModel = (model: PortableModel) => {
  if (!model.id) {
    throw new Error('Model must have an id')
  }
  if (!model.name) {
    throw new Error('Model must have a name')
  }
  if (!model.model) {
    throw new Error('Model must have a model')
  }
  if (!model.engine) {
    throw new Error('Model must have an engine')
  }

  if (!model.engine.id) {
    throw new Error('Model engine must have an id')
  }

  if (!model.engine.name) {
    throw new Error('Model engine must have a name')
  }

  if (!model.engine.type) {
    throw new Error('Model engine must have a type')
  }

  if (!model.engine.createdAt) {
    throw new Error('Model engine must have a createdAt')
  }
}

export const createPortableModelURL = (portableModel: PortableModel): string => {
  return `${window.location.origin}/#/?${btoa(JSON.stringify(portableModel))}`
}